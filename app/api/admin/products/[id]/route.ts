// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// PUT /api/admin/products/[id] - 특정 상품 수정 (PostgreSQL 사용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id
    const updatedProductData = await request.json()

    // 업데이트 쿼리 구성
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    // 필드별 업데이트 로직
    if (updatedProductData.name) {
      updateFields.push(`name = $${paramIndex}`)
      updateValues.push(updatedProductData.name)
      paramIndex++
    }
    if (updatedProductData.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      updateValues.push(updatedProductData.description)
      paramIndex++
    }
    if (updatedProductData.price !== undefined) {
      updateFields.push(`price = $${paramIndex}`)
      updateValues.push(parseFloat(updatedProductData.price))
      paramIndex++
    }
    if (updatedProductData.originalPrice !== undefined) {
      updateFields.push(`original_price = $${paramIndex}`)
      updateValues.push(parseFloat(updatedProductData.originalPrice))
      paramIndex++
    }
    if (updatedProductData.condition) {
      updateFields.push(`condition = $${paramIndex}`)
      updateValues.push(updatedProductData.condition)
      paramIndex++
    }
    if (updatedProductData.category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex}`)
      updateValues.push(updatedProductData.category_id)
      paramIndex++
    }
    if (updatedProductData.stock !== undefined) {
      updateFields.push(`stock = $${paramIndex}`)
      updateValues.push(parseInt(updatedProductData.stock))
      paramIndex++
    }
    if (updatedProductData.featured !== undefined) {
      updateFields.push(`featured = $${paramIndex}`)
      updateValues.push(updatedProductData.featured)
      paramIndex++
    }
    if (updatedProductData.new !== undefined) {
      updateFields.push(`new = $${paramIndex}`)
      updateValues.push(updatedProductData.new)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    // 업데이트 시간 추가
    updateFields.push(`updated_at = $${paramIndex}`)
    updateValues.push(new Date())
    paramIndex++

    // 상품 ID 추가
    updateValues.push(productId)

    const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `

    const result = await query(updateQuery, updateValues)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product: result.rows[0],
      message: 'Product updated successfully'
    })

  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// GET /api/admin/products/[id] - 특정 상품 조회 (PostgreSQL 사용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id

    // PostgreSQL에서 상품 조회
    const productResult = await query(`
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.original_price, p.condition,
        p.category_id, p.stock, p.rating, p.review_count, p.featured, p.new, 
        p.status, p.discount_rate, p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `, [productId])

    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]

    // 상품 이미지 가져오기
    const imagesResult = await query(
      `SELECT url, webp_url, file_name, image_type, order_index
       FROM product_images 
       WHERE product_id = $1 
       ORDER BY order_index ASC`,
      [productId]
    )

    // 이미지 데이터 처리
    const images = imagesResult.rows.map(img => ({
      id: `${productId}_${img.order_index}`,
      url: img.url,
      webpUrl: img.webp_url,
      fileName: img.file_name,
      type: img.image_type,
      order: img.order_index
    }))

    // 카테고리 정보 처리
    let category = null
    if (product.category_id && product.category_name) {
      category = {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      }
    }

    const result = {
      ...product,
      images,
      category,
      price: product.price.toString(),
      originalPrice: product.original_price ? product.original_price.toString() : null,
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.review_count) || 0,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }

    // 불필요한 필드 제거
    delete result.category_id
    delete result.category_name
    delete result.category_slug
    delete result.created_at
    delete result.updated_at

    return NextResponse.json({
      success: true,
      product: result
    })

  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] - 특정 상품 소프트 삭제 (PostgreSQL 사용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id

    // PostgreSQL에서 소프트 삭제 (deleted_at 필드 업데이트)
    const result = await query(
      'UPDATE products SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [new Date(), productId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const deletedProduct = result.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Product moved to trash successfully',
      deletedProduct: {
        ...deletedProduct,
        deletedAt: deletedProduct.deleted_at
      }
    })

  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}