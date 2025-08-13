'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { socketService } from '@/lib/socket'
import { useAuthStore } from '@/lib/stores/auth-store'

interface SocketContextType {
  isConnected: boolean
  socket: typeof socketService | null
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  socket: null,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    const socket = socketService.connect()

    socket.on('connect', () => {
      setIsConnected(true)
      
      // Authenticate user if logged in
      if (user) {
        socketService.emit('authenticate', {
          userId: user.id,
          userRole: user.role,
        })
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      socketService.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ isConnected, socket: socketService }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}