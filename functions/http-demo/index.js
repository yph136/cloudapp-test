'use strict'

/**
 * HTTP 型云函数（http-demo）
 * 单个函数内提供多个 REST API：health / users / todos / stats
 * 网关路径 /api-http 无论是透传还是重写，下面的 normalize 都能兼容。
 */
const http = require('http')

// ---------------------------------------------------------------- 内存数据
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', createdAt: '2026-09-01T02:00:00.000Z' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: 'editor', createdAt: '2026-09-02T06:30:00.000Z' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: 'viewer', createdAt: '2026-09-03T09:15:00.000Z' }
]
const USER_ROLES = ['admin', 'editor', 'viewer']
let userSeq = 4

let todos = [
  { id: 1, title: '阅读 CloudBase 云函数文档', done: true, priority: 'low', createdAt: '2026-09-10T01:00:00.000Z' },
  { id: 2, title: '部署静态托管站点', done: false, priority: 'high', createdAt: '2026-09-11T03:20:00.000Z' },
  { id: 3, title: '为 http-demo 补充更多 API', done: false, priority: 'normal', createdAt: '2026-09-12T08:45:00.000Z' }
]
const TODO_PRIORITIES = ['low', 'normal', 'high']
let todoSeq = 4

// ---------------------------------------------------------------- 工具方法
function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  })
  res.end(status === 204 ? '' : JSON.stringify(data))
}

function readJson(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      if (raw.length < 1e6) raw += chunk // 限制请求体大小，避免超大 payload
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (_) {
        resolve(null)
      }
    })
  })
}

// 剥离网关/函数名前缀，得到 ["users", "1"] 这样的资源路径
function parsePath(rawUrl) {
  const segments = decodeURIComponent((rawUrl || '/').split('?')[0])
    .split('/')
    .filter(Boolean)
  while (segments.length && ['api', 'api-http', 'http-demo'].includes(segments[0])) segments.shift()
  return segments
}

function parseQuery(rawUrl) {
  return new URL(rawUrl || '/', 'http://localhost').searchParams
}

function validateUser(payload) {
  if (!payload || typeof payload !== 'object') return '请求体必须是 JSON 对象'
  if (payload.name !== undefined && !String(payload.name).trim()) return 'name 不能为空'
  if (payload.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.email))) return 'email 格式不正确'
  if (payload.role !== undefined && !USER_ROLES.includes(payload.role)) return `role 只能是 ${USER_ROLES.join(' / ')}`
  return null
}

function validateTodo(payload) {
  if (!payload || typeof payload !== 'object') return '请求体必须是 JSON 对象'
  if (payload.title !== undefined && !String(payload.title).trim()) return 'title 不能为空'
  if (payload.title !== undefined && String(payload.title).length > 120) return 'title 长度不能超过 120'
  if (payload.priority !== undefined && !TODO_PRIORITIES.includes(payload.priority)) return `priority 只能是 ${TODO_PRIORITIES.join(' / ')}`
  return null
}

// ---------------------------------------------------------------- 业务处理
function handleIndex() {
  return {
    service: 'http-demo',
    type: 'HTTP',
    time: new Date().toISOString(),
    apis: [
      { method: 'GET', path: '/api/health', desc: '健康检查' },
      { method: 'GET', path: '/api/users', desc: '用户列表，支持 q / role / page / pageSize' },
      { method: 'POST', path: '/api/users', desc: '新增用户' },
      { method: 'GET', path: '/api/users/:id', desc: '用户详情' },
      { method: 'PUT', path: '/api/users/:id', desc: '更新用户' },
      { method: 'DELETE', path: '/api/users/:id', desc: '删除用户' },
      { method: 'GET', path: '/api/todos', desc: '待办列表，支持 status / q' },
      { method: 'POST', path: '/api/todos', desc: '新增待办' },
      { method: 'PUT', path: '/api/todos/:id', desc: '更新待办（可切换 done）' },
      { method: 'DELETE', path: '/api/todos/:id', desc: '删除待办' },
      { method: 'DELETE', path: '/api/todos?done=true', desc: '清空已完成' },
      { method: 'GET', path: '/api/todos/stats', desc: '待办统计' },
      { method: 'GET', path: '/api/stats', desc: '服务总览指标' }
    ]
  }
}

async function handleUsers(req, res, segments, qs) {
  const id = segments[1] ? Number(segments[1]) : null

  if (req.method === 'GET' && !id) {
    const keyword = (qs.get('q') || '').trim().toLowerCase()
    const role = qs.get('role')
    const page = Math.max(1, Number(qs.get('page') || 1))
    const pageSize = Math.min(50, Math.max(1, Number(qs.get('pageSize') || 10)))

    const filtered = users.filter((u) => {
      const matchKeyword = !keyword || u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
      const matchRole = !role || u.role === role
      return matchKeyword && matchRole
    })
    return send(res, 200, {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      roles: USER_ROLES
    })
  }

  if (req.method === 'GET') {
    const user = users.find((u) => u.id === id)
    return user ? send(res, 200, user) : send(res, 404, { error: '用户不存在' })
  }

  if (req.method === 'POST') {
    const payload = await readJson(req)
    if (!payload) return send(res, 400, { error: 'JSON 解析失败' })
    const error = validateUser(payload)
    if (error) return send(res, 400, { error })
    if (!payload.name || !payload.email) return send(res, 400, { error: 'name 与 email 为必填项' })
    if (users.some((u) => u.email === payload.email)) return send(res, 409, { error: '邮箱已被占用' })

    const user = {
      id: userSeq++,
      name: String(payload.name).trim(),
      email: String(payload.email).trim(),
      role: payload.role || 'viewer',
      createdAt: new Date().toISOString()
    }
    users.push(user)
    return send(res, 201, user)
  }

  if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return send(res, 404, { error: '用户不存在' })
    const payload = await readJson(req)
    if (!payload) return send(res, 400, { error: 'JSON 解析失败' })
    const error = validateUser(payload)
    if (error) return send(res, 400, { error })

    users[index] = {
      ...users[index],
      ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
      ...(payload.email !== undefined ? { email: String(payload.email).trim() } : {}),
      ...(payload.role !== undefined ? { role: payload.role } : {}),
      updatedAt: new Date().toISOString()
    }
    return send(res, 200, users[index])
  }

  if (req.method === 'DELETE' && id) {
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return send(res, 404, { error: '用户不存在' })
    const [removed] = users.splice(index, 1)
    return send(res, 200, removed)
  }

  return send(res, 405, { error: `不支持的请求：${req.method} ${req.url}` })
}

