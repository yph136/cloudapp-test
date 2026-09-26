# cloudapp-test

CloudBase（腾讯云开发）示例工程：React 多页面前端 + 多个云函数接口。
前端使用 React 18 + Vite 多页构建，产物为纯静态文件，部署到静态托管。

## 目录结构

```
cloudapp-test/
├── cloudbaserc.json          # 环境与云函数配置
├── functions/                # 云函数
│   ├── hello/                # 事件型函数（exports.main），网关 /api-demo
│   └── http-demo/            # HTTP 型函数（Node HTTP server），网关 /api-http
└── frontend/                 # React 前端工程（Vite 多页构建）
    ├── package.json          # 依赖与脚本（dev / build / preview）
    ├── vite.config.js        # 多页入口、base './'、dev 代理
    ├── index.html            # 首页入口（标注 React 实现）
    ├── users.html            # 用户管理入口
    ├── todos.html            # 待办清单入口
    ├── about.html            # 关于项目入口
    ├── src/
    │   ├── main/             # 4 个页面的挂载入口
    │   ├── pages/            # Home / Users / Todos / About 组件
    │   ├── components/       # Navbar 导航组件
    │   ├── api.js            # 请求封装（支持 ?apiBase= 切换基址）
    │   └── styles.css        # 全局样式
    └── dist/                 # npm run build 产物（构建后生成，已 gitignore）
```

## 页面清单

| 页面 | 说明 | 依赖接口 |
| --- | --- | --- |
| `index.html` | 首页与实时概览（含「React 实现」徽标） | `/api/stats`、`/api-demo` |
| `users.html` | 用户增删改查、搜索、分页 | `/api/users` |
| `todos.html` | 待办新增、完成切换、清空已完成、统计 | `/api/todos`、`/api/todos/stats` |
| `about.html` | 目录结构与接口清单 | - |

## 接口

### HTTP 型云函数 `http-demo`（网关 `/api-http`）

单函数内实现多组 REST API，函数内部按「资源名 × 子路径 × method × query」精确分发，
并自动剥离 `api` / `api-http` / `http-demo` 路径前缀（网关透传或重写均兼容）。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/users` | 用户列表，支持 `q` / `role` / `page` / `pageSize` |
| POST | `/api/users` | 新增用户（name、email 必填） |
| GET | `/api/users/:id` | 用户详情 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| GET | `/api/todos` | 待办列表，支持 `status=all|active|done`、`q` |
| POST | `/api/todos` | 新增待办 |
| PUT | `/api/todos/:id` | 更新待办 / 切换完成 |
| DELETE | `/api/todos/:id` | 删除待办 |
| DELETE | `/api/todos?done=true` | 清空已完成 |
| GET | `/api/todos/stats` | 待办统计 |
| GET | `/api/stats` | 服务总览指标 |

### 事件型云函数 `hello`（网关 `/api-demo`）

通过 `action` 区分接口：`greet`、`time`、`echo`、`sum`、`env`。
action 可从 event 顶层、POST body、query 或 URL 路径末段解析：

```bash
curl -X POST https://<网关域名>/api-demo -d '{"action":"sum","numbers":[1,2,3]}'
```

## 本地开发

### 1. 启动 API（http-demo）

```bash
node functions/http-demo/index.js        # 监听 9000 端口
```

> 注意：若本机用户主目录存在 `"type": "module"` 的 package.json，
> 直接运行会因 CommonJS 被识别为 ESM 而报错，需在隔离目录运行（云端部署不受影响）。

### 2. 启动前端（Vite 开发模式）

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173，/api 与 /api-demo 自动代理到 127.0.0.1:9000
```

## 构建与部署

```bash
cd frontend
npm install
npm run build      # 构建静态产物到 frontend/dist/
npm run preview    # 本地预览构建产物
```

产物特点：

- 页面 URL 为 `index.html` / `users.html` / `todos.html` / `about.html`
- 资源相对路径（`base: './'`），可部署到任意 `deployPath`（`/`、`/web` 等）
- React 运行时以共享 chunk 抽出，4 个页面复用

部署时将 `frontend/dist/` 作为静态站点托管即可：
在 `cloudbaserc.json` 的 `hosting` 中将 root 指向 `frontend/dist`，
或直接将 `frontend/dist/` 内容上传到静态托管根目录。

### 接口基址

前端默认按同源 `/api`、`/api-demo` 调用。若网关把 `/api-http` 前缀透传给云函数，
接口实际路径为 `/api-http/api/users`，页面访问时加 `?apiBase=/api-http` 即可切换接口基址。

## 说明

- 示例数据保存在云函数进程内存中，实例回收后会重置为初始数据。
- 所有接口均为精确字符串匹配（无正则 / 通配 / 模糊路由），未知路径返回 404。
- 当前 `cloudbaserc.json` 仅包含函数配置；托管（hosting）与网关（gateway）配置需自行补充。
