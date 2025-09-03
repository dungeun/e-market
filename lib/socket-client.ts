import { io } from 'socket.io-client'

// API 라우트에서 Socket.io 서버로 이벤트를 보내기 위한 클라이언트
let socketClient: any = null

export const getSocketClient = () => {
  if (!socketClient) {
    socketClient = io('http://localhost:3004', {
      transports: ['websocket', 'polling'],
    })
  }
  return socketClient
}

export const emitToAll = (event: string, data: any) => {
  const client = getSocketClient()
  console.log('Socket client status:', client?.connected ? 'connected' : 'disconnected')
  console.log('Attempting to emit event:', event, data)
  
  if (client && client.connected) {
    // 서버로 이벤트 보내기
    client.emit('server-broadcast', { event, data })
    console.log('Event emitted successfully')
  } else {
    console.log('Socket client not connected, attempting to connect...')
    client?.connect()
    // 연결 후 재시도
    setTimeout(() => {
      if (client?.connected) {
        client.emit('server-broadcast', { event, data })
        console.log('Event emitted after reconnection')
      } else {
        console.log('Failed to emit event - still not connected')
      }
    }, 100)
  }
}