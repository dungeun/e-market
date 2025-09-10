'use client'

interface SSEEvent {
  type: 'ui-section-update' | 'language-pack-update' | 'order-update' | 'inventory-update'
  data: any
  timestamp: number
}

class SSEManager {
  private eventSource: EventSource | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    if (this.eventSource) return

    this.eventSource = new EventSource('/api/events/stream')
    
    this.eventSource.onopen = () => {
      console.log('✅ SSE Connected')
      this.reconnectAttempts = 0
    }

    this.eventSource.onmessage = (event) => {
      try {
        const eventData: SSEEvent = JSON.parse(event.data)
        this.notifyListeners(eventData.type, eventData.data)
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    this.eventSource.onerror = () => {
      console.log('❌ SSE Connection error')
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    setTimeout(() => {
      this.reconnectAttempts++
      this.disconnect()
      this.connect()
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)
    
    // Auto-connect on first subscription
    if (!this.eventSource) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(eventType)
        }
      }
    }
  }

  private notifyListeners(eventType: string, data: any) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

// Singleton instance
export const sseManager = new SSEManager()

// React hook for SSE
export function useSSE(eventType: string, callback: (data: any) => void) {
  const callbackRef = React.useRef(callback)
  callbackRef.current = callback

  React.useEffect(() => {
    return sseManager.subscribe(eventType, (data) => {
      callbackRef.current(data)
    })
  }, [eventType])

  return sseManager.isConnected()
}