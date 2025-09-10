'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseRealTimeUpdatesOptions {
  onUIUpdate?: (data: any) => void
  onLanguageUpdate?: (data: any) => void
  onOrderUpdate?: (data: any) => void
  onInventoryUpdate?: (data: any) => void
  autoReconnect?: boolean
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  
  const {
    onUIUpdate,
    onLanguageUpdate,
    onOrderUpdate,
    onInventoryUpdate,
    autoReconnect = true
  } = options

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return // SSR 체크
    
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return // Already connected
    }

    console.log('🔄 Connecting to real-time updates...')
    
    eventSourceRef.current = new EventSource('/api/events/stream')

    eventSourceRef.current.onopen = () => {
      console.log('✅ Real-time updates connected')
      reconnectAttempts.current = 0
    }

    eventSourceRef.current.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data)
        
        switch (eventData.type) {
          case 'ui-section-update':
            onUIUpdate?.(eventData.data)
            break
          case 'language-pack-update':
            onLanguageUpdate?.(eventData.data)
            break
          case 'order-update':
            onOrderUpdate?.(eventData.data)
            break
          case 'inventory-update':
            onInventoryUpdate?.(eventData.data)
            break
          case 'heartbeat':
            // Keep connection alive
            break
          default:
            console.log('Unknown event type:', eventData.type)
        }
      } catch (error) {
        console.error('Error parsing event data:', error)
      }
    }

    eventSourceRef.current.onerror = () => {
      console.log('❌ Real-time connection error')
      
      if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++
          eventSourceRef.current?.close()
          connect()
        }, delay)
      }
    }
  }, [onUIUpdate, onLanguageUpdate, onOrderUpdate, onInventoryUpdate, autoReconnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      console.log('📤 Disconnected from real-time updates')
    }
  }, [])

  const isConnected = useCallback(() => {
    if (typeof window === 'undefined') return false
    return eventSourceRef.current?.readyState === EventSource.OPEN
  }, [])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    connect,
    disconnect,
    isConnected: isConnected()
  }
}