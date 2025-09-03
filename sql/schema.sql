-- Korean Enterprise Commerce Platform
-- PostgreSQL Schema Definition
-- 동시접속 1만명 지원 한국형 엔터프라이즈 커머스 플랫폼

-- ============================================
-- 확장 프로그램 설치
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================
-- ENUM 타입 정의
-- ============================================

CREATE TYPE user_type AS ENUM ('USER', 'ADMIN', 'BUSINESS');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER');

CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED');
CREATE TYPE product_condition AS ENUM ('NEW', 'USED', 'REFURBISHED');

CREATE TYPE order_status AS ENUM (
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 
    'CANCELLED', 'REFUNDED', 'PAYMENT_PENDING', 'PAYMENT_FAILED'
);
CREATE TYPE order_type AS ENUM ('B2C', 'B2B', 'MARKETPLACE');

CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_provider AS ENUM ('TOSS_PAY', 'CARD', 'BANK_TRANSFER', 'PAYPAL');

CREATE TYPE business_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE business_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR');

-- ============================================
-- 사용자 관리
-- ============================================

CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'usr_' || encode(gen_random_bytes(8), 'hex'),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    password VARCHAR(255),
    image TEXT,
    type user_type DEFAULT 'USER',
    status user_status DEFAULT 'ACTIVE',
    verified BOOLEAN DEFAULT FALSE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP,
    role user_role DEFAULT 'USER',
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    email_verified TIMESTAMP,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 프로필
CREATE TABLE user_profiles (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'prof_' || encode(gen_random_bytes(8), 'hex'),
    user_id VARCHAR(25) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    website VARCHAR(255),
    location VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10),
    preferences JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OAuth 계정 연동
