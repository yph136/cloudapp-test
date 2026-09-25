'use strict'

/**
 * 事件型云函数（hello）
 * 网关路径 /api-demo，通过 event.action 区分不同的 API：
 *   - greet      打招呼
 *   - time       服务器时间
 *   - echo       原样回传 event
 *   - sum        数组求和（event.numbers）
 *   - env        运行环境信息
 * 不传 action 时默认 greet。
 */

function parseBody(event) {
  if (event && typeof event.body === 'string' && event.body) {
    try {
      return JSON.parse(event.body)
    } catch (_) {
      return {}
    }
  }
  return event && typeof event.body === 'object' && event.body ? event.body : {}
}

function resolveAction(event) {
  const query = (event && event.queryStringParameters) || {}
  const body = parseBody(event)
  const pathAction = event && typeof event.path === 'string' ? event.path.split('/').filter(Boolean).pop() : null
  return (event && event.action) || body.action || query.action || pathAction || 'greet'
}

exports.main = async (event = {}, context) => {
  const payload = parseBody(event)
  const query = event.queryStringParameters || {}
  const action = resolveAction(event)

  const base = {
    ok: true,
    action,
    service: 'hello',
    type: 'Event',
    requestId: (context && context.request_id) || null,
    time: new Date().toISOString()
  }

  switch (action) {
    case 'time':
      return { ...base, data: { iso: base.time, timestamp: Date.now(), timezone: 'UTC' } }

    case 'echo':
      return { ...base, data: { event, query, body: payload } }

    case 'sum': {
      const numbers = payload.numbers || query.numbers || event.numbers || []
      const list = String(numbers).split(',').map(Number).filter((n) => !Number.isNaN(n))
      return { ...base, data: { numbers: list, sum: list.reduce((a, b) => a + b, 0) } }
    }

    case 'env':
      return {
        ...base,
        data: {
          node: process.version,
          platform: process.platform,
          memoryUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          env: process.env.SCF_NAMESPACE || process.env.TENCENTCLOUD_RUNENV || 'local'
        }
      }

    case 'greet': {
      const name = payload.name || query.name || event.name || 'CloudBase'
      return { ...base, data: { message: `hello ${name}, from CloudBase event function` } }
    }

    default:
      return { ...base, ok: false, error: `未知的 action：${action}`, supported: ['greet', 'time', 'echo', 'sum', 'env'] }
  }
}
