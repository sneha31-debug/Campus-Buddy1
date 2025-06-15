// server.js
import http from 'http'

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'success',
    message: 'Pure Node backend is running 🚀'
  }))
})

server.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`)
})
