-- 중고 상품 커머스 데이터베이스 스키마
-- PostgreSQL용 테이블 생성

-- 카테고리 테이블
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id VARCHAR(50),
  level INTEGER DEFAULT 1,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  menu_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- 상품 테이블
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  category_id VARCHAR(50),
  quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  track_quantity BOOLEAN DEFAULT true,
  weight DECIMAL(8,2),
  length DECIMAL(8,2),
  width DECIMAL(8,2),
  height DECIMAL(8,2),
  meta_title VARCHAR(200),
  meta_description TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 상품 속성 테이블 (중고 상품 특화)
CREATE TABLE product_attributes (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 상품 이미지 테이블
CREATE TABLE product_images (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  alt_text VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 리뷰 테이블
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  user_name VARCHAR(100),
  user_email VARCHAR(150),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status, is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created ON products(created_at);
CREATE INDEX idx_product_attributes_product ON product_attributes(product_id, name);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