async function handleTodos(req, res, segments, qs) {
  // 统计子资源：GET /api/todos/stats
  if (req.method === 'GET' && segments[1] === 'stats') {
    const done = todos.filter((t) => t.done).length
    return send(res, 200, {
      total: todos.length,
      done,
      active: todos.length - done,
      byPriority: TODO_PRIORITIES.reduce((acc, p) => {
        acc[p] = todos.filter((t) => t.priority === p).length
        return acc
      }, {})
    })
  }

  const id = segments[1] ? Number(segments[1]) : null

  if (req.method === 'GET' && !id) {
    const status = qs.get('status') || 'all'
    const keyword = (qs.get('q') || '').trim().toLowerCase()
    const items = todos.filter((t) => {
      const matchStatus = status === 'all' || (status === 'done' ? t.done : !t.done)
      const matchKeyword = !keyword || t.title.toLowerCase().includes(keyword)
      return matchStatus && matchKeyword
    })
    return send(res, 200, { items, total: items.length })
  }

  if (req.method === 'GET') {
    const todo = todos.find((t) => t.id === id)
    return todo ? send(res, 200, todo) : send(res, 404, { error: '待办不存在' })
  }

  if (req.method === 'POST') {
    const payload = await readJson(req)
    if (!payload) return send(res, 400, { error: 'JSON 解析失败' })
    const error = validateTodo(payload)
    if (error) return send(res, 400, { error })
    if (!payload.title) return send(res, 400, { error: 'title 为必填项' })

    const todo = {
      id: todoSeq++,
      title: String(payload.title).trim(),
      done: Boolean(payload.done),
      priority: payload.priority || 'normal',
      createdAt: new Date().toISOString()
    }
    todos.push(todo)
    return send(res, 201, todo)
  }

  if ((req.method === 'PUT' || req.method === 'PATCH') && id) {
    const index = todos.findIndex((t) => t.id === id)
    if (index === -1) return send(res, 404, { error: '待办不存在' })
    const payload = await readJson(req)
    if (!payload) return send(res, 400, { error: 'JSON 解析失败' })
    const error = validateTodo(payload)
    if (error) return send(res, 400, { error })

    todos[index] = {
      ...todos[index],
      ...(payload.title !== undefined ? { title: String(payload.title).trim() } : {}),
      ...(payload.done !== undefined ? { done: Boolean(payload.done) } : {}),
      ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
      updatedAt: new Date().toISOString()
    }
    return send(res, 200, todos[index])
  }

  if (req.method === 'DELETE' && !id && qs.get('done') === 'true') {
    const removedCount = todos.filter((t) => t.done).length
    todos = todos.filter((t) => !t.done)
    return send(res, 200, { removed: removedCount, total: todos.length })
  }

  if (req.method === 'DELETE' && id) {
    const index = todos.findIndex((t) => t.id === id)
    if (index === -1) return send(res, 404, { error: '待办不存在' })
    const [removed] = todos.splice(index, 1)
    return send(res, 200, removed)
  }

  return send(res, 405, { error: `不支持的请求：${req.method} ${req.url}` })
}

function handleStats(res) {
  const done = todos.filter((t) => t.done).length
  return send(res, 200, {
    service: 'http-demo',
    time: new Date().toISOString(),
    users: { total: users.length, roles: USER_ROLES.map((r) => ({ role: r, count: users.filter((u) => u.role === r).length })) },
    todos: { total: todos.length, done, active: todos.length - done },
    uptime: process.uptime().toFixed(2) + 's'
  })
}

// ---------------------------------------------------------------- 路由
async function route(req, res) {
  const segments = parsePath(req.url)
  const qs = parseQuery(req.url)

  if (req.method === 'OPTIONS') return send(res, 204, {})

  switch (segments[0]) {
    case undefined:
      return send(res, 200, { ...handleIndex(), path: req.url, method: req.method })
    case 'health':
      return send(res, 200, { status: 'ok', service: 'http-demo', time: new Date().toISOString() })
    case 'users':
      return handleUsers(req, res, segments, qs)
    case 'todos':
      return handleTodos(req, res, segments, qs)
    case 'stats':
      return handleStats(res)
    default:
      return send(res, 404, { error: `接口不存在：${req.url}` })
  }
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    console.error('http-demo error:', err)
    send(res, 500, { error: '服务器内部错误' })
  })
})

const port = process.env.PORT || 9000
server.listen(port, () => console.log(`http-demo listening on ${port}`))
