// 普通事件型云函数（无需 Docker / 镜像）
// 入口为 exports.main，SCF 以 (event, context) 调用
exports.main = async (event, context) => {
  return {
    message: 'hello from CloudBase function (3.8.0-beta.4 验证)',
    event,
    time: new Date().toISOString()
  }
}
