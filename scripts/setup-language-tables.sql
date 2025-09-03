-- 언어팩 번역 테이블 생성
CREATE TABLE IF NOT EXISTS language_pack_translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    value TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'auto', 'manual', 'verified')),
    translated_by VARCHAR(100),
    translated_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, language_code)
);

-- 언어 메타데이터 테이블 생성 (언어별 세부 정보)
CREATE TABLE IF NOT EXISTS language_metadata (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    google_code VARCHAR(10) NOT NULL,
    direction VARCHAR(5) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    flag_emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 언어 메타데이터 삽입
INSERT INTO language_metadata (code, name, native_name, google_code, direction, flag_emoji) VALUES
('ko', 'Korean', '한국어', 'ko', 'ltr', '🇰🇷'),
('en', 'English', 'English', 'en', 'ltr', '🇺🇸'),
('ja', 'Japanese', '日本語', 'ja', 'ltr', '🇯🇵')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    google_code = EXCLUDED.google_code,
    direction = EXCLUDED.direction,
    flag_emoji = EXCLUDED.flag_emoji,
    updated_at = CURRENT_TIMESTAMP;

-- 추가 언어 메타데이터
INSERT INTO language_metadata (code, name, native_name, google_code, direction, flag_emoji) VALUES
('es', 'Spanish', 'Español', 'es', 'ltr', '🇪🇸'),
('fr', 'French', 'Français', 'fr', 'ltr', '🇫🇷'),
('de', 'German', 'Deutsch', 'de', 'ltr', '🇩🇪'),
('zh', 'Chinese', '中文', 'zh-cn', 'ltr', '🇨🇳'),
('pt', 'Portuguese', 'Português', 'pt', 'ltr', '🇵🇹'),
('ru', 'Russian', 'Русский', 'ru', 'ltr', '🇷🇺'),
('ar', 'Arabic', 'العربية', 'ar', 'rtl', '🇸🇦'),
('hi', 'Hindi', 'हिन्दी', 'hi', 'ltr', '🇮🇳'),
('it', 'Italian', 'Italiano', 'it', 'ltr', '🇮🇹'),
('nl', 'Dutch', 'Nederlands', 'nl', 'ltr', '🇳🇱'),
('th', 'Thai', 'ไทย', 'th', 'ltr', '🇹🇭'),
('vi', 'Vietnamese', 'Tiếng Việt', 'vi', 'ltr', '🇻🇳')
ON CONFLICT (code) DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_language_pack_translations_key ON language_pack_translations(key);
CREATE INDEX IF NOT EXISTS idx_language_pack_translations_language_code ON language_pack_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_language_pack_translations_status ON language_pack_translations(status);

-- 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_language_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
DROP TRIGGER IF EXISTS update_language_pack_translations_updated_at ON language_pack_translations;
CREATE TRIGGER update_language_pack_translations_updated_at
    BEFORE UPDATE ON language_pack_translations
    FOR EACH ROW EXECUTE FUNCTION update_language_updated_at_column();

DROP TRIGGER IF EXISTS update_language_metadata_updated_at ON language_metadata;
CREATE TRIGGER update_language_metadata_updated_at
    BEFORE UPDATE ON language_metadata
    FOR EACH ROW EXECUTE FUNCTION update_language_updated_at_column();