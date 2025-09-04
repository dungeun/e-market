import { notFound } from 'next/navigation'
import { query } from '@/lib/db'
import ProductDetailClient from './ProductDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  try {
    // URL 디코딩
    const decodedSlug = decodeURIComponent(slug)
    console.log('Searching for product with slug:', decodedSlug)
    
    // 상품 정보 조회 (모든 상태의 상품 조회)
    const productResult = await query(`
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.original_price, p.condition,
        p.category_id, p.stock, p.rating, p.review_count, p.featured, p.new, 
        p.status, p.discount_rate, p.created_at, p.updated_at,
        p.usage_period, p.purchase_date, p.detailed_description,
        p.seller_name, p.seller_location, p.verified_seller, p.defects, p.delivery_method,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.deleted_at IS NULL
    `, [decodedSlug])

    console.log('Product query result:', productResult.rows.length, 'rows')
    if (productResult.rows.length > 0) {
      console.log('First product found:', productResult.rows[0].name, productResult.rows[0].slug)
    }
    
    if (productResult.rows.length === 0) {
      console.log('Product not found for slug:', decodedSlug)
      // Let's also try to see what products exist
      const allProducts = await query('SELECT name, slug FROM products LIMIT 5')
      console.log('Available products:', allProducts.rows)
      notFound()
    }

    const product = productResult.rows[0]

    // 이미지 조회
    const imagesResult = await query(`
      SELECT * FROM product_images 
      WHERE product_id = $1 
      ORDER BY order_index ASC
    `, [product.id])

    // 리뷰 조회 (임시로 빈 배열)
    const reviews = []

    return {
      ...product,
      images: imagesResult.rows || [],
      category: product.category_name ? {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      } : null,
      reviews
    }
  } catch (error) {
    console.error('Error in getProduct:', error)
    notFound()
  }
}

async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return []

  try {
    const result = await query(`
      SELECT p.*, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.category_id = $1 AND p.id != $2 AND p.status = '판매중' AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT 4
    `, [categoryId, currentProductId])

    return result.rows.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.image_url ? [{ url: product.image_url }] : [],
      rating: 0, // TODO: Calculate from reviews
      reviewCount: 0 // TODO: Calculate from reviews
    }))
  } catch (error) {

    return []
  }
}

export async function generateStaticParams() {
  try {
    const result = await query(`
      SELECT slug FROM products 
      WHERE deleted_at IS NULL
    `)
    
    return result.rows.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {

    return []
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  const relatedProducts = await getRelatedProducts(product.category?.id || null, product.id)

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  )
}