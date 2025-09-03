/**
 * 데이터베이스 테이블 타입 정의
 */

// Product 관련 타입
export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | null;
  description: string;
  category_id?: string | null;
  featured: boolean;
  new: boolean;
  sale: boolean;
  best: boolean;
  stock_quantity: number;
  rating?: number | null;
  position?: number | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithImage extends ProductRow {
  image_url?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  images?: ProductImage[] | null;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  position: number;
}

// Category 관련 타입
export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  position: number;
  is_active: boolean;
}

// Language Pack 관련 타입
export interface LanguagePackRow {
  key: string;
  ko: string;
  en: string;
  ja: string;
}

// UI Section 관련 타입
export interface UISectionConfig {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  order: number;
  config: {
    title?: {
      ko: string;
      en: string;
      jp: string;
    };
    subtitle?: {
      ko: string;
      en: string;
      jp: string;
    };
    viewMore?: {
      ko: string;
      en: string;
      jp: string;
    };
    filter?: string;
    limit?: number;
    slides?: Array<{
      id: string;
      title: string;
      subtitle: string;
      image: string;
      link: string;
    }>;
  };
}

// Site Config 관련 타입
export interface SiteConfigRow {
  key: string;
  value: string;
}

export interface SiteConfigSections {
  sections: UISectionConfig[];
}

// Review 관련 타입
export interface ReviewAggregation {
  avg_rating: number;
  review_count: number;
}

// Order 관련 타입
export interface OrderItemGroup {
  productId: string;
  _sum: {
    quantity: number | null;
    price: number | null;
  };
}