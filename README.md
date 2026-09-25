# cloudapp-test

CloudBase（腾讯云开发）最小示例工程：多个静态页面 + 多个云函数接口。
目录结构保持为 `cloudbaserc.json` + `functions/` + `site/` + `cloudbase/migrations/`。

## 页面（site/，静态托管）

| 页面 | 说明 | 依赖接口 |
| --- | --- | --- |
| `index.html` | 首页与实时概览 | `/api/stats`、`/api-demo` |
| `users.html` | 用户增删改查、搜索、分页 | `/api/users` |
| `todos.html` | 待办新增、完成切换、清空、统计 | `/api/todos`、`/api/todos/stats` |
| `about.html` | 目录结构与接口清单 | - |

共用样式与脚本：`common.css`、`common.js`。

## 接口

HTTP 型云函数 `http-demo`（网关路径 `/api-http`）：

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

事件型云函数 `hello`（网关路径 `/api-demo`），通过 `action` 区分：`greet`、`time`、`echo`、`sum`、`env`。

```bash
curl -X POST https://<网关域名>/api-demo -d '{"action":"sum","numbers":[1,2,3]}'
```

## 部署

```bash
tcb deploy                 # 部署全部资源
tcb fn deploy http-demo    # 仅部署 HTTP 型云函数
tcb hosting deploy web /   # 仅部署静态站点
```

若网关把 `/api-http` 前缀透传给云函数，接口实际路径为 `/api-http/api/users`，
页面访问时加 `?apiBase=/api-http` 即可切换接口基址。

## 说明

- 示例数据保存在云函数进程内存中，实例回收后会重置。
- 数据库迁移脚本位于 `cloudbase/migrations/`，当前演示接口未连接数据库。
