import { query } from '@/lib/db'
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  price: number
  original_price?: number
  cost?: number
  stock: number
  images: ProductImage[]
  categories: Category[]
  metadata: Record<string, any>
  status: 'active' | 'inactive' | 'draft'
  featured: boolean
  new: boolean
  rating?: number
  review_count?: number
  created_at: Date
  updated_at: Date
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  order_index: number
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
}

export interface ProductFilter {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'created' | 'rating'
  page?: number
  limit?: number
}

export class ProductService {
  // Cache TTL in seconds
  private readonly CACHE_TTL = 300 // 5 minutes
  
  // Get all products with filtering
  async getProducts(filter: ProductFilter = {}): Promise<{
    products: Product[]
    total: number
    page: number
    limit: number
  }> {
    const page = filter.page || 1
    const limit = filter.limit || 20
    const offset = (page - 1) * limit
    
    // Try cache first
    const cacheKey = `products:${JSON.stringify(filter)}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Build query
    let whereConditions: string[] = ['p.deleted_at IS NULL']
    let params: any[] = []
    let paramIndex = 1
    
    if (filter.category) {
      whereConditions.push(`c.slug = $${paramIndex++}`)
      params.push(filter.category)
    }
    
    if (filter.minPrice !== undefined) {
      whereConditions.push(`p.price >= $${paramIndex++}`)
      params.push(filter.minPrice)
    }
    
    if (filter.maxPrice !== undefined) {
      whereConditions.push(`p.price <= $${paramIndex++}`)
      params.push(filter.maxPrice)
    }
    
    if (filter.inStock) {
      whereConditions.push('p.stock > 0')
    }
    
    if (filter.featured) {
      whereConditions.push('p.featured = true')
    }
    
    if (filter.search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
      params.push(`%${filter.search}%`)
      paramIndex++
    }
    
    // Order by
    let orderBy = 'p.created_at DESC'
    switch (filter.sortBy) {
      case 'price_asc':
        orderBy = 'p.price ASC'
        break
      case 'price_desc':
        orderBy = 'p.price DESC'
        break
      case 'name':
        orderBy = 'p.name ASC'
        break
      case 'rating':
        orderBy = 'p.rating DESC NULLS LAST'
        break
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const countResult = await query(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `, params)
    
    const total = parseInt(countResult.rows[0].total)
    
    // Get products
    params.push(limit, offset)
    const productsResult = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt,
              'order_index', pi.order_index
            ) ORDER BY pi.order_index
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${whereClause}
      GROUP BY p.id, c.name, c.slug
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, params)
    
    const products = productsResult.rows.map(row => ({
      ...row,
      categories: row.category_name ? [{
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      }] : []
    }))
    
    const result = {
      products,
      total,
      page,
      limit
    }
    
    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result))
    
    return result
  }
  
  // Get single product
  async getProduct(idOrSlug: string): Promise<Product | null> {
    // Try cache first
    const cacheKey = `product:${idOrSlug}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt,
              'order_index', pi.order_index
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'} AND p.deleted_at IS NULL
      GROUP BY p.id, c.name, c.slug
    `, [idOrSlug])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const product = {
      ...result.rows[0],
      categories: result.rows[0].category_name ? [{
        id: result.rows[0].category_id,
        name: result.rows[0].category_name,
        slug: result.rows[0].category_slug
      }] : []
    }
    
    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(product))
    
    return product
  }
  
  // Search products
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const cacheKey = `search:${query}:${limit}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), 
                plainto_tsquery('english', $1)) as rank
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ 
        plainto_tsquery('english', $1)
        AND p.deleted_at IS NULL
      ORDER BY rank DESC
      LIMIT $2
    `, [query, limit])
    
    const products = result.rows.map(row => ({
      ...row,
      categories: row.category_name ? [{
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      }] : []
    }))
    
    // Cache for shorter time
    await redis.setex(cacheKey, 60, JSON.stringify(products))
    
    return products
  }
  
  // Get related products
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const cacheKey = `related:${productId}:${limit}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Get the product's category
    const productResult = await query(`
      SELECT category_id FROM products WHERE id = $1
    `, [productId])
    
    if (productResult.rows.length === 0) {
      return []
    }
    
    const categoryId = productResult.rows[0].category_id
    
    // Get related products from same category
    const result = await query(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'url', pi.url,
              'alt', pi.alt,
              'order_index', pi.order_index
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE 
        p.category_id = $1 
        AND p.id != $2
        AND p.deleted_at IS NULL
        AND p.stock > 0
      GROUP BY p.id, c.name, c.slug
      ORDER BY p.rating DESC NULLS LAST, p.created_at DESC
      LIMIT $3
    `, [categoryId, productId, limit])
    
    const products = result.rows.map(row => ({
      ...row,
      categories: row.category_name ? [{
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      }] : []
    }))
    
    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(products))
    
    return products
  }
  
  // Update product stock
  async updateStock(productId: string, quantity: number, operation: 'increment' | 'decrement' | 'set'): Promise<boolean> {
    try {
      let updateQuery = ''
      let params: any[] = []
      
      switch (operation) {
        case 'increment':
          updateQuery = 'UPDATE products SET stock = stock + $2, updated_at = NOW() WHERE id = $1'
          params = [productId, quantity]
          break
        case 'decrement':
          updateQuery = 'UPDATE products SET stock = GREATEST(0, stock - $2), updated_at = NOW() WHERE id = $1'
          params = [productId, quantity]
          break
        case 'set':
          updateQuery = 'UPDATE products SET stock = $2, updated_at = NOW() WHERE id = $1'
          params = [productId, quantity]
          break
      }
      
      await query(updateQuery, params)
      
      // Invalidate cache
      await this.invalidateProductCache(productId)
      
      return true
    } catch (error) {

      return false
    }
  }
  
  // Invalidate product cache
  private async invalidateProductCache(productId: string) {
    const keys = await redis.keys(`*product*${productId}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
  
  // Bulk update stocks (for order processing)
  async bulkUpdateStocks(updates: { productId: string; quantity: number }[]): Promise<boolean> {
    const client = await query('BEGIN')
    
    try {
      for (const update of updates) {
        await query(
          'UPDATE products SET stock = GREATEST(0, stock - $2), updated_at = NOW() WHERE id = $1',
          [update.productId, update.quantity]
        )
      }
      
      await query('COMMIT')
      
      // Invalidate cache for all updated products
      for (const update of updates) {
        await this.invalidateProductCache(update.productId)
      }
      
      return true
    } catch (error) {
      await query('ROLLBACK')

      return false
    }
  }
}

// Export singleton instance
export const productService = new ProductService()