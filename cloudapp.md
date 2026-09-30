## 服务部署管理相关接口
### 1、CreateCloudApp

```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization:" -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: CreateCloudApp" -H "X-TC-Timestamp: 1790413188" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","ServiceName":"cloudapp-test","DeployType":"cloudapp","Source":{"Type":"git","Repo":"https://github.com/yph136/cloudapp-test.git","Ref":"main","Channel":"github","IsPrivate":true},"NodeJsVersion":"20","ServiceList":[{"ServiceType":"static-hosting","ServiceName":"web","Identifier":"web","Command":{"InstallCmd":"npm install","BuildCmd":"npm run build"},"BuildContext":{"Path":"frontend","OutPut":"dist"}},{"ServiceType":"http-function","ServiceName":"http-demo","Identifier":"functions/http-demo"},{"ServiceType":"function","ServiceName":"hello","Identifier":"functions/hello"}],"Routes":[{"Source":"/api-demo","ServiceType":"function","ServiceName":"hello"},{"Source":"/api","ServiceType":"http-function","ServiceName":"http-demo"},{"Source":"/","ServiceType":"static-hosting","ServiceName":"web"}],"PromoteType":"manual"}'

返回: 
{
  "Response": {
    "BuildId": "2607424782",
    "RequestId": "ebd2b092-9c8a-424a-bd92-ed2546f95807",
    "ServiceName": "cloudapp-test",
    "VersionName": "cloudapp-test-001"
  }
}
```

### DescribeCloudAppVersion

```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudAppVersion" -H "X-TC-Timestamp: 1790413308" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","ServiceName":"cloudapp-test","DeployType":"cloudapp","VersionName":"cloudapp-test-001"}'

返回
{
  "Response": {
    "Artifacts": [],
    "BuildId": "2607424782",
    "BuildTime": "2026-09-26 17:01:21",
    "BuildType": "GIT",
    "Framework": "",
    "RequestId": "a082c5de-c8a6-43fb-b005-5b68329f766d",
    "Resources": [
      {
        "DeployedRef": "web-025",
        "DiffCategory": "changed",
        "ServiceName": "web",
        "ServiceType": "static-hosting",
        "Status": "staged"
      },
      {
        "DeployedRef": "18",
        "DiffCategory": "added",
        "ServiceName": "http-demo",
        "ServiceType": "http-function",
        "Status": "staged"
      },
      {
        "DeployedRef": "12",
        "DiffCategory": "added",
        "ServiceName": "hello",
        "ServiceType": "function",
        "Status": "staged"
      }
    ],
    "Snapshot": "{\"Source\":{\"Type\":\"git\",\"Repo\":\"https://github.com/yph136/cloudapp-test.git\",\"Ref\":\"main\",\"Commit\":\"b6631fbcb389d09fb71c6bfba28440b4a2a5dc4c\",\"PackageFileName\":\"\"},\"ServiceList\":[{\"ServiceType\":\"static-hosting\",\"ServiceName\":\"web\",\"Identifier\":\"web\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}},{\"ServiceType\":\"http-function\",\"ServiceName\":\"http-demo\",\"Identifier\":\"functions/http-demo\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}},{\"ServiceType\":\"function\",\"ServiceName\":\"hello\",\"Identifier\":\"functions/hello\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}}],\"Routes\":[{\"Source\":\"/api-demo\",\"ServiceType\":\"function\",\"ServiceName\":\"hello\"},{\"Source\":\"/api\",\"ServiceType\":\"http-function\",\"ServiceName\":\"http-demo\"},{\"Source\":\"/\",\"ServiceType\":\"static-hosting\",\"ServiceName\":\"web\"}],\"PromoteType\":\"manual\"}",
    "StaticConfig": {
      "AppPath": "",
      "BuildPath": "",
      "CodeBranch": "",
      "CodeRepo": "",
      "CodeSource": "",
      "CosSuffix": "",
      "CosTimestamp": "",
      "Framework": "",
      "NodeJsVersion": "",
      "StaticCmd": {
        "BuildCmd": "",
        "DeployCmd": "",
        "InstallCmd": ""
      },
      "StaticEnv": {
        "Variables": null
      },
      "ZipFileUrl": ""
    },
    "Status": "SUCCESS",
    "Steps": [
      {
        "Duration": "2847ms",
        "Name": "检出代码仓库",
        "Status": "success"
      },
      {
        "Duration": "2281ms",
        "Name": "web:install",
        "Status": "success"
      },
      {
        "Duration": "1214ms",
        "Name": "web:build",
        "Status": "success"
      },
      {
        "Duration": "15663ms",
        "Name": "web:deploy",
        "Status": "success"
      },
      {
        "Duration": "24202ms",
        "Name": "http-demo:deploy",
        "Status": "success"
      },
      {
        "Duration": "21324ms",
        "Name": "hello:deploy",
        "Status": "success"
      },
      {
        "Duration": "3773ms",
        "Name": "register",
        "Status": "success"
      },
      {
        "Duration": "868ms",
        "Name": "End",
        "Status": "success"
      }
    ],
    "TrafficPercent": 0,
    "VersionDomain": "cloudapp-test-413a72a30d-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com"
  }
}
```

