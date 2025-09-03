-- 기존 테이블 삭제
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 카테고리 테이블
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id VARCHAR(50) REFERENCES categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 상품 테이블
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    original_price INTEGER CHECK (original_price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    category_id VARCHAR(50) REFERENCES categories(id),
    status VARCHAR(50) DEFAULT '판매중',
    featured BOOLEAN DEFAULT false,
    new BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    tags TEXT[],
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 상품 이미지 테이블
CREATE TABLE product_images (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(50),
    address TEXT,
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 장바구니 테이블
CREATE TABLE carts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(session_id)
);

-- 장바구니 아이템 테이블
CREATE TABLE cart_items (
    id VARCHAR(50) PRIMARY KEY,
    cart_id VARCHAR(50) REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- 주문 테이블
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    session_id VARCHAR(255),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT,
    shipping_name VARCHAR(255),
    shipping_phone VARCHAR(50),
    shipping_postal_code VARCHAR(20),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 주문 아이템 테이블
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);