import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { api, toast } from '../api'

const FILTERS = [
  ['all', '全部'],
  ['active', '未完成'],
  ['done', '已完成']
]

export default function Todos() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('normal')
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)

  async function loadTodos() {
    try {
      const data = await api.get('/api/todos?status=' + filter)
      setItems(data.items)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function loadStats() {
    try {
      setStats(await api.get('/api/todos/stats'))
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  useEffect(() => {
    loadTodos()
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function add() {
    if (!title.trim()) return toast('请输入待办内容', 'error')
    try {
      await api.post('/api/todos', { title: title.trim(), priority })
      setTitle('')
      toast('已添加')
      loadTodos()
      loadStats()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function toggle(id, done) {
    await api.put('/api/todos/' + id, { done })
    loadTodos()
    loadStats()
  }

  async function remove(id) {
    await api.del('/api/todos/' + id)
    toast('已删除')
    loadTodos()
    loadStats()
  }

  async function clearDone() {
    if (!confirm('确认清空所有已完成的待办？')) return
    try {
      await api.del('/api/todos?done=true')
      toast('已清空')
      loadTodos()
      loadStats()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <>
      <Navbar current="todos.html" />
      <div className="container">
        <h1>待办清单</h1>
        <p className="subtitle">
          数据来自 HTTP 云函数 <code>http-demo</code> 的 <code>/api/todos</code>（内存存储）
        </p>

        <div className="card">
          <div className="row grow">
            <input
              placeholder="要做点什么？"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="low">low</option>
            </select>
            <button onClick={add}>添加</button>
          </div>
        </div>

        <div className="card">
          {stats && (
            <div className="stats">
              <div className="stat"><b>{stats.total}</b><span>全部</span></div>
              <div className="stat"><b>{stats.active}</b><span>未完成</span></div>
              <div className="stat"><b>{stats.done}</b><span>已完成</span></div>
              <div className="stat"><b>{stats.byPriority.high}</b><span>高优先级</span></div>
            </div>
          )}
          <div className="row" style={{ marginBottom: 12 }}>
            {FILTERS.map(([v, label]) => (
              <button
                key={v}
                className="ghost"
                style={filter === v ? { color: '#05998c', borderColor: '#06b6a4' } : undefined}
                onClick={() => setFilter(v)}
              >
                {label}
              </button>
            ))}
            <button className="danger" onClick={clearDone}>清空已完成</button>
          </div>
          <ul className="list">
            {items.map((t) => (
              <li key={t.id} className={t.done ? 'done' : ''}>
                <input type="checkbox" checked={t.done} onChange={(e) => toggle(t.id, e.target.checked)} />
                <span className="title">{t.title}</span>
                <span className="badge">{t.priority}</span>
                <button className="danger" onClick={() => remove(t.id)}>删除</button>
              </li>
            ))}
            {!items.length && <li className="muted">暂无数据</li>}
          </ul>
        </div>
      </div>
    </>
  )
}
