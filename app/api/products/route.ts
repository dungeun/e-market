import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

// 상품 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'latest';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');

    // WHERE 조건 구성
    const whereConditions = ['p.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`p.category_id = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`p.price >= $${paramIndex}`);
      queryParams.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`p.price <= $${paramIndex}`);
      queryParams.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (condition) {
      whereConditions.push(`p.condition = $${paramIndex}`);
      queryParams.push(condition);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // ORDER BY 구성
    let orderBy = 'p.created_at DESC';
    switch (sortBy) {
      case 'price-low':
        orderBy = 'p.price ASC';
        break;
      case 'price-high':
        orderBy = 'p.price DESC';
        break;
      case 'latest':
      default:
        orderBy = 'p.created_at DESC';
        break;
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // 상품 목록 조회
    const productsQuery = `
      SELECT 
        p.id, p.name, p.slug, p.description,
        p.price::numeric as price,
        p.original_price::numeric as original_price,
        p.condition,
        p.seller_location as location,
        p.featured as is_featured,
        p.status,
        p.rating::numeric as rating,
        p.review_count,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        c.slug as category_slug,
        pi.url as image_url,
        pi.file_name as image_alt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND (
        pi.id = (
          SELECT id FROM product_images 
          WHERE product_id = p.id 
          ORDER BY order_index ASC, created_at ASC 
          LIMIT 1
        )
      )
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const result = await query(productsQuery, queryParams);

    // 응답 데이터 변환
    const products = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.description ? row.description.substring(0, 150) + '...' : '',
      price: parseFloat(row.price || 0),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      image: row.image_url || '/api/placeholder/300/300',
      imageAlt: row.image_alt || row.name,
      rating: parseFloat(row.rating || '0'),
      reviewCount: parseInt(row.review_count || '0'),
      category: row.category_name || '기타',
      categorySlug: row.category_slug || 'other',
      isFeatured: row.is_featured || false,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // 중고 상품 특화 필드들
      condition: row.condition || 'GOOD',
      brand: '브랜드미정', // 기본값
      location: row.location || '위치미정',
      isLiked: false
    }));

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      products,
      pagination,
      filters: {
        category,
        search,
        sortBy,
        minPrice,
        maxPrice,
        condition
      }
    });

  } catch (err) {
    console.error('Failed to fetch products:', err);
    
    // 데이터베이스 연결 실패 시 fallback 데이터
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'iPhone 14 Pro 128GB (A급)',
        slug: 'iphone-14-pro-128gb-grade-a',
        description: '상태 양호한 iPhone 14 Pro입니다. 액정 파손 없고 배터리 효율 95% 이상',
        shortDescription: '상태 양호한 iPhone 14 Pro, 배터리 95%+',
        price: 950000,
        originalPrice: 1200000,
        image: '/api/placeholder/300/300',
        imageAlt: 'iPhone 14 Pro',
        rating: 4.8,
        reviewCount: 24,
        category: '전자제품',
        categorySlug: 'electronics',
        condition: 'A',
        brand: 'Apple',
        location: '서울 강남구',
        isLiked: false,
        isFeatured: true,
        status: 'PUBLISHED',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'prod-2',
        name: '삼성 갤럭시 S24 Ultra (새제품)',
        slug: 'samsung-galaxy-s24-ultra-new',
        description: '미개봉 새제품 갤럭시 S24 Ultra입니다. 정품 보증서 포함',
        shortDescription: '미개봉 새제품 갤럭시 S24 Ultra',
        price: 1100000,
        originalPrice: 1400000,
        image: '/api/placeholder/300/300',
        imageAlt: 'Samsung Galaxy S24 Ultra',
        rating: 4.9,
        reviewCount: 18,
        category: '전자제품',
        categorySlug: 'electronics',
        condition: 'S',
        brand: 'Samsung',
        location: '서울 송파구',
        isLiked: false,
        isFeatured: true,
        status: 'PUBLISHED',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      }
    ];

    return NextResponse.json({
      products: mockProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: mockProducts.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      },
      filters: {},
      fallback: true,
      message: 'Database connection failed, using fallback data'
    });
  }
}

// 상품 생성 API
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 트랜잭션을 사용하여 상품 생성
    const result = await transaction(async (client: any) => {
      // 고유 ID 생성
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const slug = data.slug || data.name.toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      // 상품 생성 (기존 테이블 구조에 맞춤)
      const productResult = await client.query(`
        INSERT INTO products (
          id, name, slug, description, price, original_price, 
          condition, category_id, stock, featured, status,
          seller_location, negotiable, direct_trade, delivery_available,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          NOW(), NOW()
        ) RETURNING *
      `, [
        productId,
        data.name,
        slug,
        data.description || null,
        data.price || 0,
        data.originalPrice || null,
        data.condition || 'GOOD',
        data.categoryId || null,
        data.stock || 1,
        data.featured || false,
        data.status || '판매중',
        data.location || null,
        data.negotiable || false,
        data.directTrade !== false,
        data.deliveryAvailable || false
      ]);

      const product = productResult.rows[0];

      // 이미지 생성 (있는 경우)
      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await client.query(`
            INSERT INTO product_images (
              id, product_id, url, alt_text, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
          `, [
            imageId,
            product.id,
            img.url,
            img.alt || data.name
          ]);
        }
      }

      return product;
    });

    return NextResponse.json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      product: result
    }, { status: 201 });
    
  } catch (error) {
    console.error('Product creation failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '상품 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}