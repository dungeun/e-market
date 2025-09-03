const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.io 서버 초기화
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.io 이벤트 핸들러
  io.on('connection', (socket) => {
    console.log('✅ Socket.io 클라이언트 연결:', socket.id);

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

    // UI 섹션 업데이트
    socket.on('ui:section:update', (data) => {
      io.emit('ui:section:updated', data);
      console.log('UI section updated:', data);
    });

    // UI 섹션 순서 변경
    socket.on('ui:section:reorder', (data) => {
      io.emit('ui:section:reordered', data);
      console.log('UI section reordered:', data);
    });

    // UI 섹션 활성화/비활성화
    socket.on('ui:section:toggle', (data) => {
      io.emit('ui:section:toggled', data);
      console.log('UI section toggled:', data);
    });

    // 언어팩 업데이트
    socket.on('language:pack:update', (data) => {
      io.emit('language:pack:updated', data);
      console.log('Language pack updated:', data);
    });

    // 연결 끊김 처리
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io 클라이언트 연결 끊김:', socket.id, '- 이유:', reason);
    });

    // 에러 처리
    socket.on('error', (error) => {
      console.error('Socket.io 에러:', error);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io 서버가 동일한 포트에서 실행 중입니다`);
  });
});