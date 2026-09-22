const http = require('http')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      message: 'Hello from HTTP function (http-demo)',
      cli: '3.8.0-beta.4',
      path: req.url,
      method: req.method
    })
  )
})

const port = process.env.PORT || 9000
server.listen(port, () => {
  console.log(`http-demo listening on ${port}`)
})
