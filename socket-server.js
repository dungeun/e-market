const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join admin room if admin
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined:', socket.id);
  });
  
  // Handle server-side broadcast (from API routes)
  socket.on('server-broadcast', ({ event, data }) => {
    console.log('Server broadcast received:', event, data);
    // Broadcast to all clients except sender
    socket.broadcast.emit(event, data);
  });
  
  // Handle UI section updates
  socket.on('ui:section:updated', (data) => {
    console.log('Section updated:', data);
    socket.broadcast.emit('ui:section:updated', data);
  });
  
  // Handle UI section reordering
  socket.on('ui:section:reordered', (data) => {
    console.log('Section reordered:', data);
    socket.broadcast.emit('ui:section:reordered', data);
  });
  
  // Handle language changes
  socket.on('language:changed', (data) => {
    console.log('Language changed:', data);
    // Broadcast to all clients including main page
    io.emit('language:changed', data);
  });
  
  // Handle language pack updates (for real-time UI updates)
  socket.on('languagePack:updated', (data) => {
    console.log('Language pack updated:', data);
    io.emit('languagePack:updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});