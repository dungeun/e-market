import type { User, RequestContext } from '@/lib/types/common';
import { env } from '@/lib/config/env';
import { Server } from 'socket.io'
import { NextRequest } from 'next/server'

const SocketHandler = (req: NextRequest, res: unknown) => {
  if (res.socket.server.io) {

  } else {

    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || env.appUrl,
        methods: ['GET', 'POST'],
      },
    })

    res.socket.server.io = io

    io.on('connection', (socket) => {

      // 주문 상태 업데이트
      socket.on('order:status', (data) => {
        io.to(`user:${data.userId}`).emit('order:statusUpdate', data)
      })

      // 재고 업데이트
      socket.on('inventory:update', (data) => {
        io.emit('inventory:changed', data)
      })

      // 실시간 장바구니 동기화
      socket.on('cart:update', (data) => {
        socket.to(`user:${data.userId}`).emit('cart:sync', data)
      })

      // 알림
      socket.on('notification:send', (data) => {
        io.to(`user:${data.userId}`).emit('notification:receive', data)
      })

      // 사용자별 룸 참가
      socket.on('user:join', (userId) => {
        socket.join(`user:${userId}`)

      })

      // 관리자 룸
      socket.on('admin:join', () => {
        socket.join('admin')

      })

      socket.on('disconnect', () => {

      })
    })
  }
  res.end()
}

export { SocketHandler as GET, SocketHandler as POST }