import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export const getSocketInstance = (): SocketIOServer | null => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드에서는 null 반환
    return null
  }

  // 서버 사이드에서는 글로벌 io 인스턴스 반환
  return (global as any)?.socketio || null
}

export const setSocketInstance = (server: SocketIOServer) => {
  if (typeof window === 'undefined') {
    (global as any).socketio = server
    io = server
  }
}

export const emitToAll = (event: string, data: any) => {
  const socketInstance = getSocketInstance()
  if (socketInstance) {
    socketInstance.emit(event, data)
  }
}

export const emitToAdmin = (event: string, data: any) => {
  const socketInstance = getSocketInstance()
  if (socketInstance) {
    socketInstance.to('admin').emit(event, data)
  }
}