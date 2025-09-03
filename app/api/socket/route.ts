import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';
import { setSocketInstance, getSocketInstance } from '@/lib/socket';

// Global Socket.io server instance check
let ioServer: Server | null = null;

const SocketHandler = async (req: NextRequest) => {
  // For Next.js App Router, we need to handle Socket.io differently
  // This endpoint will be used to initialize the Socket.io server
  
  try {
    // Check if Socket.io server is already initialized
    if (!ioServer) {
      // Initialize Socket.io server with HTTP server when needed
      // Note: In production, you might want to use a separate server for Socket.io
      console.log('Socket.io server initialization handled by middleware');
    }

    return NextResponse.json({ 
      status: 'Socket.io endpoint ready',
      connected: !!getSocketInstance()
    });
  } catch (error) {
    console.error('Socket.io handler error:', error);
    return NextResponse.json({ 
      error: 'Socket.io initialization failed' 
    }, { status: 500 });
  }
};

// Initialize Socket.io server (will be handled by middleware in production)
const initializeSocketIO = () => {
  if (typeof window !== 'undefined') return; // Client-side guard
  
  try {
    // Check if Socket.io server is already running by checking global instance
    const existingInstance = getSocketInstance();
    if (existingInstance) {
      console.log('Socket.io server already running');
      return;
    }
    
    // Socket.io server setup will be handled by custom server or middleware
    // For development, we'll create a simple HTTP server
    if (!ioServer && process.env.NODE_ENV === 'development') {
      const { createServer } = require('http');
      const { Server: SocketIOServer } = require('socket.io');
      
      // Create HTTP server for Socket.io
      const httpServer = createServer();
      ioServer = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
      });

      // Set up Socket.io event handlers
      setupSocketIOHandlers(ioServer);
      setSocketInstance(ioServer);

      // Start Socket.io server on different port
      const port = 3004;
      httpServer.listen(port, () => {
        console.log(`Socket.io server running on port ${port}`);
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} already in use - Socket.io server already running`);
        } else {
          console.error('Socket.io server error:', err);
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize Socket.io:', error);
  }
};

const setupSocketIOHandlers = (io: Server) => {
    io.on('connection', (socket) => {
      console.log('Socket.io client connected:', socket.id);

      // 주문 상태 업데이트
      socket.on('order:status', (data) => {
        io.to(`user:${data.userId}`).emit('order:statusUpdate', data);
      });

      // 재고 업데이트
      socket.on('inventory:update', (data) => {
        io.emit('inventory:changed', data);
      });

      // 실시간 장바구니 동기화
      socket.on('cart:update', (data) => {
        socket.to(`user:${data.userId}`).emit('cart:sync', data);
      });

      // 알림
      socket.on('notification:send', (data) => {
        io.to(`user:${data.userId}`).emit('notification:receive', data);
      });

      // 사용자별 룸 참가
      socket.on('user:join', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room`);
      });

      // 관리자 룸
      socket.on('admin:join', () => {
        socket.join('admin');
        console.log('Admin joined room');
      });

      // UI 섹션 업데이트 (관리자 → 메인페이지)
      socket.on('ui:section:update', (data) => {
        // 모든 클라이언트에게 섹션 업데이트 알림
        io.emit('ui:section:updated', data);
      });

      // UI 섹션 순서 변경
      socket.on('ui:section:reorder', (data) => {
        io.emit('ui:section:reordered', data);
      });

      // UI 섹션 활성화/비활성화
      socket.on('ui:section:toggle', (data) => {
        io.emit('ui:section:toggled', data);
      });

      // 언어팩 업데이트
      socket.on('language:pack:update', (data) => {
        io.emit('language:pack:updated', data);
      });

      socket.on('disconnect', () => {
        console.log('Socket.io client disconnected:', socket.id);
      });
    });
};

// Initialize Socket.io on module load (development only)
if (process.env.NODE_ENV === 'development') {
  initializeSocketIO();
}

export { SocketHandler as GET, SocketHandler as POST };