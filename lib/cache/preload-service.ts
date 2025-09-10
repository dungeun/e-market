/**
 * 커머스 홈페이지 프리로딩 서비스
 * 첫 페이지 접속 시 필요한 모든 상품/카테고리 데이터를 미리 로드
 */

import { query } from "@/lib/db";
import { logger } from "@/lib/logger";
import fs from "fs/promises";
import path from "path";
import { LanguageCode } from "@/types/global";
import { getCachedLanguagePacks } from '@/lib/cache/language-packs';
import { 
  ProductWithImage, 
  CategoryRow, 
  LanguagePackRow, 
  UISectionConfig,
  SiteConfigRow,
  SiteConfigSections
} from "@/types/database";

export interface PreloadedData {
  products: ProductWithImage[];
  categories: CategoryRow[];
  sections: UISectionConfig[];
  languagePacks: Record<string, Record<string, string>>;
  staticUITexts: Record<string, Record<string, string>>;
  metadata: {
    totalProducts: number;
    loadTime: number;
    cached: boolean;
    source?: string;
  };
}

// 메모리 캐시
let preloadedCache: PreloadedData | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

/**
 * 홈페이지 데이터를 프리로드
 */
export async function preloadHomePageData(): Promise<unknown> {
  const startTime = Date.now();

  // 캐시 확인
  if (preloadedCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    logger.info("Returning cached preloaded data");
    return {
      ...preloadedCache,
      metadata: {
        ...preloadedCache.metadata,
        cached: true,
        loadTime: Date.now() - startTime,
        source: "cache",
      },
    };
  }

  try {
    // 데이터베이스에서 섹션 데이터 로드
    const sections = await getSections();
    
    // 언어팩과 정적 UI 텍스트 로드
    const languagePacks = await getLanguagePacks();
    const staticUITexts = await getStaticUITexts();

    // 섹션 순서 추출
    const sectionOrder = sections.map(s => s.id);
    
    // 섹션 데이터를 객체 형태로 변환
    const sectionsData: unknown = {};
    for (const section of sections) {
      sectionsData[section.id] = section.config;
    }

    // 데이터 구조 - sections를 배열로도 포함
    const preloadedData = {
      sectionOrder,
      sections: sections, // 배열 형태의 섹션 데이터
      sectionsData, // 객체 형태의 섹션 데이터 (이전 호환성)
      products: await getProducts(),
      categories: await getCategories(),
      languagePacks,
      staticUITexts,
      metadata: {
        totalProducts: 0,
        loadTime: Date.now() - startTime,
        cached: false,
        source: "database",
      },
    };

    // 캐시 업데이트
    preloadedCache = preloadedData;
    cacheTimestamp = Date.now();

    logger.info(`Loaded homepage data from JSON in ${preloadedData.metadata.loadTime}ms`);
    return preloadedData;
  } catch (error) {
    logger.error("Failed to preload homepage data:", error);
    
    // 에러 시에도 언어팩 로드 시도
    const languagePacks = await getLanguagePacks();
    const staticUITexts = await getStaticUITexts();
    
    // 에러 시 기본 구조 반환
    return {
      sectionOrder: ["hero", "category", "quicklinks", "promo", "active-campaigns", "ranking"],
      sections: {},
      products: [],
      categories: [],
      languagePacks,
      staticUITexts,
      metadata: {
        totalProducts: 0,
        loadTime: Date.now() - startTime,
        cached: false,
        source: "error",
      },
    };
  }
}

/**
 * 상품 데이터 조회
 */
async function getProducts(): Promise<ProductWithImage[]> {
  try {
    // 베스트셀러 상품 조회 (실제 DB 스키마에 맞게 수정)
    const productsResult = await query(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.description,
        p.category_id,
        p.featured,
        p.new,
        p.rating,
        p.created_at,
        pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.status = 'ACTIVE'
      ORDER BY p.created_at DESC, p.name ASC
      LIMIT 20
    `);
    
    const products = productsResult.rows as ProductWithImage[];
    return products;
  } catch (error) {
    logger.error("Failed to fetch products:", error);
    return [];
  }
}

/**
 * 카테고리 데이터 조회
 */
async function getCategories(): Promise<CategoryRow[]> {
  try {
    const categoriesResult = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        icon as image_url,
        parent_id,
        level as position,
        CASE WHEN deleted_at IS NULL THEN true ELSE false END as is_active
      FROM categories
      WHERE deleted_at IS NULL
      ORDER BY level ASC, name ASC
    `);
    
    const categories = categoriesResult.rows as CategoryRow[];
    return categories;
  } catch (error) {
    logger.error("Failed to fetch categories:", error);
    return [];
  }
}

/**
 * UI 섹션 데이터 조회
 */
