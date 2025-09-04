/**
 * JSON 캐시 서비스 - 스마트 프리페칭 및 관리
 */

import fs from 'fs/promises';
import path from 'path';
// import { prisma } from '@/lib/db';
import { query } from '@/lib/db';

interface CacheConfig {
  pageSize: number;
  languages: string[];
  maxPages: number;
  ttl: number; // Time To Live in seconds
  prefetchNext: boolean;
}

export class JsonCacheService {
  private config: CacheConfig = {
    pageSize: 30,
    languages: ['ko', 'en', 'jp'],
    maxPages: 10, // 최대 10페이지까지 캐싱
    ttl: 3600, // 1시간
    prefetchNext: true
  };

  /**
   * 상품 JSON 캐시 생성 (언어별, 페이지별)
   */
  async generateProductCache(): Promise<void> {

    for (const lang of this.config.languages) {
      // 전체 상품 수 조회
      const totalCount = await query({
        where: { status: 'ACTIVE' }
      });

      const totalPages = Math.ceil(totalCount / this.config.pageSize);
      const pagesToCache = Math.min(totalPages, this.config.maxPages);

      // 각 페이지별로 JSON 생성
      for (let page = 1; page <= pagesToCache; page++) {
        await this.generateProductPage(lang, page, totalPages, totalCount);
      }
    }

    // 인덱스 파일 생성
    await this.generateCacheIndex();

  }

