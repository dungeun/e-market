/**
 * 상품 서비스
 * 상품 관련 비즈니스 로직 처리
 */

import { prisma } from '@/lib/db';
import { ProductWithImage, ProductImage } from '@/types/database';

export interface ProductFilter {
  filter?: 'all' | 'featured' | 'new' | 'sale' | 'best';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface Product extends ProductWithImage {
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

class ProductService {
  /**
   * 공개 상품 목록 조회
   */
  async getPublicProducts(filter: ProductFilter = {}, limit: number = 10): Promise<{
    success: boolean;
    products: Product[];
    total: number;
    message?: string;
  }> {
    try {
      // WHERE 조건 구성
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // 필터 적용
      if (filter.filter && filter.filter !== 'all') {
        switch (filter.filter) {
          case 'featured':
            conditions.push('p.status = \'ACTIVE\'');
            break;
          case 'new':
            conditions.push('p."publishedAt" > NOW() - INTERVAL \'7 days\'');
            break;
          case 'sale':
            conditions.push('p."compareAt" IS NOT NULL AND p."compareAt" > p.price');
            break;
          case 'best':
            // 베스트는 주문 수량이 많은 상품으로 간주
            conditions.push('p.status = \'ACTIVE\'');
            break;
        }
      }

      // 카테고리 필터
      if (filter.category) {
        conditions.push(`p."categoryId" = $${paramIndex++}`);
        params.push(filter.category);
      }

      // 가격 필터
      if (filter.minPrice !== undefined) {
        conditions.push(`price >= $${paramIndex++}`);
        params.push(filter.minPrice);
      }
      if (filter.maxPrice !== undefined) {
        conditions.push(`price <= $${paramIndex++}`);
        params.push(filter.maxPrice);
      }

      // 검색
      if (filter.search) {
        conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        params.push(`%${filter.search}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 상품 조회 (Prisma 스키마에 맞게 수정)
      const products = await prisma.$queryRaw<Product[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          COALESCE(pi.images, '[]'::json) as images,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT json_agg(
            json_build_object(
              'id', id,
              'url', url,
              'position', position
            ) ORDER BY position, id
          ) as images
          FROM "ProductImage"
          WHERE "productId" = p.id
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        ${whereClause}
        ORDER BY 
          CASE WHEN p.status = 'ACTIVE' THEN 1 ELSE 0 END DESC,
          p."createdAt" DESC
        LIMIT $${paramIndex}
      `, ...params, limit);

      // 전체 개수 조회
      const countResult = await prisma.$queryRaw<Array<{ count: string }>>(`
        SELECT COUNT(*) as count
        FROM "Product" p
        ${whereClause}
      `, ...params);

      const total = parseInt(countResult[0].count, 10);

      return {
        success: true,
        products,
        total,
      };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return {
        success: false,
        products: [],
        total: 0,
        message: 'Failed to load products',
      };
    }
  }

  /**
   * 상품 상세 조회
   */
  async getProductDetail(id: string): Promise<Product | null> {
    try {
      const products = await prisma.$queryRaw<Product[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          COALESCE(pi.images, '[]'::json) as images,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT json_agg(
            json_build_object(
              'id', id,
              'url', url,
              'position', position
            ) ORDER BY position, id
          ) as images
          FROM "ProductImage"
          WHERE "productId" = p.id
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        WHERE p.id = $1 AND p.status = 'ACTIVE'
      `, id);

      return products[0] || null;
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      return null;
    }
  }

  /**
   * 베스트셀러 상품 조회
   */
  async getBestSellers(limit: number = 10): Promise<ProductWithImage[]> {
    try {
      const products = await prisma.$queryRaw<ProductWithImage[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(pi.url, '/placeholder-product.jpg') as image_url,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT url 
          FROM "ProductImage" 
          WHERE "productId" = p.id AND position = 0
          LIMIT 1
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        WHERE p.stock > 0 AND p.status = 'ACTIVE'
        ORDER BY COALESCE(r.avg_rating, 0) DESC NULLS LAST
        LIMIT $1
      `, limit);

      return products;
    } catch (error) {
      console.error('Failed to fetch best sellers:', error);
      return [];
    }
  }

  /**
   * 신상품 조회
   */
  async getNewArrivals(limit: number = 10): Promise<ProductWithImage[]> {
    try {
      const products = await prisma.$queryRaw<ProductWithImage[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(pi.url, '/placeholder-product.jpg') as image_url,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT url 
          FROM "ProductImage" 
          WHERE "productId" = p.id AND position = 0
          LIMIT 1
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        WHERE p."publishedAt" > NOW() - INTERVAL '7 days' AND p.stock > 0 AND p.status = 'ACTIVE'
        ORDER BY p."createdAt" DESC
        LIMIT $1
      `, limit);

      return products;
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
      return [];
    }
  }

  /**
   * 추천 상품 조회
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductWithImage[]> {
    try {
      const products = await prisma.$queryRaw<ProductWithImage[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(pi.url, '/placeholder-product.jpg') as image_url,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT url 
          FROM "ProductImage" 
          WHERE "productId" = p.id AND position = 0
          LIMIT 1
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        WHERE p.status = 'ACTIVE' AND p.stock > 0
        ORDER BY p."createdAt" DESC
        LIMIT $1
      `, limit);

      return products;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }

  /**
   * 카테고리별 상품 조회
   */
  async getProductsByCategory(categoryId: string, limit: number = 10): Promise<ProductWithImage[]> {
    try {
      const products = await prisma.$queryRaw<ProductWithImage[]>(`
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(pi.url, '/placeholder-product.jpg') as image_url,
          COALESCE(r.avg_rating, 0) as rating,
          COALESCE(r.review_count, 0) as review_count
        FROM "Product" p
        LEFT JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN LATERAL (
          SELECT url 
          FROM "ProductImage" 
          WHERE "productId" = p.id AND position = 0
          LIMIT 1
        ) pi ON true
        LEFT JOIN LATERAL (
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM "Review"
          WHERE "productId" = p.id
        ) r ON true
        WHERE p."categoryId" = $1 AND p.stock > 0 AND p.status = 'ACTIVE'
        ORDER BY p.status DESC, p."createdAt" DESC
        LIMIT $2
      `, categoryId, limit);

      return products;
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return [];
    }
  }
}

export const productService = new ProductService();