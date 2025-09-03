// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: string[];
  category: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  new: boolean;
  status?: string;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  originalPrice?: string;
  discountRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 상품 상태 계산
function getProductStatus(stock: number, currentStatus?: string) {
  if (currentStatus && currentStatus !== 'ACTIVE') return '판매중지';
  if (stock === 0) return '품절';
  if (stock < 5) return '재고부족';
  return '판매중';
}

// 할인율 계산
function calculateDiscountRate(originalPrice?: string, currentPrice?: string) {
  if (!originalPrice || !currentPrice) return 0;
  const original = parseFloat(originalPrice);
  const current = parseFloat(currentPrice);
  if (original <= 0 || current <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}

// POST: 중고 상품 등록 (PostgreSQL 사용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      originalPrice,
      condition = 'GOOD',
      category_id,
      categoryId, // also accept categoryId
      images,
      stock = 1,
      featured = false,
      isNew = true,
      usagePeriod, // 사용기간 추가
      purchaseDate, // 구매시기 추가
      detailedDescription // 상세설명 추가
    } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: '상품명과 가격은 필수입니다.' },
        { status: 400 }
      )
    }

    // 할인율 자동 계산
    const calculatedOriginalPrice = originalPrice || (parseFloat(price) * 1.3);
    const discountRate = calculateDiscountRate(calculatedOriginalPrice.toString(), price);
    const slug = name.toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')  // 특수문자 제거 (한글 유지)
      .replace(/\s+/g, '-')         // 공백을 하이픈으로
      .substring(0, 100);           // 길이 제한
    
    const status = getProductStatus(stock);

    // PostgreSQL에 상품 저장
    const result = await transaction(async (client) => {
      // 고유 ID 생성
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 상품 생성
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, slug, description, price, original_price, condition, 
          category_id, stock, rating, review_count, featured, new, status, discount_rate,
          usage_period, purchase_date, detailed_description
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *
      `, [
        productId,
        name,
        slug,
        description || '',
        parseFloat(price),
        calculatedOriginalPrice,
        condition,
        category_id || categoryId || null, // Handle both category_id and categoryId
        parseInt(stock.toString()),
        0, // rating
        0, // review_count
        featured,
        isNew,
        status,
        discountRate,
        usagePeriod || null, // 사용기간
        purchaseDate || null, // 구매시기
        detailedDescription || null // 상세설명
      ])

      const product = productResult.rows[0]

      // 이미지 생성 (있는 경우)
      const savedImages = []
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i]
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
          savedImages.push(imageResult.rows[0])
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
        images: savedImages,
        category
      }
    })

    return NextResponse.json({
      success: true,
      message: '중고 상품이 성공적으로 등록되었습니다.',
      product: result
    });

  } catch (error) {

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product' 
      },
      { status: 500 }
    )
  }
}

// GET: 중고 상품 목록 조회 (PostgreSQL 사용)
export async function GET(request: NextRequest) {
  try {
    // PostgreSQL에서 상품 데이터 조회
    const productsResult = await query(`
      SELECT 
        p.id, p.name, p.slug, p.description, p.price, p.original_price, p.condition,
        p.category_id, p.stock, p.rating, p.review_count, p.featured, p.new, 
        p.status, p.discount_rate, p.created_at, p.updated_at, p.deleted_at,
        p.usage_period, p.purchase_date, p.detailed_description,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);

    const products = productsResult.rows;

    // 각 상품의 이미지 가져오기
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      const imagesResult = await query(
        `SELECT product_id, url, webp_url, file_name, image_type, order_index
         FROM product_images 
         WHERE product_id = ANY($1) 
         ORDER BY order_index ASC`,
        [productIds]
      );

      // 이미지를 상품에 매핑
      const imagesMap = new Map();
      imagesResult.rows.forEach(img => {
        if (!imagesMap.has(img.product_id)) {
          imagesMap.set(img.product_id, []);
        }
        imagesMap.get(img.product_id).push({
          id: `${img.product_id}_${img.order_index}`,
          url: img.url,
          webpUrl: img.webp_url,
          fileName: img.file_name,
          type: img.image_type,
          order: img.order_index
        });
      });

      // 상품에 이미지와 카테고리 정보 추가
      products.forEach(product => {
        product.images = imagesMap.get(product.id) || [];
        
        // 카테고리 정보 설정
        if (product.category_id && product.category_name) {
          product.category = {
            id: product.category_id,
            name: product.category_name,
            slug: product.category_slug
          };
        } else {
          product.category = null;
        }
        
        // 불필요한 필드 제거
        delete product.category_id;
        delete product.category_name;
        delete product.category_slug;

        // 타입 변환
        product.rating = parseFloat(product.rating) || 0;
        product.review_count = parseInt(product.review_count) || 0;
        product.price = product.price.toString();
        product.original_price = product.original_price ? product.original_price.toString() : null;
        
        // 시간 포맷
        product.createdAt = product.created_at;
        product.updatedAt = product.updated_at;
        delete product.created_at;
        delete product.updated_at;
        delete product.deleted_at;

        // 상태와 할인율 재계산
        product.status = getProductStatus(product.stock, product.status);
        if (product.original_price && product.price) {
          product.discountRate = calculateDiscountRate(product.original_price, product.price);
        } else {
          product.discountRate = product.discount_rate || 0;
        }
        delete product.discount_rate;
      });
    }

    return NextResponse.json({
      success: true,
      products,
      total: products.length,
      message: '중고 상품 목록을 성공적으로 불러왔습니다.'
    });

  } catch (error) {

    return NextResponse.json(
      { 
        success: false, 
        error: '중고 상품 목록을 불러오는데 실패했습니다.',
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// PUT: 중고 상품 정보 수정 (PostgreSQL 사용)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      name, 
      description, 
      price, 
      originalPrice, 
      condition, 
      category_id, 
      stock, 
      featured, 
      isNew
    } = body

    if (!id) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 업데이트 쿼리 구성
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex}`);
      updateValues.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      updateValues.push(description);
      paramIndex++;
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex}`);
      updateValues.push(parseFloat(price));
      paramIndex++;
    }
    if (originalPrice !== undefined) {
      updateFields.push(`original_price = $${paramIndex}`);
      updateValues.push(parseFloat(originalPrice));
      paramIndex++;
    }
    if (condition) {
      updateFields.push(`condition = $${paramIndex}`);
      updateValues.push(condition);
      paramIndex++;
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex}`);
      updateValues.push(category_id);
      paramIndex++;
    }
    if (stock !== undefined) {
      updateFields.push(`stock = $${paramIndex}`);
      updateValues.push(parseInt(stock.toString()));
      paramIndex++;
      
      updateFields.push(`status = $${paramIndex}`);
      updateValues.push(getProductStatus(parseInt(stock.toString())));
      paramIndex++;
    }
    if (featured !== undefined) {
      updateFields.push(`featured = $${paramIndex}`);
      updateValues.push(featured);
      paramIndex++;
    }
    if (isNew !== undefined) {
      updateFields.push(`new = $${paramIndex}`);
      updateValues.push(isNew);
      paramIndex++;
    }

    // 할인율 재계산
    if (price !== undefined || originalPrice !== undefined) {
      const currentPrice = price ? parseFloat(price.toString()) : null;
      const currentOriginalPrice = originalPrice ? parseFloat(originalPrice.toString()) : null;
      
      if (currentPrice && currentOriginalPrice) {
        const discountRate = calculateDiscountRate(currentOriginalPrice.toString(), currentPrice.toString());
        updateFields.push(`discount_rate = $${paramIndex}`);
        updateValues.push(discountRate);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '업데이트할 필드가 없습니다.' },
        { status: 400 }
      )
    }

    // 업데이트 시간 추가
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;

    // 상품 ID 추가
    updateValues.push(id);

    const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedProduct = result.rows[0];

    return NextResponse.json({
      success: true,
      message: '중고 상품 정보가 성공적으로 수정되었습니다.',
      product: updatedProduct
    });

  } catch (error) {

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '상품 수정에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}

// DELETE: 중고 상품 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 소프트 삭제 (deleted_at 필드 업데이트)
    const result = await query(
      'UPDATE products SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [new Date(), id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '중고 상품이 성공적으로 삭제되었습니다.',
      productId: id
    });

  } catch (error) {

    return NextResponse.json(
      { 
        success: false,
        error: '상품 삭제에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}