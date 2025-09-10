'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { query } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function updateUISection(sectionData: {
  id?: string
  sectionId: string
  type: string
  title: string
  content?: any
  order?: number
  visible?: boolean
  translations?: any
}) {
  try {
    const { id, sectionId, type, title, content, order, visible, translations } = sectionData

    let result
    if (id) {
      // Update existing section
      result = await query(
        `UPDATE ui_sections 
         SET type = $2, title = $3, data = $4, "order" = $5, "isActive" = $6, translations = $7, "updatedAt" = NOW()
         WHERE id = $1
         RETURNING *`,
        [id, type, title, JSON.stringify(content || {}), order || 0, visible !== false, JSON.stringify(translations || {})]
      )
    } else {
      // Create new section
      const newId = require('crypto').randomUUID()
      result = await query(
        `INSERT INTO ui_sections (id, key, type, title, data, "order", "isActive", translations, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [newId, sectionId, type, title, JSON.stringify(content || {}), order || 0, visible !== false, JSON.stringify(translations || {})]
      )
    }

    // Revalidate the main page and sections API
    revalidateTag('ui-sections')
    revalidatePath('/', 'layout')
    revalidatePath('/api/ui-sections')

    return { success: true, section: result.rows[0] }
  } catch (error) {
    logger.error('Error updating UI section:', error)
    return { success: false, error: 'Failed to update section' }
  }
}

export async function deleteUISection(id: string) {
  try {
    await query('DELETE FROM ui_sections WHERE id = $1', [id])
    
    // Revalidate after deletion
    revalidateTag('ui-sections')
    revalidatePath('/', 'layout')
    revalidatePath('/api/ui-sections')

    return { success: true }
  } catch (error) {
    logger.error('Error deleting UI section:', error)
    return { success: false, error: 'Failed to delete section' }
  }
}

export async function reorderSections(sectionOrders: { id: string, order: number }[]) {
  try {
    // Update all section orders in a transaction
    const promises = sectionOrders.map(({ id, order }) =>
      query(
        'UPDATE ui_sections SET "order" = $1, "updatedAt" = NOW() WHERE id = $2',
        [order, id]
      )
    )
    
    await Promise.all(promises)
    
    // Revalidate after reordering
    revalidateTag('ui-sections')
    revalidatePath('/', 'layout')
    revalidatePath('/api/ui-sections')

    return { success: true }
  } catch (error) {
    logger.error('Error reordering sections:', error)
    return { success: false, error: 'Failed to reorder sections' }
  }
}

export async function toggleSectionVisibility(id: string, isActive: boolean) {
  try {
    const result = await query(
      'UPDATE ui_sections SET "isActive" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [isActive, id]
    )
    
    // Revalidate after visibility change
    revalidateTag('ui-sections')
    revalidatePath('/', 'layout')
    revalidatePath('/api/ui-sections')

    return { success: true, section: result.rows[0] }
  } catch (error) {
    logger.error('Error toggling section visibility:', error)
    return { success: false, error: 'Failed to toggle visibility' }
  }
}