CREATE TABLE accounts (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'acc_' || encode(gen_random_bytes(8), 'hex'),
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- 세션 관리
CREATE TABLE sessions (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'sess_' || encode(gen_random_bytes(8), 'hex'),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 카테고리 관리
-- ============================================

CREATE TABLE categories (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cat_' || encode(gen_random_bytes(8), 'hex'),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id VARCHAR(25) REFERENCES categories(id),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 상품 관리
-- ============================================

CREATE TABLE products (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'prod_' || encode(gen_random_bytes(8), 'hex'),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(50),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    compare_at DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    track_stock BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8,2),
    dimensions JSONB,
    category_id VARCHAR(25) REFERENCES categories(id),
    brand VARCHAR(100),
    tags TEXT[],
    status product_status DEFAULT 'DRAFT',
    condition product_condition DEFAULT 'NEW',
    published_at TIMESTAMP,
    featured BOOLEAN DEFAULT FALSE,
    digital BOOLEAN DEFAULT FALSE,
    taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 상품 이미지
CREATE TABLE product_images (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'img_' || encode(gen_random_bytes(8), 'hex'),
    product_id VARCHAR(25) REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT,
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 상품 변형 (옵션)
CREATE TABLE product_variants (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'var_' || encode(gen_random_bytes(8), 'hex'),
    product_id VARCHAR(25) REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2),
    compare_at DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    weight DECIMAL(8,2),
    position INTEGER DEFAULT 0,
    image_url TEXT,
    options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 주문 관리
-- ============================================

CREATE TABLE orders (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'ord_' || encode(gen_random_bytes(8), 'hex'),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(25) REFERENCES users(id),
    status order_status DEFAULT 'PENDING',
    type order_type DEFAULT 'B2C',
    currency VARCHAR(3) DEFAULT 'KRW',
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    
    -- 배송 정보
    shipping_address JSONB,
    billing_address JSONB,
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    
    -- 타임스탬프
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 주문 아이템
CREATE TABLE order_items (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'oi_' || encode(gen_random_bytes(8), 'hex'),
    order_id VARCHAR(25) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(25) REFERENCES products(id),
    variant_id VARCHAR(25) REFERENCES product_variants(id),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total DECIMAL(10,2) GENERATED ALWAYS AS (price * quantity) STORED,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 장바구니
-- ============================================

CREATE TABLE carts (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cart_' || encode(gen_random_bytes(8), 'hex'),
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'KRW',
    notes TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'ci_' || encode(gen_random_bytes(8), 'hex'),
    cart_id VARCHAR(25) REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(25) REFERENCES products(id),
    variant_id VARCHAR(25) REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 결제 관리
-- ============================================

CREATE TABLE payments (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'pay_' || encode(gen_random_bytes(8), 'hex'),
    order_id VARCHAR(25) REFERENCES orders(id),
    status payment_status DEFAULT 'PENDING',
    provider payment_provider NOT NULL,
    provider_id VARCHAR(255),
    payment_key VARCHAR(255),
    transaction_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    method VARCHAR(100),
    gateway_response JSONB,
    processed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 환불
CREATE TABLE refunds (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'ref_' || encode(gen_random_bytes(8), 'hex'),
    payment_id VARCHAR(25) REFERENCES payments(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status payment_status DEFAULT 'PENDING',
    provider_refund_id VARCHAR(255),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- B2B 비즈니스 계정
-- ============================================

CREATE TABLE business_accounts (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'biz_' || encode(gen_random_bytes(8), 'hex'),
    user_id VARCHAR(25) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_number VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    representative VARCHAR(100) NOT NULL,
    business_type VARCHAR(100),
    business_category VARCHAR(100),
    business_address TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_invoice_email VARCHAR(255),
    
    -- 계약 정보
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    contract_date DATE,
    contract_end_date DATE,
    
    -- 신용 관리
    credit_limit DECIMAL(15,2) DEFAULT 0,
    current_credit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- 결제 기한 (일)
    discount_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 등급 관리
    tier business_tier DEFAULT 'BRONZE',
    status business_status DEFAULT 'PENDING',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 세금계산서
CREATE TABLE tax_invoices (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'tax_' || encode(gen_random_bytes(8), 'hex'),
    order_id VARCHAR(25) REFERENCES orders(id),
    business_account_id VARCHAR(25) REFERENCES business_accounts(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_business_no VARCHAR(20) NOT NULL,
    buyer_business_no VARCHAR(20) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    buyer_name VARCHAR(255) NOT NULL,
    supply_amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ISSUED',
    file_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 재고 관리
-- ============================================

CREATE TABLE inventory (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'inv_' || encode(gen_random_bytes(8), 'hex'),
    product_id VARCHAR(25) REFERENCES products(id),
    variant_id VARCHAR(25) REFERENCES product_variants(id),
    location_id VARCHAR(25),
    sku VARCHAR(100),
    available INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    damaged INTEGER DEFAULT 0,
    total INTEGER GENERATED ALWAYS AS (available + reserved + damaged) STORED,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    cost DECIMAL(10,2),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, variant_id, location_id)
);

-- 재고 예약
CREATE TABLE inventory_reservations (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'res_' || encode(gen_random_bytes(8), 'hex'),
    product_id VARCHAR(25) REFERENCES products(id),
    variant_id VARCHAR(25) REFERENCES product_variants(id),
    user_id VARCHAR(25) REFERENCES users(id),
    quantity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 리뷰 및 평점
-- ============================================

CREATE TABLE reviews (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'rev_' || encode(gen_random_bytes(8), 'hex'),
    product_id VARCHAR(25) REFERENCES products(id) ON DELETE CASCADE,
    user_id VARCHAR(25) REFERENCES users(id),
    order_id VARCHAR(25) REFERENCES orders(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    images TEXT[],
    status VARCHAR(20) DEFAULT 'PUBLISHED',
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 시스템 설정
-- ============================================

CREATE TABLE system_configs (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cfg_' || encode(gen_random_bytes(8), 'hex'),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- UI 관리
-- ============================================

CREATE TABLE ui_sections (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'ui_' || encode(gen_random_bytes(8), 'hex'),
    key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 다국어 지원
-- ============================================

CREATE TABLE language_packs (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'lang_' || encode(gen_random_bytes(8), 'hex'),
    language_code VARCHAR(10) NOT NULL,
    namespace VARCHAR(50) DEFAULT 'common',
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'ui',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(language_code, namespace, key)
);

-- ============================================
-- 알림 시스템
-- ============================================

CREATE TABLE notifications (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'notif_' || encode(gen_random_bytes(8), 'hex'),
    user_id VARCHAR(25) REFERENCES users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'INFO',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 분석 및 통계
-- ============================================

CREATE TABLE analytics (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'ana_' || encode(gen_random_bytes(8), 'hex'),
    type VARCHAR(50) NOT NULL,
    period VARCHAR(20) DEFAULT 'daily',
    date DATE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(type, period, date)
);

-- ============================================
-- 성능 최적화 인덱스
-- ============================================

-- 사용자 관련 인덱스
CREATE INDEX idx_users_email_active ON users(email) WHERE status = 'ACTIVE' AND deleted_at IS NULL;
CREATE INDEX idx_users_provider ON users(provider, provider_id) WHERE provider IS NOT NULL;
CREATE INDEX idx_users_type_status ON users(type, status);

-- 상품 관련 인덱스
CREATE INDEX idx_products_category_status ON products(category_id, status, published_at DESC) WHERE status = 'ACTIVE';
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_products_price_range ON products(price, compare_at) WHERE status = 'ACTIVE' AND stock > 0;
CREATE INDEX idx_products_slug ON products(slug) WHERE status = 'ACTIVE';

-- 주문 관련 인덱스
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number, created_at DESC);
CREATE INDEX idx_orders_status_date ON orders(status, created_at) WHERE status IN ('PENDING', 'PAYMENT_PENDING');

-- 장바구니 관련 인덱스
CREATE INDEX idx_carts_user_updated ON carts(user_id, updated_at DESC);
CREATE INDEX idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- 결제 관련 인덱스
CREATE INDEX idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX idx_payments_key ON payments(payment_key) WHERE payment_key IS NOT NULL;

-- 카테고리 관련 인덱스
CREATE INDEX idx_categories_parent ON categories(parent_id, position) WHERE is_active = TRUE;
CREATE INDEX idx_categories_slug ON categories(slug) WHERE is_active = TRUE;

-- 리뷰 관련 인덱스
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating, created_at DESC) WHERE status = 'PUBLISHED';

-- 재고 관련 인덱스
CREATE INDEX idx_inventory_product ON inventory(product_id, available);
CREATE INDEX idx_inventory_reservations_active ON inventory_reservations(product_id, status, expires_at) WHERE status = 'ACTIVE';

-- 비즈니스 계정 인덱스
CREATE INDEX idx_business_accounts_number ON business_accounts(business_number, status) WHERE status = 'APPROVED';

-- 분석 인덱스
CREATE INDEX idx_analytics_type_date ON analytics(type, created_at DESC);

-- 알림 인덱스
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- 트리거 함수
-- ============================================

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_accounts_updated_at BEFORE UPDATE ON business_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ui_sections_updated_at BEFORE UPDATE ON ui_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_language_packs_updated_at BEFORE UPDATE ON language_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 보안 설정
-- ============================================

-- RLS (Row Level Security) 활성화 예시
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 통계 업데이트
ANALYZE users;
ANALYZE products;
ANALYZE orders;
ANALYZE categories;