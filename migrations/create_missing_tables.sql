-- ===============================================
-- 누락된 테이블들 생성 마이그레이션
-- E-Market Korea - Missing Tables Migration
-- ===============================================

-- 1. site_config 테이블 (사이트 설정용)
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 사이트 설정 데이터 삽입
INSERT INTO site_config (key, value, description, category, is_public) VALUES 
    ('site_name', 'E-Market Korea', '사이트 이름', 'general', true),
    ('site_description', '해외 노동자를 위한 중고 거래 플랫폼', '사이트 설명', 'general', true),
    ('default_language', 'ko', '기본 언어', 'language', true),
    ('enabled_languages', 'ko,en', '활성화된 언어 목록', 'language', true)
ON CONFLICT (key) DO NOTHING;

-- 2. language_settings 테이블
CREATE TABLE IF NOT EXISTS language_settings (
    id SERIAL PRIMARY KEY,
    selected_languages TEXT[] DEFAULT '{"ko"}',
    default_language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 언어 설정 삽입
INSERT INTO language_settings (selected_languages, default_language) VALUES 
    ('{"ko","en"}', 'ko')
ON CONFLICT DO NOTHING;

-- 3. language_pack_keys 테이블
CREATE TABLE IF NOT EXISTS language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_id VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. language_pack_translations 테이블
CREATE TABLE IF NOT EXISTS language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);

-- 5. ui_menus 테이블 (내비게이션 메뉴용)
CREATE TABLE IF NOT EXISTS ui_menus (
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

-- 기본 메뉴 아이템들 삽입
INSERT INTO ui_menus (name, slug, url, menu_order, is_active) VALUES 
    ('홈', 'home', '/', 1, true),
    ('상품', 'products', '/products', 2, true),
    ('카테고리', 'categories', '/categories', 3, true),
    ('로그인', 'login', '/auth/login', 4, true),
    ('회원가입', 'register', '/auth/register', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 기본 언어팩 키 삽입
INSERT INTO language_pack_keys (key_name, component_type, description, is_active) VALUES 
    ('menu.home', 'menu', '홈 메뉴', true),
    ('menu.products', 'menu', '상품 메뉴', true),
    ('menu.categories', 'menu', '카테고리 메뉴', true),
    ('menu.login', 'menu', '로그인 메뉴', true),
    ('menu.register', 'menu', '회원가입 메뉴', true),
    ('menu.cart', 'menu', '장바구니 메뉴', true),
    ('menu.mypage', 'menu', '마이페이지 메뉴', true)
ON CONFLICT (key_name) DO NOTHING;

-- 한국어 번역 삽입
INSERT INTO language_pack_translations (key_id, language_code, translation) 
SELECT lpk.id, 'ko', 
    CASE lpk.key_name
        WHEN 'menu.home' THEN '홈'
        WHEN 'menu.products' THEN '상품'
        WHEN 'menu.categories' THEN '카테고리'
        WHEN 'menu.login' THEN '로그인'
        WHEN 'menu.register' THEN '회원가입'
        WHEN 'menu.cart' THEN '장바구니'
        WHEN 'menu.mypage' THEN '마이페이지'
    END
FROM language_pack_keys lpk 
WHERE lpk.key_name IN ('menu.home', 'menu.products', 'menu.categories', 'menu.login', 'menu.register', 'menu.cart', 'menu.mypage')
ON CONFLICT (key_id, language_code) DO NOTHING;

-- 영어 번역 삽입
INSERT INTO language_pack_translations (key_id, language_code, translation) 
SELECT lpk.id, 'en', 
    CASE lpk.key_name
        WHEN 'menu.home' THEN 'Home'
        WHEN 'menu.products' THEN 'Products'
        WHEN 'menu.categories' THEN 'Categories'
        WHEN 'menu.login' THEN 'Login'
        WHEN 'menu.register' THEN 'Sign Up'
        WHEN 'menu.cart' THEN 'Cart'
        WHEN 'menu.mypage' THEN 'My Page'
    END
FROM language_pack_keys lpk 
WHERE lpk.key_name IN ('menu.home', 'menu.products', 'menu.categories', 'menu.login', 'menu.register', 'menu.cart', 'menu.mypage')
ON CONFLICT (key_id, language_code) DO NOTHING;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);
CREATE INDEX IF NOT EXISTS idx_language_pack_keys_active ON language_pack_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_language_pack_translations_lookup ON language_pack_translations(key_id, language_code);
CREATE INDEX IF NOT EXISTS idx_ui_menus_active ON ui_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_ui_menus_order ON ui_menus(menu_order);

-- 업데이트 타임스탬프 트리거 함수 (없는 경우에만 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_language_settings_updated_at ON language_settings;
CREATE TRIGGER update_language_settings_updated_at
    BEFORE UPDATE ON language_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_language_pack_keys_updated_at ON language_pack_keys;
CREATE TRIGGER update_language_pack_keys_updated_at
    BEFORE UPDATE ON language_pack_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_language_pack_translations_updated_at ON language_pack_translations;
CREATE TRIGGER update_language_pack_translations_updated_at
    BEFORE UPDATE ON language_pack_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ui_menus_updated_at ON ui_menus;
CREATE TRIGGER update_ui_menus_updated_at
    BEFORE UPDATE ON ui_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 성공 메시지
SELECT 'Missing tables migration completed successfully!' as result;