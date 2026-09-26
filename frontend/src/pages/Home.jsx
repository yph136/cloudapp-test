import { useState } from 'react'
import Navbar from '../components/Navbar'
import { api, toast, API_BASE } from '../api'

const TILES = [
  { href: './users.html', title: '用户管理', desc: '调用 /api/users 完成增删改查与搜索分页' },
  { href: './todos.html', title: '待办清单', desc: '调用 /api/todos，支持完成切换与统计' },
  { href: './about.html', title: '关于项目', desc: '目录结构、接口清单与部署方式' }
]

export default function Home() {
  const [stats, setStats] = useState(null)
  const [output, setOutput] = useState('点击上方按钮发起请求…')

  async function loadStats() {
    try {
      const data = await api.get('/api/stats')
      setStats(data)
      setOutput(JSON.stringify(data, null, 2))
    } catch (e) {
      toast(e.message, 'error')
      setOutput(String(e.message))
    }
  }

  async function loadHello() {
    try {
      const data = await api.post('/api-demo', { action: 'greet', name: 'CloudBase' })
      setOutput(JSON.stringify(data, null, 2))
      toast('事件型函数调用成功')
    } catch (e) {
      toast(e.message, 'error')
      setOutput(String(e.message))
    }
  }

  return (
    <>
      <Navbar current="index.html" />
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>Hello from CloudBase Hosting</h1>
          <p className="subtitle">静态托管 + 云函数 + 网关 的完整示例</p>
          <p>
            <span className="badge react">React 实现</span>{' '}
            <span className="badge">4 个页面 · 6 组 API</span>
          </p>
        </div>

        <h2>页面导航</h2>
        <div className="grid">
          {TILES.map((t) => (
            <a className="tile" key={t.href} href={t.href}>
              <strong>{t.title}</strong>
              <span>{t.desc}</span>
            </a>
          ))}
        </div>

        <h2>实时接口概览（GET /api/stats）</h2>
        <div className="card">
          <div className="row" style={{ marginBottom: 12 }}>
            <button onClick={loadStats}>刷新统计</button>
            <button className="ghost" onClick={loadHello}>
              调用事件型函数 /api-demo
            </button>
            <span className="muted">
              接口基址：<code>{API_BASE || '(同源)'}</code>
            </span>
          </div>
          {stats && (
            <div className="stats">
              <div className="stat"><b>{stats.users.total}</b><span>用户总数</span></div>
              <div className="stat"><b>{stats.todos.total}</b><span>待办总数</span></div>
              <div className="stat"><b>{stats.todos.active}</b><span>未完成</span></div>
              <div className="stat"><b>{stats.uptime}</b><span>运行时长</span></div>
            </div>
          )}
          <pre>{output}</pre>
        </div>
      </div>
    </>
  )
}
