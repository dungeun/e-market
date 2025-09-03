'use client'

import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect() {
    if (!this.socket || !this.isConnected) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        autoConnect: true,
      })

      this.socket.on('connect', () => {
        this.isConnected = true

      })

      this.socket.on('disconnect', () => {
        this.isConnected = false

      })
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event: string, data: unknown) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: unknown) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  joinRoom(room: string) {
    this.emit('join-room', { room })
  }

  leaveRoom(room: string) {
    this.emit('leave-room', { room })
  }

  // Cart sync events
  syncCart(cartData: unknown) {
    this.emit('cart-update', cartData)
  }

  onCartUpdate(callback: (data: unknown) => void) {
    this.on('cart-updated', callback)
  }

  // Order tracking events
  trackOrder(orderId: string) {
    this.emit('track-order', { orderId })
  }

  onOrderUpdate(callback: (data: unknown) => void) {
    this.on('order-updated', callback)
  }

  // Admin notifications
  onAdminNotification(callback: (data: unknown) => void) {
    this.on('admin-notification', callback)
  }

  // Stock updates
  onStockUpdate(callback: (data: unknown) => void) {
    this.on('stock-updated', callback)
  }
}

export const socketService = new SocketService()

// Hook for using socket in components
export function useSocket() {
  return socketService
}