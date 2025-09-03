const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.SOCKET_PORT || 3001

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  // Store connected users
  const connectedUsers = new Map()
  const adminUsers = new Set()

  io.on('connection', (socket) => {

    // Handle user authentication
    socket.on('authenticate', (data) => {
      const { userId, userRole } = data
      connectedUsers.set(socket.id, { userId, userRole })
      
      if (userRole === 'ADMIN') {
        adminUsers.add(socket.id)
        socket.join('admin-room')
      }
      
      socket.join(`user-${userId}`)

    })

    // Handle room joining
    socket.on('join-room', (data) => {
      const { room } = data
      socket.join(room)

    })

    socket.on('leave-room', (data) => {
      const { room } = data
      socket.leave(room)

    })

    // Cart synchronization
    socket.on('cart-update', (cartData) => {
      const user = connectedUsers.get(socket.id)
      if (user) {
        socket.to(`user-${user.userId}`).emit('cart-updated', cartData)
      }
    })

    // Order tracking
    socket.on('track-order', (data) => {
      const { orderId } = data
      socket.join(`order-${orderId}`)

    })

    // Admin functions
    socket.on('admin-broadcast', (data) => {
      const user = connectedUsers.get(socket.id)
      if (user && user.userRole === 'ADMIN') {
        socket.to('admin-room').emit('admin-notification', data)
      }
    })

    // Handle order status updates (from admin)
    socket.on('order-status-update', (data) => {
      const { orderId, status, message } = data
      const user = connectedUsers.get(socket.id)
      
      if (user && user.userRole === 'ADMIN') {
        io.to(`order-${orderId}`).emit('order-updated', {
          orderId,
          status,
          message,
          timestamp: new Date().toISOString()
        })
        
        // Notify admins
        socket.to('admin-room').emit('admin-notification', {
          type: 'order-updated',
          orderId,
          status,
          message
        })
      }
    })

    // Stock updates
    socket.on('stock-update', (data) => {
      const { productId, quantity } = data
      const user = connectedUsers.get(socket.id)
      
      if (user && user.userRole === 'ADMIN') {
        io.emit('stock-updated', { productId, quantity })
      }
    })

    // New order notification to admins
    socket.on('new-order', (orderData) => {
      io.to('admin-room').emit('admin-notification', {
        type: 'new-order',
        order: orderData,
        timestamp: new Date().toISOString()
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {

      connectedUsers.delete(socket.id)
      adminUsers.delete(socket.id)
    })
  })

  server.listen(PORT, (err) => {
    if (err) throw err

  })
})

// Graceful shutdown
process.on('SIGTERM', () => {

  process.exit(0)
})

process.on('SIGINT', () => {

  process.exit(0)
})