  /**
   * 단일 페이지 JSON 생성
   */
  private async generateProductPage(
    lang: string,
    page: number,
    totalPages: number,
    totalCount: number
  ): Promise<void> {
    const offset = (page - 1) * this.config.pageSize;
    const langField = lang === 'jp' ? 'ja' : lang;

    // Prisma를 사용한 안전한 쿼리 (snake_case 필드 사용)
    const products = await query({
      where: { status: 'ACTIVE' },
      include: {
        translations: true,
        images: {
          orderBy: { position: 'asc' }
        },
        category: {
          include: {
            translations: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { created_at: 'desc' }  // snake_case로 변경
      ],
      skip: offset,
      take: this.config.pageSize
    });

    // 데이터 포맷팅
    const formattedProducts = products.map((p: unknown) => {
      // 번역 찾기
      const translation = p.translations?.[0];
      const categoryTranslation = p.category?.translations?.[0];
      
      // name과 description 필드 결정
      let name = p.name;
      let description = p.description;
      let categoryName = p.category?.name || '';
      
      if (translation) {
        const nameField = `name_${langField}`;
        const descField = `description_${langField}`;
        name = translation[nameField] || p.name;
        description = translation[descField] || p.description;
      }
      
      if (categoryTranslation) {
        const catNameField = `name_${langField}`;
        categoryName = categoryTranslation[catNameField] || p.category?.name || '';
      }

      // 7일 이내 신제품 여부
      const isNew = p.created_at && (Date.now() - new Date(p.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

      return {
        id: p.id,
        slug: p.slug,
        name,
        description,
        price: p.price,
        discountPrice: p.discountPrice,
        images: p.images?.map((img: unknown) => img.url) || [],
        category: p.category ? {
          id: p.category.id,
          name: categoryName,
          slug: p.category.slug
        } : null,
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        stock: p.stock || 0,
        featured: p.featured || false,
        new: isNew
      };
    });

    // 필터 데이터 생성 (첫 페이지만)
    let filters = null;
    if (page === 1) {
      filters = await this.generateFilters(lang);
    }

    // JSON 데이터 구성
    const jsonData = {
      metadata: {
        language: lang,
        page,
        pageSize: this.config.pageSize,
        totalPages,
        totalItems: totalCount,
        generated: new Date().toISOString(),
        cacheVersion: 'v1.0.0',
        ttl: this.config.ttl,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      },
      products: formattedProducts,
      ...(filters && { filters })
    };

    // 파일로 저장
    const filePath = path.join(
      process.cwd(),
      'public/cache/products',
      `products-${lang}-page-${page}.json`
    );

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

  }

  /**
   * 필터 데이터 생성
   */
  private async generateFilters(lang: string): Promise<unknown> {
    const langField = lang === 'jp' ? 'ja' : lang;
    
    // 카테고리 데이터 가져오기
    const categoriesData = await query({
      where: { is_active: true },  // snake_case로 변경
      include: {
        translations: true
      }
    });

    // 각 카테고리별 상품 수 계산
    const categoriesWithCount = [];
    for (const category of categoriesData) {
      const productCount = await query({
        where: { 
          category_id: category.id,
          status: 'ACTIVE'
        }
      });
      
      if (productCount > 0) {
        const translation = category.translations?.[0];
        const nameField = `name_${langField}`;
        const name = translation?.[nameField] || category.name;
        
        categoriesWithCount.push({
          id: category.id,
          slug: category.slug,
          name,
          count: productCount
        });
      }
    }
    
    const categories = categoriesWithCount.sort((a, b) => b.count - a.count);

    // 가격 범위 (direct query 사용)
    const priceRangeResult = await query(
      'SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE status = $1',
      ['ACTIVE']
    );
    const priceRange = priceRangeResult.rows?.[0] || { min_price: 0, max_price: 1000000 };

    // 브랜드별 상품 수 (그룹화)
    const productsWithBrands = await query({
      where: { 
        status: 'ACTIVE',
        brand: { not: null }
      },
      select: { brand: true }
    });

    const brandCounts: Record<string, number> = {};
    productsWithBrands.forEach(p => {
      if (p.brand) {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      }
    });

    const brands = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      categories,
      priceRange: {
        min: priceRange.min_price || 0,
        max: priceRange.max_price || 1000000
      },
      brands
    };
  }

  /**
   * 캐시 인덱스 파일 생성 (메타데이터)
   */
  private async generateCacheIndex(): Promise<void> {
    const index = {
      generated: new Date().toISOString(),
      version: 'v1.0.0',
      languages: this.config.languages,
      pageSize: this.config.pageSize,
      ttl: this.config.ttl,
      files: [] as string[]
    };

    // 생성된 파일 목록
    const cacheDir = path.join(process.cwd(), 'public/cache/products');
    const files = await fs.readdir(cacheDir);
    index.files = files.filter(f => f.endsWith('.json') && f !== 'index.json');

    // 인덱스 저장
    await fs.writeFile(
      path.join(cacheDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
  }

  /**
   * 캐시 무효화 및 재생성
   */
  async invalidateAndRegenerate(): Promise<void> {
    const cacheDir = path.join(process.cwd(), 'public/cache/products');
    
    // 기존 캐시 삭제
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
    } catch (error) {

    }

    // 캐시 재생성
    await this.generateProductCache();
  }

  /**
   * 스마트 프리페칭 - 다음 페이지 미리 생성
   */
  async prefetchNextPage(currentLang: string, currentPage: number): Promise<void> {
    if (!this.config.prefetchNext) return;

    const nextPage = currentPage + 1;
    const cacheFile = path.join(
      process.cwd(),
      'public/cache/products',
      `products-${currentLang}-page-${nextPage}.json`
    );

    // 이미 캐시가 있는지 확인
    try {
      await fs.access(cacheFile);
      // 캐시가 있으면 TTL 확인
      const stats = await fs.stat(cacheFile);
      const age = Date.now() - stats.mtimeMs;
      
      if (age < this.config.ttl * 1000) {
        return; // 캐시가 아직 유효함
      }
    } catch {
      // 캐시가 없음
    }

    // 백그라운드에서 다음 페이지 생성
    const totalCount = await query({
      where: { status: 'ACTIVE' }
    });
    const totalPages = Math.ceil(totalCount / this.config.pageSize);

    if (nextPage <= totalPages) {
      setImmediate(() => {
        this.generateProductPage(currentLang, nextPage, totalPages, totalCount)
          .catch(err => logger.error(`Failed to generate page ${nextPage}:`, err));
      });
    }
  }
}

// 싱글톤 인스턴스
export const jsonCacheService = new JsonCacheService();