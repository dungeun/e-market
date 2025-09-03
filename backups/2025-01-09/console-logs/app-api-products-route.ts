// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query, createQueryBuilder, transaction } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    const offset = (page - 1) * limit

    // SQL 쿼리 빌더 사용
    let queryBuilder = createQueryBuilder()
      .select(`
        p.id, p.name, p.slug, p.description, p.price, p.original_price, p.stock,
        p.category_id, p.status, p.featured, p.new, p.rating, p.review_count,
        p.created_at, p.updated_at, p.deleted_at,
        c.name as category_name, c.slug as category_slug
      `)
      .from('products p')
      .join('LEFT JOIN categories c ON p.category_id = c.id')
      .where("p.status = '판매중' AND p.deleted_at IS NULL")
      .groupBy('p.id, c.id')

    const params: any[] = []
    let paramIndex = 1

    if (category) {
      queryBuilder.where(`p.category_id = $${paramIndex}`)
      params.push(category)
      paramIndex++
    }

    if (search) {
      queryBuilder.where(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
      params.push(`%${search}%`)
      paramIndex++
    }

    // 정렬 처리
    const validSortColumns = ['created_at', 'name', 'price', 'rating']
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at'
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    queryBuilder.orderBy(sortColumn, sortOrder as 'ASC' | 'DESC')

    // 페이지네이션
    queryBuilder.limit(limit).offset(offset)

    const productsQuery = queryBuilder.build()

    // 총 개수 쿼리
    let countQueryBuilder = createQueryBuilder()
      .select('COUNT(DISTINCT p.id) as total')
      .from('products p')
      .where("p.status = '판매중' AND p.deleted_at IS NULL")

    let countParams: any[] = []
    let countParamIndex = 1

    if (category) {
      countQueryBuilder.where(`p.category_id = $${countParamIndex}`)
      countParams.push(category)
      countParamIndex++
    }

    if (search) {
      countQueryBuilder.where(`(p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`)
      countParams.push(`%${search}%`)
    }

    const countQuery = countQueryBuilder.build()

    // 병렬 실행
    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, params),
      query(countQuery, countParams)
    ])

    const products = productsResult.rows
    const total = parseInt(countResult.rows[0]?.total || '0')

    // 각 상품의 이미지 가져오기
    if (products.length > 0) {
      const productIds = products.map(p => p.id)
      const imagesResult = await query(
        `SELECT id, product_id, url, alt, order_index
         FROM product_images 
         WHERE product_id = ANY($1) 
         ORDER BY order_index ASC`,
        [productIds]
      )

      // 이미지를 상품에 매핑
      const imagesMap = new Map()
      imagesResult.rows.forEach(img => {
        if (!imagesMap.has(img.product_id)) {
          imagesMap.set(img.product_id, [])
        }
        // 빈 문자열 URL 필터링
        if (img.url && img.url !== "") {
          imagesMap.get(img.product_id).push({
            id: img.id || `${img.product_id}_${img.order_index}`,
            url: img.url,
            alt: img.alt || '',
            order: img.order_index || 0
          })
        }
      })

      // 상품에 이미지 추가
      products.forEach(product => {
        product.images = imagesMap.get(product.id) || []
        product.rating = parseFloat(product.rating) || 0
        product.review_count = parseInt(product.review_count) || 0
        
        // 카테고리 정보 설정
        if (product.category_id && product.category_name) {
          product.category = {
            id: product.category_id,
            name: product.category_name,
            slug: product.category_slug
          }
        } else {
          product.category = null
        }
        
        // 불필요한 필드 제거
        delete product.category_id
        delete product.category_name
        delete product.category_slug
      })
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: '상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 트랜잭션을 사용하여 상품과 이미지를 함께 생성
    const result = await transaction(async (client) => {
      // 고유 ID 생성
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const slug = data.slug || data.name.toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')  // 특수문자 제거 (한글 유지)
        .replace(/\s+/g, '-')         // 공백을 하이픈으로
        .substring(0, 100)            // 길이 제한
      
      // 상품 생성
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, slug, description, price, original_price, condition, 
          category_id, stock, rating, review_count, featured, new, status, discount_rate
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *
      `, [
        productId,
        data.name,
        slug,
        data.description || null,
        data.price || 0,
        data.original_price || null,
        data.condition || 'GOOD',
        data.category_id || null,
        data.stock || 0,
        0, // rating
        0, // review_count
        data.featured || false,
        data.new !== undefined ? data.new : true,
        data.status || '판매중',
        data.discount_rate || 0
      ])

      const product = productResult.rows[0]

      // 이미지 생성 (있는 경우)
      const images = []
      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i]
          const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const imageResult = await client.query(`
            INSERT INTO product_images (id, product_id, url, webp_url, file_name, file_size, image_type, order_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
          `, [
            imageId,
            product.id,
            img.url,
            img.webpUrl || null,
            img.fileName || null,
            img.size || null,
            img.type || 'thumbnail',
            img.order || i
          ])
          images.push(imageResult.rows[0])
        }
      }

      // 카테고리 정보 가져오기 (있는 경우)
      let category = null
      if (product.category_id) {
        const categoryResult = await client.query(
          'SELECT id, name, slug FROM categories WHERE id = $1',
          [product.category_id]
        )
        category = categoryResult.rows[0] || null
      }

      return {
        ...product,
        images,
        category
      }
    })

    return NextResponse.json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      product: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '상품 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}