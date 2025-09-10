'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface PollingOptions {
  interval?: number
  maxInterval?: number
  backoffMultiplier?: number
  maxRetries?: number
  enabled?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: any) => void
}

export function useIntelligentPolling<T>(
  fetcher: () => Promise<T>,
  options: PollingOptions = {}
) {
  const {
    interval = 5000,
    maxInterval = 60000,
    backoffMultiplier = 1.5,
    maxRetries = 5,
    enabled = true,
    onError,
    onSuccess
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const retriesRef = useRef(0)
  const currentIntervalRef = useRef(interval)
  
  const poll = useCallback(async () => {
    if (!enabled) return

    try {
      setIsPolling(true)
      const result = await fetcher()
      
      setData(result)
      setError(null)
      retriesRef.current = 0
      currentIntervalRef.current = interval // Reset interval on success
      
      onSuccess?.(result)
      
      // Schedule next poll
      timeoutRef.current = setTimeout(poll, interval)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Polling failed')
      setError(error)
      onError?.(error)
      
      retriesRef.current += 1
      
      if (retriesRef.current >= maxRetries) {
        console.error('Max polling retries reached')
        setIsPolling(false)
        return
      }
      
      // Exponential backoff
      currentIntervalRef.current = Math.min(
        currentIntervalRef.current * backoffMultiplier,
        maxInterval
      )
      
      // Schedule retry
      timeoutRef.current = setTimeout(poll, currentIntervalRef.current)
    } finally {
      setIsPolling(false)
    }
  }, [fetcher, enabled, interval, maxInterval, backoffMultiplier, maxRetries, onError, onSuccess])

  const startPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    retriesRef.current = 0
    currentIntervalRef.current = interval
    poll()
  }, [poll, interval])

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    setIsPolling(false)
  }, [])

  const resetPolling = useCallback(() => {
    stopPolling()
    setError(null)
    startPolling()
  }, [stopPolling, startPolling])

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    error,
    isPolling,
    startPolling,
    stopPolling,
    resetPolling
  }
}

// Specialized hook for sections polling
export function useSectionsPolling() {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/ui-sections')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }, [])

  return useIntelligentPolling(fetcher, {
    interval: 10000, // Poll every 10 seconds
    maxInterval: 60000, // Max 1 minute interval
    backoffMultiplier: 2,
    maxRetries: 3,
    enabled: typeof window !== 'undefined' && document.visibilityState === 'visible'
  })
}