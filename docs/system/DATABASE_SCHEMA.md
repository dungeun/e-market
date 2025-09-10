# 🗄️ 데이터베이스 스키마 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 스키마 개요
```yaml
데이터베이스: PostgreSQL
프로젝트: commerce-nextjs
용도: 중고 상품 거래 플랫폼
특화: 해외 노동자 대상 중고 거래
다국어: 한국어, 영어 지원
```

## 📋 테이블 구조

### 🏷️ 1. categories (카테고리)
```sql
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
```

**특징**:
- 계층형 구조 지원 (parent_id, level)
- 메뉴 순서 관리 (menu_order)
- 아이콘과 색상 지원
- 활성화 상태 관리

**인덱스**:
- `idx_categories_parent` - parent_id
- `idx_categories_slug` - slug

---

### 📦 2. products (상품)
```sql
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
```

**중고 상품 특화 필드** (add_used_goods_fields.sql):
```sql
ALTER TABLE products 
ADD COLUMN condition VARCHAR(1) CHECK (condition IN ('S', 'A', 'B', 'C')),
ADD COLUMN usage_period VARCHAR(255),
ADD COLUMN purchase_date VARCHAR(255),
ADD COLUMN defects TEXT,
ADD COLUMN seller_name VARCHAR(255),
ADD COLUMN seller_phone VARCHAR(20),
ADD COLUMN seller_location VARCHAR(255),
ADD COLUMN verified_seller BOOLEAN DEFAULT false,
ADD COLUMN negotiable BOOLEAN DEFAULT false,
ADD COLUMN direct_trade BOOLEAN DEFAULT true,
ADD COLUMN delivery_available BOOLEAN DEFAULT false,
ADD COLUMN warranty_info TEXT;
```

**상태 등급**:
- `S` - 미사용 신품급
- `A` - 사용감 거의 없음
- `B` - 일반 사용감
- `C` - 사용감 많음

**인덱스**:
- `idx_products_category` - category_id
- `idx_products_status` - status, is_active
- `idx_products_featured` - is_featured
- `idx_products_created` - created_at
- `idx_products_condition` - condition
- `idx_products_verified_seller` - verified_seller
- `idx_products_seller_location` - seller_location

---

### 🏷️ 3. product_attributes (상품 속성)
```sql
CREATE TABLE product_attributes (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

**인덱스**:
- `idx_product_attributes_product` - product_id, name

---

### 🖼️ 4. product_images (상품 이미지)
```sql
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
```

**특징**:
- 정렬 순서 지원 (sort_order)
- 메인 이미지 지정 (is_main)
- 자동 삭제 (ON DELETE CASCADE)

**인덱스**:
- `idx_product_images_product` - product_id

---

### ⭐ 5. reviews (리뷰)
```sql
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
```

**특징**:
- 1-5점 평점 시스템
- 승인 시스템 (is_approved)
- 제목과 본문 구분

**인덱스**:
- `idx_reviews_product` - product_id

---

### ⚙️ 6. site_config (사이트 설정)
```sql
CREATE TABLE site_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**기본 설정**:
```sql
INSERT INTO site_config (key, value, description, category, is_public) VALUES 
    ('site_name', 'E-Market Korea', '사이트 이름', 'general', true),
    ('site_description', '해외 노동자를 위한 중고 거래 플랫폼', '사이트 설명', 'general', true),
    ('default_language', 'ko', '기본 언어', 'language', true),
    ('enabled_languages', 'ko,en', '활성화된 언어 목록', 'language', true);
```

**인덱스**:
- `idx_site_config_key` - key

---

### 🌐 7. language_settings (언어 설정)
```sql
CREATE TABLE language_settings (
    id SERIAL PRIMARY KEY,
    selected_languages TEXT[] DEFAULT '{"ko"}',
    default_language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**기본값**:
```sql
INSERT INTO language_settings (selected_languages, default_language) VALUES 
    ('{"ko","en"}', 'ko');
```

---

### 🔑 8. language_pack_keys (언어팩 키)
```sql
CREATE TABLE language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_id VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**컴포넌트 타입**:
- `menu` - 네비게이션 메뉴
- `page` - 페이지 컨텐츠
- `form` - 폼 라벨/메시지
- `error` - 에러 메시지
- `common` - 공통 텍스트

**인덱스**:
- `idx_language_pack_keys_active` - is_active

---

### 💬 9. language_pack_translations (언어팩 번역)
```sql
CREATE TABLE language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);
```

**언어 코드**:
- `ko` - 한국어
- `en` - 영어
- 추후 확장 가능

**인덱스**:
- `idx_language_pack_translations_lookup` - key_id, language_code

---

### 📋 10. ui_menus (UI 메뉴)
```sql
CREATE TABLE ui_menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    url VARCHAR(255),
    parent_id INTEGER,
    menu_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    target_blank BOOLEAN DEFAULT false,
    icon VARCHAR(50),
    css_class VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES ui_menus(id) ON DELETE CASCADE
);
```

**기본 메뉴**:
```sql
INSERT INTO ui_menus (name, slug, url, menu_order, is_active) VALUES 
    ('홈', 'home', '/', 1, true),
    ('상품', 'products', '/products', 2, true),
    ('카테고리', 'categories', '/categories', 3, true),
    ('로그인', 'login', '/auth/login', 4, true),
    ('회원가입', 'register', '/auth/register', 5, true);
```

**인덱스**:
- `idx_ui_menus_active` - is_active
- `idx_ui_menus_order` - menu_order

---

## 🔧 트리거 및 함수

### update_updated_at_column() 함수
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 업데이트 타임스탬프 트리거
모든 테이블에 `updated_at` 자동 업데이트 트리거 적용:
- site_config
- language_settings
- language_pack_keys
- language_pack_translations
- ui_menus

## 📊 관계도

```
categories
├── products (category_id)
    ├── product_attributes (product_id)
    ├── product_images (product_id)
    └── reviews (product_id)

language_pack_keys
└── language_pack_translations (key_id)

ui_menus (계층형)
├── ui_menus (parent_id)
```

## 🔍 인덱스 전략

### 주요 검색 패턴
1. **상품 검색**: category_id, status, is_active
2. **언어팩 조회**: key_id + language_code
3. **메뉴 구성**: menu_order, is_active
4. **중고 상품**: condition, verified_seller, seller_location

### 성능 최적화
- 복합 인덱스 활용
- 자주 조회되는 컬럼 우선 인덱싱
- CASCADE 삭제로 데이터 무결성 보장

## 🚀 마이그레이션 순서

1. **schema.sql** - 기본 테이블 생성
2. **add_used_goods_fields.sql** - 중고 상품 필드 추가
3. **create_missing_tables.sql** - 언어팩 및 UI 테이블
4. **create_language_metadata.sql** - 언어 메타데이터

## 🎯 특이사항

1. **중고 상품 특화**: condition, seller_info, verification 시스템
2. **다국어 지원**: 완전한 언어팩 시스템
3. **계층형 구조**: categories, ui_menus
4. **소프트 삭제**: products.deleted_at
5. **SEO 최적화**: slug, meta fields
6. **재고 관리**: quantity, low_stock_threshold
7. **승인 시스템**: reviews.is_approved

---

*이 문서는 commerce-nextjs 프로젝트의 완전한 데이터베이스 스키마 매뉴얼입니다.*