import { NextRequest } from 'next/server';
import { createApiHandler, success, error, validators } from '@/lib/api/handler';
import { query } from '@/lib/db';

// 해외 노동자를 위한 필수 생활용품 카테고리 (3개 대분류)
const STATIC_CATEGORIES = [
  {
    id: 'CAT-001',
    name: '전자제품',
    slug: 'electronics',
    parent: null,
    parentId: null,
    level: 1,
    description: '스마트폰, 노트북, 태블릿, 이어폰, 충전기 등',
    productCount: 0,
    status: 'active',
    isActive: true,
    menuOrder: 1,
    icon: '📱',
    color: '#0ea5e9',
    children: [
      { id: 'CAT-001-1', name: '스마트폰', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-001-2', name: '노트북', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-001-3', name: '태블릿', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-001-4', name: '이어폰/헤드폰', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-001-5', name: '충전기/케이블', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-001-6', name: '스마트워치', level: 2, isActive: true, productCount: 0 }
    ],
    subcategories: [
      { id: 'CAT-001-1', name: '스마트폰', productCount: 0 },
      { id: 'CAT-001-2', name: '노트북', productCount: 0 },
      { id: 'CAT-001-3', name: '태블릿', productCount: 0 },
      { id: 'CAT-001-4', name: '이어폰/헤드폰', productCount: 0 },
      { id: 'CAT-001-5', name: '충전기/케이블', productCount: 0 },
      { id: 'CAT-001-6', name: '스마트워치', productCount: 0 }
    ]
  },
  {
    id: 'CAT-002',
    name: '전자기기',
    slug: 'appliances',
    parent: null,
    parentId: null,
    level: 1,
    description: 'TV, 냉장고, 세탁기, 에어컨, 전자레인지, 청소기 등',
    productCount: 0,
    status: 'active',
    isActive: true,
    menuOrder: 2,
    icon: '🏠',
    color: '#10b981',
    children: [
      { id: 'CAT-002-1', name: 'TV/모니터', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-2', name: '냉장고', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-3', name: '세탁기', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-4', name: '에어컨/히터', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-5', name: '전자레인지', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-6', name: '청소기', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-002-7', name: '밥솥/전기포트', level: 2, isActive: true, productCount: 0 }
    ],
    subcategories: [
      { id: 'CAT-002-1', name: 'TV/모니터', productCount: 0 },
      { id: 'CAT-002-2', name: '냉장고', productCount: 0 },
      { id: 'CAT-002-3', name: '세탁기', productCount: 0 },
      { id: 'CAT-002-4', name: '에어컨/히터', productCount: 0 },
      { id: 'CAT-002-5', name: '전자레인지', productCount: 0 },
      { id: 'CAT-002-6', name: '청소기', productCount: 0 },
      { id: 'CAT-002-7', name: '밥솥/전기포트', productCount: 0 }
    ]
  },
  {
    id: 'CAT-003',
    name: '가구',
    slug: 'furniture',
    parent: null,
    parentId: null,
    level: 1,
    description: '침대, 매트리스, 책상, 의자, 옷장, 이불, 생활용품 등',
    productCount: 0,
    status: 'active',
    isActive: true,
    menuOrder: 3,
    icon: '🪑',
    color: '#f59e0b',
    children: [
      { id: 'CAT-003-1', name: '침대/매트리스', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-003-2', name: '책상/의자', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-003-3', name: '옷장/수납장', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-003-4', name: '이불/베개', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-003-5', name: '자전거', level: 2, isActive: true, productCount: 0 },
      { id: 'CAT-003-6', name: '생활용품', level: 2, isActive: true, productCount: 0 }
    ],
    subcategories: [
      { id: 'CAT-003-1', name: '침대/매트리스', productCount: 0 },
      { id: 'CAT-003-2', name: '책상/의자', productCount: 0 },
      { id: 'CAT-003-3', name: '옷장/수납장', productCount: 0 },
      { id: 'CAT-003-4', name: '이불/베개', productCount: 0 },
      { id: 'CAT-003-5', name: '자전거', productCount: 0 },
      { id: 'CAT-003-6', name: '생활용품', productCount: 0 }
    ]
  }
];

const MAX_CATEGORY_DEPTH = 3;

// GET /api/admin/categories - 모든 카테고리 조회
export const GET = createApiHandler({
  adminOnly: true,
  cache: { enabled: true, ttl: 300 },
  handler: async () => {
    try {
      // 데이터베이스에서 카테고리 조회
      const categoriesResult = await query(`
        SELECT 
          c.*,
          COUNT(DISTINCT p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `);

      if (categoriesResult.rows.length > 0) {
        // 대분류와 중분류를 분리
        const parentCategories = categoriesResult.rows.filter(cat => cat.level === 1 || !cat.parent_id);
        const childCategories = categoriesResult.rows.filter(cat => cat.level === 2 || cat.parent_id);
        
        // 계층 구조로 카테고리 구성
        const categories = parentCategories.map(parent => {
          const children = childCategories
            .filter(child => child.parent_id === parent.id)
            .map(child => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
              description: child.description || '',
              level: child.level || 2,
              isActive: true,
              productCount: parseInt(child.product_count) || 0
            }));
          
          return {
            id: parent.id,
            name: parent.name,
            slug: parent.slug,
            description: parent.description || '',
            icon: parent.icon || '📦',
            level: parent.level || 1,
            productCount: parseInt(parent.product_count) || 0,
            status: 'active',
            isActive: true,
            parentId: parent.parent_id,
            children: children,
            subcategories: children
          };
        });

        return success({ categories });
      }

      // 데이터베이스에 카테고리가 없으면 정적 데이터 반환
      const categories = STATIC_CATEGORIES.map(cat => ({
        ...cat,
        campaignCount: 0
      }));
      
      return success({ categories });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // 에러 발생 시 정적 데이터 반환
      const categories = STATIC_CATEGORIES.map(cat => ({
        ...cat,
        campaignCount: 0
      }));
      
      return success({ categories });
    }
  }
});

// POST /api/admin/categories - 새 카테고리 생성
export const POST = createApiHandler({
  adminOnly: true,
  validate: validators.required(['name', 'slug']),
  handler: async (request: NextRequest) => {
    const data = await request.json();
    const { name, slug, parentId, description, icon, color, imageUrl } = data;

    // Check for duplicate slug
    const existingResult = await query(
      'SELECT id FROM categories WHERE slug = $1',
      [slug]
    );
    
    if (existingResult.rows.length > 0) {
      return error('Category slug already exists', 400);
    }

    // Calculate level based on parent category
    let level = 1;
    if (parentId) {
      const parentResult = await query(
        'SELECT level FROM categories WHERE id = $1',
        [parentId]
      );
      
      if (parentResult.rows.length > 0) {
        level = parentResult.rows[0].level + 1;
        if (level > MAX_CATEGORY_DEPTH) {
          return error(`Maximum category depth (${MAX_CATEGORY_DEPTH} levels) exceeded`, 400);
        }
      }
    }

    // Create new category
    const result = await query(`
      INSERT INTO categories (
        name, slug, parent_id, level, description, 
        icon, color, image_url, is_active, menu_order, 
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 99, NOW(), NOW())
      RETURNING *
    `, [name, slug, parentId, level, description, icon, color, imageUrl]);

    const category = result.rows[0];

    return success({
      category: {
        ...category,
        parentId: category.parent_id,
        isActive: category.is_active,
        menuOrder: category.menu_order,
        createdAt: category.created_at,
        updatedAt: category.updated_at
      }
    });
  }
});