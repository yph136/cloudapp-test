const params = new URLSearchParams(window.location.search)
export const API_BASE = params.get('apiBase') || ''

async function request(method, path, body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) options.body = JSON.stringify(body)

  let res
  try {
    res = await fetch(API_BASE + path, options)
  } catch {
    throw new Error('网络请求失败，请确认服务已启动')
  }

  const text = await res.text()
  let data = null
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }
  if (!res.ok) throw new Error((data && data.error) || `请求失败：${res.status}`)
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path)
}

export function toast(message, type) {
  const el = document.createElement('div')
  el.className = 'toast' + (type === 'error' ? ' error' : '')
  el.textContent = message
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2600)
}