async function getSections(): Promise<UISectionConfig[]> {
  try {
    // UI 섹션 설정을 ui_sections 테이블에서 조회
    const sectionsResult = await query(`
      SELECT id, key, title, type, "order", "isActive", data
      FROM ui_sections
      WHERE "isActive" = true
      ORDER BY "order" ASC
    `);
    
    const sections = sectionsResult.rows;
    
    if (sections && sections.length > 0) {
      // UISection 데이터를 UISectionConfig 형식으로 변환
      return sections.map(section => ({
        id: section.key, // key를 id로 사용
        type: section.type,
        name: section.title,
        enabled: section.isActive,
        order: section.order,
        data: section.data || {}, // data 필드 사용
        config: section.data || {} // 이전 호환성 유지
      }));
    }
    
    // 기본 섹션 반환 - 상품 중심으로
    return [
      {
        id: 'hero',
        type: 'hero',
        name: '메인 배너',
        enabled: true,
        order: 1,
        config: {
          slides: [
            {
              id: 'slide-1',
              title: '새로운 컬렉션',
              subtitle: '최신 상품을 만나보세요',
              image: '/images/hero/slide1.jpg',
              link: '/products'
            }
          ]
        }
      },
      {
        id: 'featured-products',
        type: 'products',
        name: '추천 상품',
        enabled: true,
        order: 2,
        config: {
          title: {
            ko: '추천 상품',
            en: 'Featured Products',
            jp: 'おすすめ商品'
          },
          subtitle: {
            ko: '엄선된 상품을 만나보세요',
            en: 'Discover our curated selection',
            jp: '厳選された商品をご覧ください'
          },
          viewMore: {
            ko: '더보기',
            en: 'View More',
            jp: 'もっと見る'
          },
          filter: 'featured',
          limit: 8
        }
      },
      {
        id: 'new-arrivals',
        type: 'products',
        name: '신상품',
        enabled: true,
        order: 3,
        config: {
          title: {
            ko: '신상품',
            en: 'New Arrivals',
            jp: '新商品'
          },
          subtitle: {
            ko: '방금 도착한 신상품',
            en: 'Just arrived products',
            jp: '新着商品'
          },
          viewMore: {
            ko: '더보기',
            en: 'View More',
            jp: 'もっと見る'
          },
          filter: 'new',
          limit: 8
        }
      },
      {
        id: 'categories',
        type: 'categories',
        name: '카테고리',
        enabled: true,
        order: 4,
        config: {
          title: '카테고리별 쇼핑'
        }
      }
    ];
  } catch (error) {
    logger.error("Failed to fetch sections:", error);
    return [];
  }
}

/**
 * 언어팩 데이터 조회
 */
async function getLanguagePacks(): Promise<Record<string, Record<string, string>>> {
  try {
    // 캐시된 언어팩 가져오기
    const cachedPacks = await getCachedLanguagePacks();
    
    // 언어별로 그룹화
    const grouped: Record<string, Record<string, string>> = {
      ko: {},
      en: {},
      ja: {}
    };
    
    // 캐시된 언어팩을 언어별로 변환
    for (const [key, pack] of Object.entries(cachedPacks)) {
      grouped.ko[key] = pack.ko;
      grouped.en[key] = pack.en;
      grouped.ja[key] = pack.ja;
    }
    
    return grouped;
  } catch (error) {
    logger.error("Failed to fetch language packs:", error);
    // 오류 시 빈 객체 반환
    return {
      ko: {},
      en: {},
      ja: {}
    };
  }
}

/**
 * 정적 UI 텍스트 조회
 */
async function getStaticUITexts(): Promise<Record<string, Record<string, string>>> {
  try {
    // JSON 파일에서 정적 텍스트 로드
    const textsPath = path.join(process.cwd(), "public/cache/ui-texts.json");
    const content = await fs.readFile(textsPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // 파일이 없으면 기본값 반환
    return {
      ko: {
        "menu.home": "홈",
        "menu.products": "상품",
        "menu.categories": "카테고리",
        "menu.mypage": "마이페이지",
        "menu.cart": "장바구니",
        "menu.login": "로그인",
        "menu.signup": "회원가입",
        "menu.logout": "로그아웃"
      },
      en: {
        "menu.home": "Home",
        "menu.products": "Products",
        "menu.categories": "Categories",
        "menu.mypage": "My Page",
        "menu.cart": "Cart",
        "menu.login": "Login",
        "menu.signup": "Sign Up",
        "menu.logout": "Logout"
      },
      ja: {
        "menu.home": "ホーム",
        "menu.products": "商品",
        "menu.categories": "カテゴリー",
        "menu.mypage": "マイページ",
        "menu.cart": "カート",
        "menu.login": "ログイン",
        "menu.signup": "会員登録",
        "menu.logout": "ログアウト"
      }
    };
  }
}

/**
 * 캐시 무효화
 */
export function invalidateCache() {
  preloadedCache = null;
  cacheTimestamp = 0;
  logger.info("Preload cache invalidated");
}