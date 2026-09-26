import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { api, toast } from '../api'

const EMPTY_FORM = { name: '', email: '', role: 'viewer' }

export default function Users() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 })

  async function load() {
    try {
      const qs = new URLSearchParams()
      if (keyword.trim()) qs.set('q', keyword.trim())
      if (filterRole) qs.set('role', filterRole)
      const query = qs.toString()
      setData(await api.get('/api/users' + (query ? '?' + query : '')))
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  async function submit() {
    try {
      if (editingId) {
        await api.put('/api/users/' + editingId, form)
        toast('更新成功')
      } else {
        await api.post('/api/users', form)
        toast('新增成功')
      }
      resetForm()
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function startEdit(id) {
    const user = await api.get('/api/users/' + id)
    setForm({ name: user.name, email: user.email, role: user.role })
    setEditingId(id)
  }

  async function remove(id) {
    if (!confirm('确认删除该用户？')) return
    try {
      await api.del('/api/users/' + id)
      toast('已删除')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <>
      <Navbar current="users.html" />
      <div className="container">
        <h1>用户管理</h1>
        <p className="subtitle">
          数据来自 HTTP 云函数 <code>http-demo</code> 的 <code>/api/users</code>（内存存储）
        </p>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{editingId ? '编辑用户 #' + editingId : '新增 / 编辑用户'}</h2>
          <div className="row grow">
            <input placeholder="姓名" maxLength={40} value={form.name} onChange={setField('name')} />
            <input placeholder="邮箱" maxLength={80} value={form.email} onChange={setField('email')} />
            <select value={form.role} onChange={setField('role')}>
              <option value="viewer">viewer</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={submit}>{editingId ? '保存' : '新增'}</button>
            {editingId && (
              <button className="ghost" onClick={resetForm}>
                取消编辑
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="row grow" style={{ marginBottom: 12 }}>
            <input
              placeholder="搜索姓名或邮箱"
              maxLength={40}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">全部角色</option>
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
            <button className="ghost" onClick={load}>
              查询
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>创建时间</th>
                <th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge">{u.role}</span></td>
                  <td className="muted">{String(u.createdAt).slice(0, 10)}</td>
                  <td>
                    <button className="ghost" onClick={() => startEdit(u.id)}>编辑</button>{' '}
                    <button className="danger" onClick={() => remove(u.id)}>删除</button>
                  </td>
                </tr>
              ))}
              {!data.items.length && (
                <tr>
                  <td colSpan={6} className="muted">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="muted">
            共 {data.total} 条，第 {data.page} 页 / 每页 {data.pageSize} 条
          </p>
        </div>
      </div>
    </>
  )
}
