'use client'

import { useEffect, useState } from 'react'
import { env } from '@/lib/config/env';
import io, { Socket } from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Connect to Socket.io server on same port as Next.js app
    const socketUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : (process.env.NEXT_PUBLIC_APP_URL || env.appUrl);
      
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {

      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {

      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return { socket, isConnected }
}