-- Migration: Create language pack tables
-- Date: 2025-09-02
-- Purpose: PRD TASK-005-006 - Language pack key-value structure

-- Drop tables if exists (for development)
DROP TABLE IF EXISTS language_pack_translations CASCADE;
DROP TABLE IF EXISTS language_pack_keys CASCADE;

-- Create language_pack_keys table (master keys)
CREATE TABLE language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- 'section', 'header', 'footer', 'popup', 'common'
    component_id VARCHAR(100), -- e.g., 'hero', 'quicklinks', 'promo'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create language_pack_translations table
CREATE TABLE language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES language_settings(code) ON DELETE CASCADE,
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    translator_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);

-- Create indexes for performance
CREATE INDEX idx_pack_keys_component ON language_pack_keys(component_type, component_id);
CREATE INDEX idx_pack_keys_active ON language_pack_keys(is_active);
CREATE INDEX idx_pack_translations_lookup ON language_pack_translations(key_id, language_code);
CREATE INDEX idx_pack_translations_language ON language_pack_translations(language_code);

-- Create translation cache table for Google Translate API
CREATE TABLE IF NOT EXISTS translation_cache (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'google',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_text, source_language, target_language)
);

-- Create UI configuration table
CREATE TABLE IF NOT EXISTS ui_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50), -- 'header', 'footer', 'general'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_language_pack_keys_updated_at
BEFORE UPDATE ON language_pack_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_language_pack_translations_updated_at
BEFORE UPDATE ON language_pack_translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ui_config_updated_at
BEFORE UPDATE ON ui_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert common language pack keys for sections
INSERT INTO language_pack_keys (key_name, component_type, component_id, description) VALUES
-- Hero Section
('hero.title', 'section', 'hero', 'Hero section main title'),
('hero.subtitle', 'section', 'hero', 'Hero section subtitle'),
('hero.cta_primary', 'section', 'hero', 'Primary call-to-action button'),
('hero.cta_secondary', 'section', 'hero', 'Secondary call-to-action button'),

-- Category Section
('category.title', 'section', 'category', 'Category section title'),
('category.view_all', 'section', 'category', 'View all categories link'),

-- QuickLinks Section
('quicklinks.title', 'section', 'quicklinks', 'Quick links section title'),

-- Promo Section
('promo.title', 'section', 'promo', 'Promotion section title'),
('promo.badge', 'section', 'promo', 'Promotion badge text'),

-- Ranking Section
('ranking.title', 'section', 'ranking', 'Ranking section title'),
('ranking.subtitle', 'section', 'ranking', 'Ranking section subtitle'),

-- Recommended Section
('recommended.title', 'section', 'recommended', 'Recommended products title'),
('recommended.subtitle', 'section', 'recommended', 'Recommended products subtitle'),

-- Best Sellers Section
('bestsellers.title', 'section', 'bestsellers', 'Best sellers section title'),
('bestsellers.badge', 'section', 'bestsellers', 'Best seller badge'),

-- New Arrivals Section
('newarrivals.title', 'section', 'newarrivals', 'New arrivals section title'),
('newarrivals.badge', 'section', 'newarrivals', 'New arrival badge'),

-- Flash Sale Section
('flashsale.title', 'section', 'flashsale', 'Flash sale section title'),
('flashsale.timer', 'section', 'flashsale', 'Flash sale timer text'),
('flashsale.ends_in', 'section', 'flashsale', 'Sale ends in text'),

-- Common UI Elements
('common.add_to_cart', 'common', null, 'Add to cart button'),
('common.view_details', 'common', null, 'View details link'),
('common.price', 'common', null, 'Price label'),
('common.sale_price', 'common', null, 'Sale price label'),
('common.out_of_stock', 'common', null, 'Out of stock message'),
('common.in_stock', 'common', null, 'In stock message'),
('common.loading', 'common', null, 'Loading message'),
('common.error', 'common', null, 'Error message'),

-- Header
('header.search_placeholder', 'header', null, 'Search bar placeholder'),
('header.login', 'header', null, 'Login button'),
('header.signup', 'header', null, 'Sign up button'),
('header.my_account', 'header', null, 'My account link'),
('header.cart', 'header', null, 'Shopping cart'),

-- Footer
('footer.about', 'footer', null, 'About us link'),
('footer.contact', 'footer', null, 'Contact link'),
('footer.privacy', 'footer', null, 'Privacy policy link'),
('footer.terms', 'footer', null, 'Terms of service link'),
('footer.copyright', 'footer', null, 'Copyright text')
ON CONFLICT DO NOTHING;

-- Insert Korean translations for all keys
INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
SELECT 
    lpk.id,
    'ko',
    CASE lpk.key_name
        -- Hero Section
        WHEN 'hero.title' THEN '특별한 쇼핑 경험'
        WHEN 'hero.subtitle' THEN '최고의 상품을 최저가로 만나보세요'
        WHEN 'hero.cta_primary' THEN '쇼핑 시작하기'
        WHEN 'hero.cta_secondary' THEN '더 알아보기'
        -- Category Section
        WHEN 'category.title' THEN '카테고리'
        WHEN 'category.view_all' THEN '전체 보기'
        -- QuickLinks Section
        WHEN 'quicklinks.title' THEN '바로가기'
        -- Promo Section
        WHEN 'promo.title' THEN '프로모션'
        WHEN 'promo.badge' THEN '특가'
        -- Ranking Section
        WHEN 'ranking.title' THEN '실시간 랭킹'
        WHEN 'ranking.subtitle' THEN '지금 가장 인기있는 상품'
        -- Recommended Section
        WHEN 'recommended.title' THEN '추천 상품'
        WHEN 'recommended.subtitle' THEN '당신을 위한 맞춤 추천'
        -- Best Sellers
        WHEN 'bestsellers.title' THEN '베스트셀러'
        WHEN 'bestsellers.badge' THEN 'BEST'
        -- New Arrivals
        WHEN 'newarrivals.title' THEN '신상품'
        WHEN 'newarrivals.badge' THEN 'NEW'
        -- Flash Sale
        WHEN 'flashsale.title' THEN '플래시 세일'
        WHEN 'flashsale.timer' THEN '남은 시간'
        WHEN 'flashsale.ends_in' THEN '종료까지'
        -- Common
        WHEN 'common.add_to_cart' THEN '장바구니 담기'
        WHEN 'common.view_details' THEN '상세보기'
        WHEN 'common.price' THEN '가격'
        WHEN 'common.sale_price' THEN '할인가'
        WHEN 'common.out_of_stock' THEN '품절'
        WHEN 'common.in_stock' THEN '재고 있음'
        WHEN 'common.loading' THEN '로딩 중...'
        WHEN 'common.error' THEN '오류가 발생했습니다'
        -- Header
        WHEN 'header.search_placeholder' THEN '상품 검색...'
        WHEN 'header.login' THEN '로그인'
        WHEN 'header.signup' THEN '회원가입'
        WHEN 'header.my_account' THEN '내 계정'
        WHEN 'header.cart' THEN '장바구니'
        -- Footer
        WHEN 'footer.about' THEN '회사 소개'
        WHEN 'footer.contact' THEN '문의하기'
        WHEN 'footer.privacy' THEN '개인정보처리방침'
        WHEN 'footer.terms' THEN '이용약관'
        WHEN 'footer.copyright' THEN '© 2025 Commerce. All rights reserved.'
        ELSE lpk.key_name
    END,
    false
FROM language_pack_keys lpk
WHERE NOT EXISTS (
    SELECT 1 FROM language_pack_translations lpt 
    WHERE lpt.key_id = lpk.id AND lpt.language_code = 'ko'
);