### DescribeCloudAppList
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudAppList" -H "X-TC-Timestamp: 1790408573" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp"}'
返回
{
  "Response": {
    "RequestId": "74d3acb7-7958-480c-9479-f6e02ab836e1",
    "ServiceList": [
      {
        "AppPath": "",
        "BuildConfig": "{\"Source\":{\"Type\":\"git\",\"Repo\":\"https://github.com/yph136/cloudapp-test.git\",\"Ref\":\"main\",\"Channel\":\"github\",\"IsPrivate\":true},\"Steps\":[{\"Name\":\"web:install\",\"Command\":\"npm install\",\"WorkingDir\":\"frontend\"},{\"Name\":\"web:build\",\"Command\":\"npm run build\",\"WorkingDir\":\"frontend\"},{\"Name\":\"web:deploy\",\"Command\":\"tcb app deploy web --framework static --install-command \\\"\\\" --build-command \\\"\\\" --output-dir dist --deploy-path /web -e $ENV_ID --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 VER=$(node -e \\\"const m=require('/root/cloudbase-workspace/.meta.json');const r=(m.resources||[]).find(x=\\u003ex.name==='web');if(!r||!r.deployedRef){console.error('deployedRef not found for web');process.exit(1)}console.log(r.deployedRef)\\\") \\u0026\\u0026 tcb hosting deploy dist __version/web/$VER -e $ENV_ID\",\"WorkingDir\":\"frontend\"},{\"Name\":\"http-demo:deploy\",\"Command\":\"tcb fn deploy http-demo --yes --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 tcb fn publish-version http-demo --metadata-file /root/cloudbase-workspace/.meta.json\",\"WorkingDir\":\"/root/cloudbase-workspace\"},{\"Name\":\"hello:deploy\",\"Command\":\"tcb fn deploy hello --yes --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 tcb fn publish-version hello --metadata-file /root/cloudbase-workspace/.meta.json\",\"WorkingDir\":\"/root/cloudbase-workspace\"},{\"Name\":\"register\",\"Command\":\"buildctl register\"}]}",
        "CreateTime": "2026-09-26 16:59:48",
        "CurrentVersion": "",
        "DeployType": "cloudapp",
        "Domain": "cloudapp-test-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com",
        "Framework": "",
        "LatestBuildTime": "2026-09-26 16:59:50",
        "LatestStatus": "SUCCESS",
        "LatestVersionName": "cloudapp-test-001",
        "ServiceName": "cloudapp-test"
      }
    ],
    "Total": 5
  }
}
```

### DescribeCloudAppInfo
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudAppInfo" -H "X-TC-Timestamp: 1790408752" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","ServiceName":"mycloudapp2","DeployType":"cloudapp"}'
返回
{
  "Response": {
    "AppPath": "",
    "BuildConfig": "{\"Source\":{\"Type\":\"git\",\"Repo\":\"https://github.com/yph136/cloudapp-test.git\",\"Ref\":\"main\",\"Channel\":\"github\",\"IsPrivate\":true},\"Steps\":[{\"Name\":\"web:install\",\"Command\":\"ls\",\"WorkingDir\":\"site\"},{\"Name\":\"web:deploy\",\"Command\":\"tcb app deploy web --framework static --install-command \\\"\\\" --build-command \\\"\\\" --output-dir ./ --deploy-path /web -e $ENV_ID --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 VER=$(node -e \\\"const m=require('/root/cloudbase-workspace/.meta.json');const r=(m.resources||[]).find(x=\\u003ex.name==='web');if(!r||!r.deployedRef){console.error('deployedRef not found for web');process.exit(1)}console.log(r.deployedRef)\\\") \\u0026\\u0026 tcb hosting deploy ./ __version/web/$VER -e $ENV_ID\",\"WorkingDir\":\"site\"},{\"Name\":\"http-demo:deploy\",\"Command\":\"tcb fn deploy http-demo --yes --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 tcb fn publish-version http-demo --metadata-file /root/cloudbase-workspace/.meta.json\",\"WorkingDir\":\"/root/cloudbase-workspace\"},{\"Name\":\"hello:deploy\",\"Command\":\"tcb fn deploy hello --yes --force --metadata-file /root/cloudbase-workspace/.meta.json \\u0026\\u0026 tcb fn publish-version hello --metadata-file /root/cloudbase-workspace/.meta.json\",\"WorkingDir\":\"/root/cloudbase-workspace\"},{\"Name\":\"register\",\"Command\":\"buildctl register\"},{\"Name\":\"post-deploy\",\"Command\":\"cat /root/cloudbase-workspace/.meta.json \\u0026\\u0026 echo $CLOUDBASE_ROUTES\"}]}",
    "CreateTime": "2026-09-23 20:06:12",
    "CurrentVersion": "mycloudapp2-016",
    "DeployType": "cloudapp",
    "Domain": "mycloudapp2-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com",
    "Framework": "",
    "LatestBuildTime": "2026-09-26 10:58:27",
    "LatestStatus": "SUCCESS",
    "LatestVersionName": "mycloudapp2-018",
    "PreviewDomain": "mycloudapp2-07675f394f-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com",
    "RequestId": "2f0dd7a8-0cdd-42fc-8b0c-025e183ff8e6",
    "ServiceName": "mycloudapp2"
  }
}
```

