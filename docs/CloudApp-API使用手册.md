# CloudApp 云应用（多应用场景） API 使用手册

> 本手册面向需要通过腾讯云 API 对 CloudApp 服务进行 **部署、发布、查询、管理** 以及 **自定义域名绑定与流量管理** 的客户与开发者。
> 手册中示例数据均为**脱敏占位值**，实际调用请替换为您自己的真实参数（占位符含义见 [3.4 示例占位符约定](#34-示例占位符约定)）。

---

## 目录

1. [产品概述](#1-产品概述)
2. [核心概念](#2-核心概念)
3. [接入准备](#3-接入准备)
4. [接口总览](#4-接口总览)
5. [快速开始：一次完整的部署发布流程](#5-快速开始一次完整的部署发布流程)
6. [接口详解：服务部署管理](#6-接口详解服务部署管理)
7. [接口详解：自定义域名管理](#7-接口详解自定义域名管理)
8. [典型场景操作指南](#8-典型场景操作指南)
9. [二次开发指南](#9-二次开发指南)
10. [附录：状态与字段说明](#10-附录状态与字段说明)

---

## 1. 产品概述

CloudApp 是腾讯云开发（CloudBase/TCB）提供的云应用部署服务。您只需提供一份代码仓库（或代码包）与一份部署描述（包含静态站点、HTTP 函数、事件函数及路由规则），服务即可完成：

- **云端构建**：拉取代码 → 安装依赖 → 构建 → 部署各服务单元
- **版本管理**：每次部署生成独立版本，支持查询、预览、删除
- **流量管理**：版本间流量切换（标准形态仅支持 `0` / `100`，即整体切换，不支持中间百分比灰度）
- **域名管理**：服务默认域名 + 自定义域名绑定，自定义域名可独立管理各版本流量

一次部署的完整生命周期：

```
CreateCloudApp（提交部署）
        │  返回 BuildId + VersionName
        ▼
DescribeCloudAppVersion（轮询构建状态）
        │  Status = SUCCESS / FAIL
        │  ├─ FAIL → DescribeCloudBaseRunBuildLog 排查日志
        │  └─ SUCCESS → 通过 VersionDomain 预览验证
        ▼
PromoteCloudAppVersion（发布 / 流量切换）
        │  流量 0 → 100（整体切换到目标版本）
        ▼
DescribeCloudAppList / DescribeCloudAppVersionList（查询与管理）
        │
        ▼
DeleteCloudAppVersion（清理历史版本）
```

---

## 2. 核心概念

| 概念 | 说明 |
| --- | --- |
| **EnvId** | 云开发环境 ID，如 `lowcode-xxxxxxxx` |
| **DeployType** | 部署类型，CloudApp 场景固定传 `cloudapp` |
| **ServiceName** | 云应用服务名，如 `cloudapp-demo`，同一环境内唯一 |
| **版本（VersionName）** | 每次部署自动生成，格式为 `{ServiceName}-{序号}`，如 `cloudapp-demo-001` |
| **BuildId** | 构建任务 ID，用于查询构建日志 |
| **服务单元（Service）** | 一个云应用由多个服务单元组成，类型见下表 |
| **路由（Routes）** | 同一域名下按路径前缀将流量分发到不同服务单元 |
| **VersionDomain** | 版本预览域名，构建成功后可独立访问该版本，不影响线上流量 |
| **Domain** | 服务默认域名，承载线上流量 |
| **TrafficPercent** | 版本流量占比，标准形态仅取 `0` 或 `100`；同一入口所有版本之和为 100 |
| **PromoteType** | 发布策略：`manual`（手动发布）/ `auto`（构建成功自动发布） |

**服务单元类型（ServiceType）：**

| ServiceType | 说明 | 典型 Identifier |
| --- | --- | --- |
| `static-hosting` | 静态网站托管，支持自定义安装/构建命令与产物目录 | 站点目录，如 `frontend` |
| `http-function` | HTTP 型云函数（常驻 HTTP Server） | 函数目录，如 `functions/http-demo` |
| `function` | 事件型云函数 | 函数目录，如 `functions/hello` |

---

## 3. 接入准备

### 3.1 调用协议

所有接口遵循腾讯云 API 3.0 规范（TC3 签名）：

- **协议**：HTTPS POST
- **域名**：`tcb.tencentcloudapi.com`
- **版本**：`X-TC-Version: 2018-06-08`

**公共请求头：**

| Header | 说明 | 示例 |
| --- | --- | --- |
| `Authorization` | TC3-HMAC-SHA256 签名，详见[腾讯云 API 签名文档](https://cloud.tencent.com/document/api/876/34809) | `TC3-HMAC-SHA256 Credential=...` |
| `Content-Type` | 固定 | `application/json` |
| `Host` | API 域名 | `tcb.tencentcloudapi.com` |
| `X-TC-Action` | 接口名称 | `CreateCloudApp` |
| `X-TC-Timestamp` | 当前时间戳（秒） | `1790413188` |
| `X-TC-Version` | API 版本 | `2018-06-08` |
| `X-TC-Language` | 语言 | `zh-CN` |

### 3.2 鉴权与密钥

调用前请在 [访问管理控制台](https://console.cloud.tencent.com/cam/capi) 获取 `SecretId` / `SecretKey`，并确保子账号已被授权云开发（TCB）相关操作权限。

### 3.3 推荐接入方式

- **直接 HTTP 调用**：自行实现 TC3 签名（适合网关/平台集成）
- **腾讯云 SDK**：Node.js（`tencentcloud-sdk-nodejs`）、Python（`tencentcloud-sdk-python`）、Go、Java 等均有官方 SDK，SDK 自动处理签名（推荐，见[第 9 章](#9-二次开发指南)）

> 下文 curl 示例中 `Authorization` 头省略签名内容，实际调用需携带完整 TC3 签名。

### 3.4 示例占位符约定

本手册示例中的以下值均为**脱敏占位**，请在实际调用时替换为您自己的真实参数：

| 占位符 | 含义 | 来源 |
| --- | --- | --- |
| `lowcode-xxxxxxxx` | 您的云开发环境 ID | 云开发控制台 |
| `cloudapp-demo` | 您的云应用服务名 | 自定义 |
| `cloudapp-demo-00x` | 版本名（由部署自动生成） | 接口返回 |
| `https://github.com/your-org/your-repo.git` | 您的代码仓库地址 | 自定义 |
| `www.example.com` | 您的自定义域名 | 自定义 |
| 响应中的 `RequestId`（`xxxxxxxx-xxxx-...`） | 请求唯一标识 | 接口返回 |
| 响应中的 `BuildId`（`10000001`） | 构建任务 ID | 接口返回 |
| 域名中的随机段（`xxxxxxxxxx`） | 版本预览域名的随机标识 | 接口返回 |

> 为便于串联阅读，全文采用统一的版本叙事：服务 `cloudapp-demo` 线上当前版本为 `cloudapp-demo-002`，本次新部署生成 `cloudapp-demo-003`，`cloudapp-demo-001` 为可清理的历史版本。

---

## 4. 接口总览

### 服务部署管理

| 接口 | 用途 | 关键入参 |
| --- | --- | --- |
| `CreateCloudApp` | 创建/部署云应用，触发一次云端构建 | EnvId, ServiceName, Source, ServiceList, Routes, PromoteType |
| `DescribeCloudAppVersion` | 查询单个版本详情（构建状态、步骤、资源、流量） | ServiceName, VersionName |
| `DescribeCloudAppList` | 查询环境下的云应用服务列表 | EnvId |
| `DescribeCloudAppInfo` | 查询单个服务详情（当前版本、默认域名、预览域名） | ServiceName |
| `DescribeCloudAppVersionList` | 查询服务的历史版本列表 | ServiceName |
| `DeleteCloudAppVersion` | 删除指定版本 | ServiceName, VersionName |
| `DescribeCloudBaseRunBuildLog` | 查询构建日志（排查构建失败） | BuildId |
| `PromoteCloudAppVersion` | 发布版本 / 调整默认域名流量权重 | ServiceName, VersionName, Weight |

### 自定义域名管理

| 接口 | 用途 | 关键入参 |
| --- | --- | --- |
| `CreateCloudAppDomain` | 绑定自定义域名并关联初始版本 | ServiceName, VersionName, Domain |
| `DescribeCloudAppDomainVersionRoutes` | 查询域名下各版本的流量分布 | ServiceName, Domain |
| `ModifyCloudAppDomainTraffic` | 调整域名下某版本流量（整体切换，0/100） | ServiceName, VersionName, TrafficPercent, Domain |
| `DeleteCloudAppDomainVersionRoute` | 移除域名下某版本的路由 | ServiceName, VersionName, Domain |

---

## 5. 快速开始：一次完整的部署发布流程

以下为一个最小可用的端到端流程（以服务 `cloudapp-demo` 部署新版本为例）。

**Step 1：提交部署**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: CreateCloudApp" -H "X-TC-Timestamp: 1790413188" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{
    "EnvId": "lowcode-xxxxxxxx",
    "DeployType": "cloudapp",
    "ServiceName": "cloudapp-demo",
    "Source": {
      "Type": "git",
      "Repo": "https://github.com/your-org/your-repo.git",
      "Ref": "main",
      "Channel": "github",
      "IsPrivate": true
    },
    "NodeJsVersion": "20",
    "ServiceList": [
      {
        "ServiceType": "static-hosting",
        "ServiceName": "web",
        "Identifier": "frontend",
        "Command": { "InstallCmd": "npm install", "BuildCmd": "npm run build" },
        "BuildContext": { "Path": "frontend", "OutPut": "dist" }
      },
      { "ServiceType": "http-function", "ServiceName": "http-demo", "Identifier": "functions/http-demo" },
      { "ServiceType": "function", "ServiceName": "hello", "Identifier": "functions/hello" }
    ],
    "Routes": [
      { "Source": "/api-demo", "ServiceType": "function", "ServiceName": "hello" },
      { "Source": "/api", "ServiceType": "http-function", "ServiceName": "http-demo" },
      { "Source": "/", "ServiceType": "static-hosting", "ServiceName": "web" }
    ],
    "PromoteType": "manual"
  }'
```

返回：

```json
{
  "Response": {
    "BuildId": "10000001",
    "VersionName": "cloudapp-demo-003",
    "ServiceName": "cloudapp-demo",
    "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Step 2：轮询构建状态**

用返回的 `VersionName` 调用 `DescribeCloudAppVersion`，直到 `Status` 变为 `SUCCESS`（成功）或 `FAIL`（失败）。构建过程通常包含以下步骤（`Steps` 字段）：检出代码仓库 → `web:install` → `web:build` → `web:deploy` → 各函数 deploy → `register`。

**Step 3：构建失败排查（可选）**

`Status = FAIL` 时，用 `BuildId` 调用 `DescribeCloudBaseRunBuildLog` 获取完整日志，定位失败步骤。

**Step 4：预览验证**

构建成功后，`DescribeCloudAppVersion` 返回 `VersionDomain`（如 `cloudapp-demo-xxxxxxxxxx-lowcode-xxxxxxxx.cloudapp.tcloudbase.com`），可直接访问验证，此时线上流量未受影响（`TrafficPercent: 0`）。

**Step 5：发布上线**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: PromoteCloudAppVersion" -H "X-TC-Timestamp: 1790412982" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{
    "EnvId": "lowcode-xxxxxxxx",
    "DeployType": "cloudapp",
    "ServiceName": "cloudapp-demo",
    "VersionName": "cloudapp-demo-003",
    "Weight": 100
  }'
```

返回 `DeployStatus: "CURRENT"`、`PrevVersionName`（上一线上版本）即发布完成。之后通过 `DescribeCloudAppInfo` 查看服务默认域名即可访问线上应用。

---

## 6. 接口详解：服务部署管理

### 6.1 CreateCloudApp — 创建并部署云应用

创建一个云应用（或对已有应用发起新版本部署），立即触发云端构建。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| EnvId | String | 是 | 环境 ID |
| DeployType | String | 是 | 固定 `cloudapp` |
| ServiceName | String | 是 | 服务名，环境内唯一 |
| Source | Object | 是 | 代码来源 |
| Source.Type | String | 是 | 代码类型，如 `git` |
| Source.Repo | String | 是 | 仓库地址 |
| Source.Ref | String | 是 | 分支 / Tag / Commit |
| Source.Channel | String | 否 | 托管平台，如 `github` |
| Source.IsPrivate | Boolean | 否 | 是否私有仓库 |
| NodeJsVersion | String | 否 | 构建使用的 Node 版本，如 `20` |
| ServiceList | Array | 是 | 服务单元列表（见下方） |
| Routes | Array | 是 | 路由规则：`Source`（路径前缀）+ `ServiceType` + `ServiceName` |
| PromoteType | String | 否 | `manual`（默认，手动发布）/ `auto`（构建成功后自动发布） |

**ServiceList 元素：**

| 字段 | 说明 |
| --- | --- |
| ServiceType | `static-hosting` / `http-function` / `function` |
| ServiceName | 服务单元名 |
| Identifier | 代码中的目录标识（相对仓库根） |
| Command.InstallCmd | 安装命令（仅 static-hosting 需要），如 `npm install` |
| Command.BuildCmd | 构建命令，如 `npm run build` |
| BuildContext.Path | 构建工作目录，如 `frontend` |
| BuildContext.OutPut | 构建产物目录，如 `dist` |

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| BuildId | 本次构建 ID，用于查询日志 |
| VersionName | 本次部署生成的版本名 |
| ServiceName | 服务名 |
| RequestId | 请求 ID |

**请求示例**：见[第 5 章 Step 1](#5-快速开始一次完整的部署发布流程)。

### 6.2 DescribeCloudAppVersion — 查询版本详情

查询指定版本的构建状态、构建步骤、部署资源、流量占比与预览域名。**这是部署后轮询状态的核心接口。**

**请求参数：**

| 参数 | 类型 | 必填 |
| --- | --- | --- |
| EnvId | String | 是 |
| DeployType | String | 是（`cloudapp`） |
| ServiceName | String | 是 |
| VersionName | String | 是 |

**响应参数（Response）：**

| 字段 | 说明 |
| --- | --- |
| Status | 构建状态：`BUILDING` / `SUCCESS` / `FAIL` |
| BuildId / BuildTime / BuildType | 构建 ID、时间、类型（如 `GIT`） |
| VersionDomain | 版本预览域名（构建成功后可访问） |
| TrafficPercent | 该版本当前流量占比（0~100） |
| Resources[] | 部署的资源列表：`ServiceName` / `ServiceType` / `DeployedRef`（部署后的版本引用，如 `web-025`）/ `DiffCategory`（`added` 新增 / `changed` 变更）/ `Status`（`staged` 已暂存待发布） |
| Steps[] | 构建步骤明细：`Name` / `Duration` / `Status`（success / fail） |
| Snapshot | 本次部署的完整快照（JSON 字符串），含 Source / ServiceList / Routes / PromoteType |
| StaticConfig | 静态托管构建配置详情 |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudAppVersion" -H "X-TC-Timestamp: 1790413308" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-003"}'
```

返回（节选）：

```json
{
  "Response": {
    "BuildId": "10000001",
    "BuildTime": "2026-09-26 17:01:21",
    "Status": "SUCCESS",
    "TrafficPercent": 0,
    "VersionDomain": "cloudapp-demo-xxxxxxxxxx-lowcode-xxxxxxxx.cloudapp.tcloudbase.com",
    "Resources": [
      { "ServiceName": "web", "ServiceType": "static-hosting", "DeployedRef": "web-025", "DiffCategory": "changed", "Status": "staged" },
      { "ServiceName": "http-demo", "ServiceType": "http-function", "DeployedRef": "18", "DiffCategory": "added", "Status": "staged" },
      { "ServiceName": "hello", "ServiceType": "function", "DeployedRef": "12", "DiffCategory": "added", "Status": "staged" }
    ],
    "Steps": [
      { "Name": "检出代码仓库", "Duration": "2847ms", "Status": "success" },
      { "Name": "web:install", "Duration": "2281ms", "Status": "success" },
      { "Name": "web:build", "Duration": "1214ms", "Status": "success" },
      { "Name": "web:deploy", "Duration": "15663ms", "Status": "success" },
      { "Name": "http-demo:deploy", "Duration": "24202ms", "Status": "success" },
      { "Name": "hello:deploy", "Duration": "21324ms", "Status": "success" },
      { "Name": "register", "Duration": "3773ms", "Status": "success" }
    ]
  }
}
```

### 6.3 DescribeCloudAppList — 查询服务列表

查询当前环境下所有云应用服务。

**请求参数：** `EnvId`、`DeployType`

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| Total | 服务总数 |
| ServiceList[] | 服务列表，每项含：`ServiceName` / `Domain`（默认域名）/ `CurrentVersion`（当前线上版本）/ `LatestVersionName` / `LatestStatus` / `LatestBuildTime` / `CreateTime` / `BuildConfig`（构建配置 JSON） |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudAppList" -H "X-TC-Timestamp: 1790408573" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp"}'
```

返回（节选）：

```json
{
  "Response": {
    "Total": 1,
    "ServiceList": [
      {
        "ServiceName": "cloudapp-demo",
        "Domain": "cloudapp-demo-lowcode-xxxxxxxx.cloudapp.tcloudbase.com",
        "CurrentVersion": "cloudapp-demo-002",
        "LatestVersionName": "cloudapp-demo-003",
        "LatestStatus": "SUCCESS",
        "LatestBuildTime": "2026-09-26 16:59:50",
        "CreateTime": "2026-09-20 16:59:48"
      }
    ]
  }
}
```

### 6.4 DescribeCloudAppInfo — 查询服务详情

查询单个服务的概要信息，**常用于获取服务默认域名与线上版本**。

**请求参数：** `EnvId`、`ServiceName`、`DeployType`

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| ServiceName | 服务名 |
| Domain | 服务默认域名（线上入口） |
| PreviewDomain | 预览域名 |
| CurrentVersion | 当前承接流量的线上版本 |
| LatestVersionName / LatestStatus / LatestBuildTime | 最新一次构建的版本 / 状态 / 时间 |
| BuildConfig | 构建配置（含 Source 与各步骤命令） |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudAppInfo" -H "X-TC-Timestamp: 1790408752" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","ServiceName":"cloudapp-demo","DeployType":"cloudapp"}'
```

返回（节选）：

```json
{
  "Response": {
    "ServiceName": "cloudapp-demo",
    "Domain": "cloudapp-demo-lowcode-xxxxxxxx.cloudapp.tcloudbase.com",
    "PreviewDomain": "cloudapp-demo-xxxxxxxxxx-lowcode-xxxxxxxx.cloudapp.tcloudbase.com",
    "CurrentVersion": "cloudapp-demo-002",
    "LatestVersionName": "cloudapp-demo-003",
    "LatestStatus": "SUCCESS"
  }
}
```

### 6.5 DescribeCloudAppVersionList — 查询版本列表

查询指定服务的历史版本及各版本流量占比。

**请求参数：** `EnvId`、`DeployType`、`ServiceName`

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| Total | 版本总数 |
| VersionList[] | 版本列表，每项结构同 [DescribeCloudAppVersion](#62-describecloudappversion--查询版本详情) 的响应，另含 `VersionName` |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudAppVersionList" -H "X-TC-Timestamp: 1790412949" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo"}'
```

返回（节选，`002` 为当前线上版本、`003` 为新构建待发布、`001` 为历史版本）：

```json
{
  "Response": {
    "Total": 3,
    "VersionList": [
      {
        "VersionName": "cloudapp-demo-003",
        "BuildId": "10000001",
        "BuildTime": "2026-09-26 16:52:19",
        "Status": "SUCCESS",
        "TrafficPercent": 0,
        "VersionDomain": "cloudapp-demo-xxxxxxxxxx-lowcode-xxxxxxxx.cloudapp.tcloudbase.com"
      },
      {
        "VersionName": "cloudapp-demo-002",
        "BuildId": "10000000",
        "BuildTime": "2026-09-25 10:12:03",
        "Status": "SUCCESS",
        "TrafficPercent": 100,
        "VersionDomain": "cloudapp-demo-yyyyyyyyyy-lowcode-xxxxxxxx.cloudapp.tcloudbase.com"
      }
    ]
  }
}
```

### 6.6 DeleteCloudAppVersion — 删除版本

删除不再需要的历史版本，释放存储资源。

**请求参数：** `EnvId`、`DeployType`、`ServiceName`、`VersionName`

**响应参数：** `Result`（Boolean，true 表示删除成功）

**示例（删除历史版本 `cloudapp-demo-001`）：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DeleteCloudAppVersion" -H "X-TC-Timestamp: 1790340620" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-001"}'
```

返回：

```json
{ "Response": { "Result": true, "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" } }
```

> ⚠️ 请勿删除当前承接流量的线上版本（`TrafficPercent > 0`），应先将流量切至其他版本。

### 6.7 DescribeCloudBaseRunBuildLog — 查询构建日志

按 `BuildId` 查询完整构建日志，用于排查构建失败原因。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| EnvId | String | 是 | 环境 ID |
| BuildId | Integer | 是 | 构建 ID（CreateCloudApp 或版本详情返回） |

**响应参数（Log 对象）：**

| 字段 | 说明 |
| --- | --- |
| Text | 完整日志文本（含每个步骤的执行命令与输出） |
| Total / Delivered | 日志总长度 / 已投递长度（分页拉取时使用） |
| More | 是否还有更多日志 |
| FailReason / FailType | 失败原因 / 失败类型（成功时为空） |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudBaseRunBuildLog" -H "X-TC-Timestamp: 1790413939" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","BuildId":10000001}'
```

日志按步骤分段，每段以 `----------- 步骤名 -----------` 分隔，例如：

```
----------- web:install -----------
$ cd frontend && npm install
added 63 packages ...
----------- web:build -----------
$ cd frontend && npm run build
✓ 42 modules transformed.
...
----------- web:deploy -----------
✔ Deployment succeeded!
```

### 6.8 PromoteCloudAppVersion — 发布版本（默认域名流量）

将指定版本整体切换到服务**默认域名**。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| EnvId | String | 是 | 环境 ID |
| DeployType | String | 是 | `cloudapp` |
| ServiceName | String | 是 | 服务名 |
| VersionName | String | 是 | 目标版本 |
| Weight | Integer | 是 | 该版本的流量权重，标准形态仅支持 `100`（全量发布该版本）或 `0`（下线该版本）；不支持中间百分比 |

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| DeployStatus | 发布状态，`CURRENT` 表示该版本已成为当前版本 |
| PrevVersionName | 之前的线上版本（可用于回滚） |
| Weight | 生效的权重 |

**示例（将新版本 `cloudapp-demo-003` 全量发布）：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: PromoteCloudAppVersion" -H "X-TC-Timestamp: 1790412982" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-003","Weight":100}'
```

返回：

```json
{
  "Response": {
    "DeployStatus": "CURRENT",
    "PrevVersionName": "cloudapp-demo-002",
    "Weight": 100,
    "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

## 7. 接口详解：自定义域名管理

自定义域名绑定到某个 CloudApp 服务后，**域名的流量独立于服务默认域名管理**：可为域名指定当前承接全部流量的版本，实现版本整体切换与回滚（标准形态下单个版本流量仅为 `0` 或 `100`）。

### 7.1 CreateCloudAppDomain — 绑定自定义域名

将客户自有域名绑定到服务，并指定初始承接流量的版本。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| EnvId | String | 是 | 环境 ID |
| DeployType | String | 是 | `cloudapp` |
| ServiceName | String | 是 | 服务名 |
| VersionName | String | 是 | 初始关联的版本 |
| Domain | String | 是 | 自定义域名，如 `www.example.com` |

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| Domain | 绑定的域名 |
| Status | 绑定状态，初始返回 `PROCESSING`（处理中），解析配置生效后变为 `SUCCESS` |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: CreateCloudAppDomain" -H "X-TC-Timestamp: 1790337126" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-002","Domain":"www.example.com"}'
```

返回：

```json
{
  "Response": {
    "Domain": "www.example.com",
    "Status": "PROCESSING",
    "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**DNS 配置说明**：调用成功后，需在您的域名 DNS 服务商处添加 CNAME 解析记录，将自定义域名指向该服务的默认域名（可通过 `DescribeCloudAppInfo` 的 `Domain` 字段获取，如 `cloudapp-demo-lowcode-xxxxxxxx.cloudapp.tcloudbase.com`）。解析生效后，通过 [DescribeCloudAppDomainVersionRoutes](#72-describecloudappdomainversionroutes--查询域名版本路由) 观察 `Status` 变为 `SUCCESS` 即绑定完成。

### 7.2 DescribeCloudAppDomainVersionRoutes — 查询域名版本路由

查询某个自定义域名下各版本的流量分布，也可用于确认域名绑定状态。

**请求参数：** `EnvId`、`DeployType`、`ServiceName`、`Domain`

**响应参数：**

| 字段 | 说明 |
| --- | --- |
| Domain / Status | 域名 / 绑定状态（`SUCCESS` 表示绑定完成） |
| VersionRoutes[] | 版本路由列表：`VersionName` + `TrafficPercent`（同一域名下各版本流量之和为 100） |

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DescribeCloudAppDomainVersionRoutes" -H "X-TC-Timestamp: 1790337133" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","Domain":"www.example.com"}'
```

返回（当前 `cloudapp-demo-003` 承接 100% 流量，`cloudapp-demo-002` 为 0%）：

```json
{
  "Response": {
    "Domain": "www.example.com",
    "Status": "SUCCESS",
    "VersionRoutes": [
      { "VersionName": "cloudapp-demo-003", "TrafficPercent": 100 },
      { "VersionName": "cloudapp-demo-002", "TrafficPercent": 0 }
    ]
  }
}
```

### 7.3 ModifyCloudAppDomainTraffic — 调整域名流量

调整自定义域名下某版本的流量占比，实现版本整体切换 / 回滚。将目标版本设为 `100` 即由其承接全部流量，其余版本自动归 `0`。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| EnvId | String | 是 | 环境 ID |
| DeployType | String | 是 | `cloudapp` |
| ServiceName | String | 是 | 服务名 |
| Domain | String | 是 | 自定义域名 |
| VersionName | String | 是 | 目标版本 |
| TrafficPercent | Integer | 是 | 目标流量占比，标准形态仅支持 `0` 或 `100` |

**响应参数：** `Domain` / `VersionName` / `TrafficPercent`（生效后的值）

**示例（将旧版本 `cloudapp-demo-002` 流量降为 0，全量切走）：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: ModifyCloudAppDomainTraffic" -H "X-TC-Timestamp: 1790338392" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-002","TrafficPercent":0,"Domain":"www.example.com"}'
```

返回：

```json
{
  "Response": {
    "Domain": "www.example.com",
    "VersionName": "cloudapp-demo-002",
    "TrafficPercent": 0,
    "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

### 7.4 DeleteCloudAppDomainVersionRoute — 删除域名版本路由

将某版本从自定义域名的路由中移除（版本本身不会被删除）。

**请求参数：** `EnvId`、`DeployType`、`ServiceName`、`VersionName`、`Domain`

**响应参数：** `Status`（`success` 表示删除成功）

**示例：**

```bash
curl -X POST https://tcb.tencentcloudapi.com \
  -H "Authorization: <TC3 签名>" -H "Content-Type: application/json" \
  -H "X-TC-Action: DeleteCloudAppDomainVersionRoute" -H "X-TC-Timestamp: 1790414284" \
  -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" \
  -d '{"EnvId":"lowcode-xxxxxxxx","DeployType":"cloudapp","ServiceName":"cloudapp-demo","VersionName":"cloudapp-demo-002","Domain":"www.example.com"}'
```

返回：

```json
{ "Response": { "Status": "success", "RequestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" } }
```

---

## 8. 典型场景操作指南

### 场景 A：首次部署上线

```
CreateCloudApp (PromoteType=manual)
   → 轮询 DescribeCloudAppVersion 直至 SUCCESS
   → 访问 VersionDomain 验证
   → PromoteCloudAppVersion (Weight=100)
   → DescribeCloudAppInfo 获取默认域名对外使用
```

若希望构建成功后**自动发布**，创建时传 `PromoteType=auto`，无需手动 Promote。

### 场景 B：迭代更新发布

```
CreateCloudApp（同一 ServiceName 再次调用，生成新版本）
   → 轮询 SUCCESS → VersionDomain 预览回归
   → PromoteCloudAppVersion (Weight=100) 全量切换
```

### 场景 C：版本切换（默认域名）

标准形态下不支持中间百分比灰度，发布即整体切换：

```
DescribeCloudAppVersion 预览验证新版本
   → PromoteCloudAppVersion (Weight=100)  # 整体切换到新版本
   → DescribeCloudAppInfo 确认 CurrentVersion 已更新
```

> 如需灰度验证，可先用新版本的 `VersionDomain` 预览域名做灰度访问验证，
> 确认无误后再执行 `Weight=100` 的整体切换。

### 场景 D：回滚

`PromoteCloudAppVersion` 返回的 `PrevVersionName` 即上一线上版本，直接对旧版本再次 Promote 即回滚：

```
PromoteCloudAppVersion (VersionName=<PrevVersionName>, Weight=100)
```

自定义域名同理：对旧版本调用 `ModifyCloudAppDomainTraffic (TrafficPercent=100)`。

### 场景 E：自定义域名上线与版本切换

```
CreateCloudAppDomain (Domain=www.example.com, VersionName=cloudapp-demo-002)
   → DNS 服务商配置 CNAME 指向服务默认域名
   → DescribeCloudAppDomainVersionRoutes 确认 Status=SUCCESS
   → 新版本 cloudapp-demo-003 构建完成后：
      ModifyCloudAppDomainTraffic (cloudapp-demo-003, 100)  # 整体切换到新版本
   → 稳定后 DeleteCloudAppDomainVersionRoute (cloudapp-demo-002) 清理旧路由
```

### 场景 F：版本清理

定期通过 `DescribeCloudAppVersionList` 查看历史版本，对 `TrafficPercent=0` 且已过保留期的版本调用 `DeleteCloudAppVersion` 清理。

---

## 9. 二次开发指南

### 9.1 使用腾讯云 SDK（推荐）

以 Node.js 为例（Python / Go / Java 用法类似，SDK 自动完成 TC3 签名）：

```bash
npm install tencentcloud-sdk-nodejs-common tencentcloud-sdk-nodejs-tcb
```

```js
const tencentcloud = require('tencentcloud-sdk-nodejs-tcb')
const TcbClient = tencentcloud.tcb.v20180608.Client

const client = new TcbClient({
  credential: { secretId: process.env.TC_SECRET_ID, secretKey: process.env.TC_SECRET_KEY },
  region: '',                    // TCB 接口不区分 region，可留空
  profile: { httpProfile: { endpoint: 'tcb.tencentcloudapi.com' } }
})
```

### 9.2 封装一个部署 + 等待完成的工具类

```js
class CloudAppManager {
  constructor(client, envId) {
    this.client = client
    this.envId = envId
  }

  /** 发起部署并轮询至构建结束，返回版本详情 */
  async deployAndWait(params, { intervalMs = 5000, timeoutMs = 10 * 60 * 1000 } = {}) {
    const createRes = await this.client.CreateCloudApp({
      EnvId: this.envId,
      DeployType: 'cloudapp',
      ...params
    })
    const { BuildId, VersionName, ServiceName } = createRes

    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, intervalMs))
      const { Status, Steps, VersionDomain, TrafficPercent } = await this.client
        .DescribeCloudAppVersion({
          EnvId: this.envId, DeployType: 'cloudapp', ServiceName, VersionName
        })
      console.log(`[${VersionName}] Status=${Status} Traffic=${TrafficPercent}%`)
      if (Status === 'SUCCESS') return { BuildId, VersionName, ServiceName, VersionDomain }
      if (Status === 'FAIL') {
        const log = await this.getBuildLog(BuildId)
        throw new Error(`构建失败，最后日志：\n${log.slice(-2000)}`)
      }
    }
    throw new Error('构建超时')
  }

  /** 获取构建日志 */
  async getBuildLog(buildId) {
    const res = await this.client.DescribeCloudBaseRunBuildLog({ EnvId: this.envId, BuildId: buildId })
    return res.Log.Text
  }

  /** 发布 / 整体切换（标准形态 weight 仅 100=全量 或 0=下线） */
  async promote(serviceName, versionName, weight = 100) {
    return this.client.PromoteCloudAppVersion({
      EnvId: this.envId, DeployType: 'cloudapp',
      ServiceName: serviceName, VersionName: versionName, Weight: weight
    })
  }

  /** 自定义域名版本切换（标准形态 trafficPercent 仅 0 或 100） */
  async setDomainTraffic(serviceName, domain, versionName, trafficPercent) {
    return this.client.ModifyCloudAppDomainTraffic({
      EnvId: this.envId, DeployType: 'cloudapp', ServiceName: serviceName,
      Domain: domain, VersionName: versionName, TrafficPercent: trafficPercent
    })
  }
}
```

使用：

```js
const app = new CloudAppManager(client, 'lowcode-xxxxxxxx')

// 1. 部署并等待构建完成
const { VersionName, VersionDomain } = await app.deployAndWait({
  ServiceName: 'cloudapp-demo',
  Source: { Type: 'git', Repo: 'https://github.com/your-org/your-repo.git', Ref: 'main' },
  NodeJsVersion: '20',
  ServiceList: [ /* 同 6.1 示例 */ ],
  Routes: [ /* 同 6.1 示例 */ ],
  PromoteType: 'manual'
})

// 2. 用 VersionDomain 预览验证后，整体切换到新版本
await app.promote('cloudapp-demo', VersionName, 100)
```

### 9.3 开发注意事项

1. **轮询而非回调**：`CreateCloudApp` 是异步接口，立即返回 `BuildId`/`VersionName`，构建需 1~3 分钟（含安装依赖、构建、部署多个服务单元）。请以 5~10 秒间隔轮询 `DescribeCloudAppVersion`。
2. **失败处理**：`Status=FAIL` 时优先读取 `Steps[]` 定位失败步骤，再用 `BuildId` 拉取 `DescribeCloudBaseRunBuildLog`，日志 `Text` 中每个步骤以 `----------- 步骤名 -----------` 分隔，可按需截取。
3. **流量语义**：
   - `PromoteCloudAppVersion.Weight` 只影响**服务默认域名**；
   - `ModifyCloudAppDomainTraffic.TrafficPercent` 只影响**指定自定义域名**；
   - 二者相互独立，可分别切换；
   - **标准形态下取值仅 `0` 或 `100`**，即版本整体上/下线，不支持中间百分比灰度；如需灰度验证请借助版本预览域名 `VersionDomain`。
4. **回滚保留**：发布前记录 `PrevVersionName`；回滚即对旧版本重新执行 100% 切流，秒级生效，无需重新构建。
5. **版本保留策略**：建议保留当前线上版本 + 最近 2~3 个可回滚版本，其余通过 `DeleteCloudAppVersion` 定期清理；删除前确认 `TrafficPercent=0`。
6. **错误响应**：所有接口失败时返回 `Response.Error`（含 `Code` / `Message`），SDK 会抛出 `TencentCloudSDKError`，请按 `Code` 分类处理并携带 `RequestId` 联系支持。
7. **安全建议**：`SecretId/SecretKey` 通过环境变量或密钥管理系统注入，切勿写入代码仓库；服务端调用，不要在前端/客户端暴露密钥。

---

## 10. 附录：状态与字段说明

### 构建状态（Status）

| 值 | 含义 |
| --- | --- |
| `BUILDING` | 构建进行中（继续轮询） |
| `SUCCESS` | 构建成功，可通过 VersionDomain 预览 |
| `FAIL` | 构建失败，查看构建日志排查 |

### 资源变更类型（Resources.DiffCategory）

| 值 | 含义 |
| --- | --- |
| `added` | 新增的服务单元 |
| `changed` | 本次有变更的服务单元 |

### 资源状态（Resources.Status）

| 值 | 含义 |
| --- | --- |
| `staged` | 已部署暂存（构建产物就绪，等待发布承接流量） |

### 域名绑定状态（CreateCloudAppDomain / DescribeCloudAppDomainVersionRoutes 的 Status）

| 值 | 含义 |
| --- | --- |
| `PROCESSING` | 绑定处理中 / 等待 DNS 解析生效 |
| `SUCCESS` | 绑定完成，域名可正常承接流量 |

### 发布状态（PromoteCloudAppVersion 的 DeployStatus）

| 值 | 含义 |
| --- | --- |
| `CURRENT` | 目标版本已成为当前版本（切流完成） |

### 通用字段

| 字段 | 说明 |
| --- | --- |
| `RequestId` | 每次请求唯一标识，排查问题时提供给腾讯云支持 |
| `DeployedRef` | 服务单元部署后的底层版本引用（如静态托管 `web-025`、函数版本 `18`） |
| `Snapshot` | 部署快照（JSON 字符串），完整记录本次部署的 Source / ServiceList / Routes / PromoteType，可用于审计或复现部署 |
| `TrafficPercent` / `Weight` | 版本流量占比 / 权重，**标准形态仅取 `0` 或 `100`**（版本整体上/下线），不支持中间百分比灰度 |

---

> 如有问题请联系云开发团队，并提供 `RequestId` 与 `BuildId` 以便快速定位。
