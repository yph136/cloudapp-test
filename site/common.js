/* 页面共用：API 请求封装、导航高亮、轻提示 */
(function () {
  // 部署在网关 /api-http 下时，可用 ?apiBase=/api-http 覆盖
  var params = new URLSearchParams(location.search)
  var API_BASE = params.get('apiBase') || window.API_BASE || ''

  async function request(method, path, body) {
    var options = { method: method, headers: { 'Content-Type': 'application/json' } }
    if (body !== undefined) options.body = JSON.stringify(body)

    var res
    try {
      res = await fetch(API_BASE + path, options)
    } catch (e) {
      throw new Error('网络请求失败，请确认服务已启动')
    }

    var text = await res.text()
    var data = null
    try {
      data = JSON.parse(text)
    } catch (_) {
      data = { raw: text }
    }
    if (!res.ok) throw new Error((data && data.error) || ('请求失败：' + res.status))
    return data
  }

  function toast(message, type) {
    var el = document.createElement('div')
    el.className = 'toast' + (type === 'error' ? ' error' : '')
    el.textContent = message
    document.body.appendChild(el)
    setTimeout(function () {
      el.remove()
    }, 2600)
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    var current = location.pathname.split('/').pop() || 'index.html'
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      if (el.getAttribute('data-nav') === current) {
        el.classList.add('active')
        el.setAttribute('aria-current', 'page')
      }
    })
  })

  window.API_BASE = API_BASE
  window.api = {
    get: function (path) { return request('GET', path) },
    post: function (path, body) { return request('POST', path, body) },
    put: function (path, body) { return request('PUT', path, body) },
    del: function (path) { return request('DELETE', path) }
  }
  window.toast = toast
  window.escapeHtml = escapeHtml
})()