### DescribeCloudAppVersionList
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudAppVersionList" -H "X-TC-Timestamp: 1790412949" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2"}'

返回
{
  "Response": {
    "RequestId": "c7c66122-173f-4c1b-b781-e6d91ec314e4",
    "Total": 11,
    "VersionList": [
      {
        "Artifacts": [],
        "BuildId": "2607408861",
        "BuildTime": "2026-09-26 16:52:19",
        "BuildType": "GIT",
        "Framework": "",
        "Resources": [
          {
            "DeployedRef": "web-024",
            "DiffCategory": "changed",
            "ServiceName": "web",
            "ServiceType": "static-hosting",
            "Status": "staged"
          },
          {
            "DeployedRef": "17",
            "DiffCategory": "added",
            "ServiceName": "http-demo",
            "ServiceType": "http-function",
            "Status": "staged"
          },
          {
            "DeployedRef": "11",
            "DiffCategory": "added",
            "ServiceName": "hello",
            "ServiceType": "function",
            "Status": "staged"
          }
        ],
        "Snapshot": "{\"Source\":{\"Type\":\"git\",\"Repo\":\"https://github.com/yph136/cloudapp-test.git\",\"Ref\":\"main\",\"Commit\":\"b6631fbcb389d09fb71c6bfba28440b4a2a5dc4c\",\"PackageFileName\":\"\"},\"ServiceList\":[{\"ServiceType\":\"static-hosting\",\"ServiceName\":\"web\",\"Identifier\":\"web\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}},{\"ServiceType\":\"http-function\",\"ServiceName\":\"http-demo\",\"Identifier\":\"functions/http-demo\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}},{\"ServiceType\":\"function\",\"ServiceName\":\"hello\",\"Identifier\":\"functions/hello\",\"Action\":\"\",\"BuildContext\":{\"Path\":\"\",\"Output\":\"\"},\"Command\":{\"InstallCmd\":\"\",\"BuildCmd\":\"\",\"DeployCmd\":\"\"}}],\"Routes\":[{\"Source\":\"/api-demo\",\"ServiceType\":\"function\",\"ServiceName\":\"hello\"},{\"Source\":\"/api\",\"ServiceType\":\"http-function\",\"ServiceName\":\"http-demo\"},{\"Source\":\"/\",\"ServiceType\":\"static-hosting\",\"ServiceName\":\"web\"}],\"PromoteType\":\"manual\"}",
        "StaticConfig": {
          "AppPath": "",
          "BuildPath": "",
          "CodeBranch": "",
          "CodeRepo": "",
          "CodeSource": "",
          "CosSuffix": "",
          "CosTimestamp": "",
          "Framework": "",
          "NodeJsVersion": "",
          "StaticCmd": {
            "BuildCmd": "",
            "DeployCmd": "",
            "InstallCmd": ""
          },
          "StaticEnv": {
            "Variables": null
          },
          "ZipFileUrl": ""
        },
        "Status": "SUCCESS",
        "Steps": [
          {
            "Duration": "2184ms",
            "Name": "检出代码仓库",
            "Status": "success"
          },
          {
            "Duration": "1559ms",
            "Name": "web:install",
            "Status": "success"
          },
          {
            "Duration": "1241ms",
            "Name": "web:build",
            "Status": "success"
          },
          {
            "Duration": "231ms",
            "Name": "pre-deploy",
            "Status": "success"
          },
          {
            "Duration": "15329ms",
            "Name": "web:deploy",
            "Status": "success"
          },
          {
            "Duration": "22913ms",
            "Name": "http-demo:deploy",
            "Status": "success"
          },
          {
            "Duration": "23625ms",
            "Name": "hello:deploy",
            "Status": "success"
          },
          {
            "Duration": "3703ms",
            "Name": "register",
            "Status": "success"
          },
          {
            "Duration": "902ms",
            "Name": "End",
            "Status": "success"
          }
        ],
        "TrafficPercent": 100,
        "VersionDomain": "mycloudapp2-bc6b83f508-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com",
        "VersionName": "mycloudapp2-022"
      }
    ]
  }
}
```

### DeleteCloudAppVersion
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DeleteCloudAppVersion" -H "X-TC-Timestamp: 1790340620" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","VersionName":"mycloudapp2-011"}'

返回
{
  "Response": {
    "RequestId": "85f1850d-839a-4065-aaaa-9574d894eb8f",
    "Result": true
  }
}
```

