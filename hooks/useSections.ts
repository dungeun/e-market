'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

interface UISection {
  id: string
  key: string
  title: string | null
  type: string
  isActive: boolean
  order: number
  data: unknown
  props: unknown
  style: unknown
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSections() {
  const { data, error, mutate, isLoading } = useSWR<{sections: UISection[]}>('/api/ui-sections', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  })

  // Optimistic update for section changes
  const updateSection = useCallback(async (sectionData: Partial<UISection> & { id: string }) => {
    try {
      // Optimistically update the cache
      await mutate(
        (current) => {
          if (!current) return current
          
          const updatedSections = current.sections.map(section =>
            section.id === sectionData.id 
              ? { ...section, ...sectionData }
              : section
          ).filter(s => s.isActive)
            .sort((a, b) => a.order - b.order)
          
          return { sections: updatedSections }
        },
        false // Don't revalidate immediately
      )

      // Make the actual API call
      const response = await fetch('/api/ui-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      })

      if (!response.ok) {
        throw new Error('Failed to update section')
      }

      // Revalidate to ensure consistency
      mutate()
      
      return { success: true }
    } catch (error) {
      // Rollback optimistic update on error
      mutate()
      return { success: false, error: error.message }
    }
  }, [mutate])

  // Optimistic delete
  const deleteSection = useCallback(async (id: string) => {
    try {
      // Optimistically remove from cache
      await mutate(
        (current) => {
          if (!current) return current
          return {
            sections: current.sections.filter(section => section.id !== id)
          }
        },
        false
      )

      const response = await fetch(`/api/ui-sections?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete section')
      }

      mutate()
      return { success: true }
    } catch (error) {
      mutate() // Rollback on error
      return { success: false, error: error.message }
    }
  }, [mutate])

  // Optimistic reorder
  const reorderSections = useCallback(async (newOrder: UISection[]) => {
    try {
      // Optimistically update order
      await mutate(
        () => ({ sections: newOrder }),
        false
      )

      const orderData = newOrder.map((section, index) => ({
        id: section.id,
        order: index
      }))

      const response = await fetch('/api/ui-sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionOrders: orderData })
      })

      if (!response.ok) {
        throw new Error('Failed to reorder sections')
      }

      mutate()
      return { success: true }
    } catch (error) {
      mutate() // Rollback on error
      return { success: false, error: error.message }
    }
  }, [mutate])

  const sections = data?.sections?.filter(s => s.isActive).sort((a, b) => a.order - b.order) || []

  return {
    sections,
    isLoading,
    error,
    updateSection,
    deleteSection,
    reorderSections,
    refresh: mutate
  }
}