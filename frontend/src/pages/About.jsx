import Navbar from '../components/Navbar'

const TREE = `cloudapp-test/
├── cloudbaserc.json          # 环境、函数、托管与网关配置
├── frontend/                 # React 工程（Vite 多页构建，产物 dist/）
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html / users.html / todos.html / about.html   # 4 个入口页
│   └── src/                  # 页面组件、公共样式与请求封装
├── functions/                # 云函数
│   ├── hello/                # 事件型函数：/api-demo
│   └── http-demo/            # HTTP 型函数：/api-http
├── site/                     # 原生 HTML/CSS/JS 静态站点（与 React 版效果一致）
└── cloudbase/migrations/     # PostgreSQL 迁移脚本`

const PAGES = [
  ['index.html', '首页与实时概览', '/api/stats、/api-demo'],
  ['users.html', '用户增删改查、搜索分页', '/api/users'],
  ['todos.html', '待办新增、完成切换、统计', '/api/todos、/api/todos/stats'],
  ['about.html', '结构与接口说明', '-']
]

const APIS = [
  ['GET', '/api/health', '健康检查'],
  ['GET', '/api/users', '用户列表（q / role / page / pageSize）'],
  ['POST', '/api/users', '新增用户'],
  ['GET', '/api/users/:id', '用户详情'],
  ['PUT', '/api/users/:id', '更新用户'],
  ['DELETE', '/api/users/:id', '删除用户'],
  ['GET', '/api/todos', '待办列表（status / q）'],
  ['POST', '/api/todos', '新增待办'],
  ['PUT', '/api/todos/:id', '更新待办 / 切换完成'],
  ['DELETE', '/api/todos/:id', '删除待办'],
  ['DELETE', '/api/todos?done=true', '清空已完成'],
  ['GET', '/api/todos/stats', '待办统计'],
  ['GET', '/api/stats', '服务总览指标'],
  ['POST', '/api-demo', '事件型函数，action: greet / time / echo / sum / env']
]

const COMMANDS = `cd frontend
npm install
npm run build      # 构建静态产物到 frontend/dist/
npm run preview    # 本地预览构建产物

# 本地开发（自动代理 /api 到 127.0.0.1:9000 的 http-demo）
node ../functions/http-demo/index.js   # 先起 API
npm run dev`

export default function About() {
  return (
    <>
      <Navbar current="about.html" />
      <div className="container">
        <h1>关于项目</h1>
        <p className="subtitle">
          一个最小可用的 CloudBase 示例：多页面静态托管 + 多接口云函数
          （当前页面为 <span className="badge react">React 实现</span>）
        </p>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>目录结构</h2>
          <pre>{TREE}</pre>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>页面清单</h2>
          <table>
            <thead><tr><th>页面</th><th>说明</th><th>依赖接口</th></tr></thead>
            <tbody>
              {PAGES.map(([page, desc, apis]) => (
                <tr key={page}>
                  <td><a href={'./' + page}>{page}</a></td>
                  <td>{desc}</td>
                  <td className="muted">{apis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>接口清单</h2>
          <table>
            <thead><tr><th>方法</th><th>路径</th><th>说明</th></tr></thead>
            <tbody>
              {APIS.map(([method, path, desc]) => (
                <tr key={method + path}>
                  <td>{method}</td>
                  <td><code>{path}</code></td>
                  <td className="muted">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted">
            网关把 <code>/api-http</code> 指向 <code>http-demo</code>；若网关透传原始路径，
            访问时使用 <code>/api-http/api/users</code>，页面可通过 <code>?apiBase=/api-http</code> 切换接口基址。
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>构建与部署（React 版）</h2>
          <pre>{COMMANDS}</pre>
          <p className="muted">
            构建产物 <code>frontend/dist/</code> 与 <code>site/</code> 页面 URL 完全一致，
            可直接把托管的 root 指向 dist，或复制 dist 内容覆盖 site。数据保存在云函数进程内存中，实例回收后会重置。
          </p>
        </div>
      </div>
    </>
  )
}