### DescribeCloudBaseRunBuildLog
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudBaseRunBuildLog" -H "X-TC-Timestamp: 1790413939" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","BuildId":2607424782}'

返回
{
  "Response": {
    "Log": {
      "Delivered": 12164,
      "FailReason": "",
      "FailType": "",
      "More": false,
      "Text": "----------- End... -----------\r\nPipeline end...\r\n- Service network-bus stop...\r\nRunner[10.233.16.14] 2026-09-26 17:01:11 $ docker kill cnb-l76-1k3ef2dmh-001-network-bus\r\ncnb-l76-1k3ef2dmh-001-network-bus\r\n\r\nFinished, code: 0, duration: 0.3s\r\n- Service network-bus stoped [0.6s]\r\n- Service git-clone-yyds stop...\r\n- Service git-clone-yyds stoped [0s]\r\n----------- 清理token -----------\r\n...\r\nThe CNB_TOKEN has been destroyed\r\n1 dynamic token(s) have been destroyed\r\n----------- 初始化 Node 环境 -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 16:59:57 $\r\nnvm: switched to node 20\r\nNode: v20.20.1\r\n##[set-output path=/root/.nvm/versions/node/v20.20.1/bin:/usr/local/node-default:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin]\r\n\r\nFinished, code: 0, duration: 0.7s\r\nset env for key: PATH\r\n----------- 检出代码仓库 -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 16:59:58 $ [ \"$BUILD_TYPE\" = \"GIT\" ]\r\nFinished, code: 0, duration: 0.5s\r\nRunner[10.233.16.14][docker] 2026-09-26 16:59:58 $\r\n[2026-09-26 16:59:59] Cloning repository main ...\r\nCloning into 'cloudbase-workspace'...\r\n\r\n\r\nFinished, code: 0, duration: 2.3s\r\n----------- web:install -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:00:01 $ cd /root/cloudbase-workspace && cd frontend && npm install\r\nadded 63 packages, and audited 64 packages in 2s\r\n\r\n7 packages are looking for funding\r\n  run `npm fund` for details\r\n\r\n2 vulnerabilities (1 moderate, 1 high)\r\n\r\nTo address all issues (including breaking changes), run:\r\n  npm audit fix --force\r\n\r\nRun `npm audit` for details.\r\n\r\nFinished, code: 0, duration: 2.2s\r\n----------- web:build -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:00:03 $ cd /root/cloudbase-workspace && cd frontend && npm run build\r\n> cloudapp-frontend@1.0.0 build\r\n> vite build\r\n\r\nvite v5.4.21 building for production...\r\ntransforming...\r\n✓ 42 modules transformed.\r\nrendering chunks...\r\ncomputing gzip size...\r\ndist/about.html                    0.48 kB │ gzip:  0.35 kB\r\ndist/index.html                    0.55 kB │ gzip:  0.35 kB\r\ndist/todos.html                    0.55 kB │ gzip:  0.36 kB\r\ndist/users.html                    0.55 kB │ gzip:  0.36 kB\r\ndist/assets/Navbar-CJvIiU9b.css    3.86 kB │ gzip:  1.34 kB\r\ndist/assets/api-8B9wSBGz.js        0.72 kB │ gzip:  0.55 kB\r\ndist/assets/index-C2fBGu4q.js      2.36 kB │ gzip:  1.20 kB\r\ndist/assets/todos-Arb-7NrU.js      3.05 kB │ gzip:  1.32 kB\r\ndist/assets/users-B0REW2sL.js      3.52 kB │ gzip:  1.49 kB\r\ndist/assets/about-B2RsB_qX.js      3.58 kB │ gzip:  1.87 kB\r\ndist/assets/Navbar-CoiPok5V.js   143.02 kB │ gzip: 46.06 kB\r\n✓ built in 667ms\r\n\r\nFinished, code: 0, duration: 1.1s\r\n----------- web:deploy -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:00:04 $ cd /root/cloudbase-workspace && cd frontend && tcb app deploy web --framework static --install-command \"\" --build-command \"\" --output-dir dist --deploy-path /web -e $ENV_ID --force --metadata-file /root/cloudbase-workspace/.meta.json && VER=$(node -e \"const m=require('/root/cloudbase-workspace/.meta.json');const r=(m.resources||[]).find(x=>x.name==='web');if(!r||!r.deployedRef){console.error('deployedRef not found for web');process.exit(1)}console.log(r.deployedRef)\") && tcb hosting deploy dist __version/web/$VER -e $ENV_ID\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n- Uploading static files...\r\n[uploadFiles] 准备上传 10 个文件\r\n[uploadFiles] 智能混合模式：先并行快速上传，失败文件自动串行重试\r\n[parallel-upload] 正在上传第 1 批次 (文件 1-10/10)\r\n[parallel-upload] 第 1 批次上传成功\r\n[parallel-upload] 全部 10 个文件并行上传成功\r\n[uploadFiles] 全部完成！共处理 10 个文件\r\n[uploadFiles] 准备上传 1 个文件\r\n[uploadFiles] 智能混合模式：先并行快速上传，失败文件自动串行重试\r\n[parallel-upload] 正在上传第 1 批次 (文件 1-1/1)\r\n[parallel-upload] 第 1 批次上传成功\r\n[parallel-upload] 全部 1 个文件并行上传成功\r\n[uploadFiles] 全部完成！共处理 1 个文件\r\n✔ Static files uploaded (2.1s)\r\n- Creating deployment record...\r\n✔ Deployment record created (2.3s)\r\n\r\n✔ Deployment succeeded!\r\nℹ   Access URL: https://web-lowcode-9gms1m53798f7294.webapps.tcloudbase.com/\r\nℹ   Version: web-025\r\nℹ   Duration: 5s\r\nℹ   Build log: https://tcb.cloud.tencent.com/dev?envId=lowcode-9gms1m53798f7294#/static-hosting/service/deploy/detail?serverName=web&versionName=web-025&buildId=2607413061\r\n\r\nℹ Next step:\r\nℹ   View app        tcb app info web --env-id lowcode-9gms1m53798f7294\r\nℹ   View versions   tcb app versions web --env-id lowcode-9gms1m53798f7294\r\n✔ Configuration has been saved to cloudbaserc.json\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n⚠ Detected cloud app config in cloudbaserc.json (app.framework/app.serviceName), recommend using tcb app deploy for cloud build and version management\r\n- Preparing upload...\r\n[uploadFiles] 准备上传 10 个文件\r\n[uploadFiles] 智能混合模式：先并行快速上传，失败文件自动串行重试\r\n[parallel-upload] 正在上传第 1 批次 (文件 1-10/10)\r\n[parallel-upload] 第 1 批次上传成功\r\n[parallel-upload] 全部 10 个文件并行上传成功\r\n[uploadFiles] 全部完成！共处理 10 个文件\r\n[uploadFiles] 准备上传 1 个文件\r\n[uploadFiles] 智能混合模式：先并行快速上传，失败文件自动串行重试\r\n[parallel-upload] 正在上传第 1 批次 (文件 1-1/1)\r\n[parallel-upload] 第 1 批次上传成功\r\n[parallel-upload] 全部 1 个文件并行上传成功\r\n[uploadFiles] 全部完成！共处理 1 个文件\r\n✔ File upload completed\r\n✔ \r\nDeployment completed https://lowcode-9gms1m53798f7294-1302110647.tcloudbaseapp.com/__version/web/web-025/\r\n✔ Total files: 11\r\n✔ Successfully uploaded 11 file(s)\r\n┌────────┬──────────────────────────────────────────────────┐\r\n│ Status │                       File                       │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │         __version/web/web-025/about.html         │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │   __version/web/web-025/assets/api-8B9wSBGz.js   │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │         __version/web/web-025/users.html         │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │         __version/web/web-025/todos.html         │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │  __version/web/web-025/assets/users-B0REW2sL.js  │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │ __version/web/web-025/assets/Navbar-CJvIiU9b.css │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │  __version/web/web-025/assets/about-B2RsB_qX.js  │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │  __version/web/web-025/assets/todos-Arb-7NrU.js  │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │ __version/web/web-025/assets/Navbar-CoiPok5V.js  │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │  __version/web/web-025/assets/index-C2fBGu4q.js  │\r\n├────────┼──────────────────────────────────────────────────┤\r\n│   ✔    │         __version/web/web-025/index.html         │\r\n└────────┴──────────────────────────────────────────────────┘\r\nℹ \r\nℹ Next step:\r\nℹ   • Verify file path: tcb hosting list __version/web/web-025\r\nℹ   • Upload more directories: tcb hosting deploy <localPath> <cloudPath>\r\nℹ   • Visit website: https://lowcode-9gms1m53798f7294-1302110647.tcloudbaseapp.com/__version/web/web-025/\r\nℹ   CDN cache tip: If the page is not updated, verify with curl -H \"Cache-Control: no-cache\" https://lowcode-9gms1m53798f7294-1302110647.tcloudbaseapp.com/__version/web/web-025/ or an incognito browser. CDN usually refreshes in a few minutes\r\nℹ   Need version management? Use tcb app deploy for cloud builds, rollbacks, and service name management\r\n\r\nFinished, code: 0, duration: 15.6s\r\n----------- http-demo:deploy -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:00:20 $ cd /root/cloudbase-workspace && tcb fn deploy http-demo --yes --force --metadata-file /root/cloudbase-workspace/.meta.json && tcb fn publish-version http-demo --metadata-file /root/cloudbase-workspace/.meta.json\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n- Cloud function deploying...\r\n[http-demo] 部署方式: COS 上传\r\n[http-demo] 部署方式: COS 上传\r\n✔ [http-demo] Cloud function deployed successfully!\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n- Publishing function [http-demo] new version...\r\n✔ Function [http-demo] new version published successfully!\r\n\r\nFinished, code: 0, duration: 24.1s\r\n----------- hello:deploy -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:00:44 $ cd /root/cloudbase-workspace && tcb fn deploy hello --yes --force --metadata-file /root/cloudbase-workspace/.meta.json && tcb fn publish-version hello --metadata-file /root/cloudbase-workspace/.meta.json\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n- Cloud function deploying...\r\n[hello] 部署方式: COS 上传\r\n[hello] 部署方式: COS 上传\r\n✔ [hello] Cloud function deployed successfully!\r\nCloudBase CLI 3.8.5-beta.1\r\nTry the tcb ai command to start your AI full-stack development experience\r\n- Loading data...\r\n- Publishing function [hello] new version...\r\n✔ Function [hello] new version published successfully!\r\n\r\nFinished, code: 0, duration: 21.2s\r\n----------- register -----------\r\nRunner[10.233.16.14][docker] 2026-09-26 17:01:06 $ cd /root/cloudbase-workspace && buildctl register\r\n{\r\n  \"Response\": {\r\n    \"PreviewDomain\": \"cloudapp-test-413a72a30d-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com\",\r\n    \"RegisteredServices\": [\r\n      \"web\",\r\n      \"http-demo\",\r\n      \"hello\"\r\n    ],\r\n    \"RequestId\": \"9ebe5e99-5f81-4df4-be7d-a7a4a9d0ec5d\",\r\n    \"ServiceDomain\": \"cloudapp-test-lowcode-9gms1m53798f7294.cloudapp.tcloudbase.com\",\r\n    \"Success\": true\r\n  }\r\n}\r\n\r\nFinished, code: 0, duration: 3.7s\r\n",
      "Total": 12164
    },
    "RequestId": "030966c4-c748-4c5f-82a9-604f9ac46e76"
  }
}
```

### PromoteCloudAppVersion
```
请求
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: PromoteCloudAppVersion" -H "X-TC-Timestamp: 1790412982" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","VersionName":"mycloudapp2-022","Weight":100}'

返回
{
  "Response": {
    "DeployStatus": "CURRENT",
    "PrevVersionName": "mycloudapp2-016",
    "RequestId": "11e503f8-4207-40b0-8ad9-be93a457e11e",
    "Weight": 100
  }
}
```

## 服务绑定自定义域名

### CreateCloudAppDomain
```
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: CreateCloudAppDomain" -H "X-TC-Timestamp: 1790337126" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","VersionName":"mycloudapp2-014","Domain":"gintest.woyaodaguaishou.cn"}'

{
  "Response": {
    "Domain": "gintest.woyaodaguaishou.cn",
    "RequestId": "d6e0ec51-d721-499e-8674-0f059c141370",
    "Status": "PROCESSING"
  }
}
```

### DescribeCloudAppDomainVersionRoutes
```
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DescribeCloudAppDomainVersionRoutes" -H "X-TC-Timestamp: 1790337133" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","Domain":"gintest.woyaodaguaishou.cn"}'

{
  "Response": {
    "Domain": "gintest.woyaodaguaishou.cn",
    "RequestId": "76d823b1-5471-44da-be73-32dddb0aeee2",
    "Status": "SUCCESS",
    "VersionRoutes": [
      {
        "TrafficPercent": 100,
        "VersionName": "mycloudapp2-015"
      },
      {
        "TrafficPercent": 0,
        "VersionName": "mycloudapp2-014"
      }
    ]
  }
}
```

### ModifyCloudAppDomainTraffic
```
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: ModifyCloudAppDomainTraffic" -H "X-TC-Timestamp: 1790338392" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","VersionName":"mycloudapp2-015","TrafficPercent":0,"Domain":"gintest.woyaodaguaishou.cn"}'

{
  "Response": {
    "Domain": "gintest.woyaodaguaishou.cn",
    "RequestId": "7d3ee1fa-3cd4-4427-8f9d-e6794d9170fe",
    "TrafficPercent": 0,
    "VersionName": "mycloudapp2-015"
  }
}
```

### DeleteCloudAppDomainVersionRoute

```
curl -X POST https://tcb.pre.tencentcloudapi.woa.com -H "Authorization: " -H "Content-Type: application/json" -H "Host: tcb.pre.tencentcloudapi.woa.com" -H "X-TC-Action: DeleteCloudAppDomainVersionRoute" -H "X-TC-Timestamp: 1790414284" -H "X-TC-Version: 2018-06-08" -H "X-TC-Language: zh-CN" -d '{"EnvId":"lowcode-9gms1m53798f7294","DeployType":"cloudapp","ServiceName":"mycloudapp2","VersionName":"mycloudapp2-014","Domain":"gintest.woyaodaguaishou.cn"}'

{
  "Response": {
    "RequestId": "7ee0bc08-bb80-4a49-8c27-9587e62fddb1",
    "Status": "success"
  }
}
```