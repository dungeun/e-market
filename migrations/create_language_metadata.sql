-- ===============================================
-- 언어 메타데이터 테이블 생성
-- Language Metadata Table Migration
-- ===============================================

-- 언어 메타데이터 테이블 생성
CREATE TABLE IF NOT EXISTS language_metadata (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    google_code VARCHAR(10) NOT NULL,
    direction VARCHAR(3) DEFAULT 'ltr',
    flag_emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 언어 메타데이터 삽입
INSERT INTO language_metadata (code, name, native_name, google_code, direction, flag_emoji) VALUES 
    ('ko', 'Korean', '한국어', 'ko', 'ltr', '🇰🇷'),
    ('en', 'English', 'English', 'en', 'ltr', '🇺🇸'),
    ('ja', 'Japanese', '日本語', 'ja', 'ltr', '🇯🇵'),
    ('zh', 'Chinese Simplified', '简体中文', 'zh-cn', 'ltr', '🇨🇳'),
    ('zh-tw', 'Chinese Traditional', '繁體中文', 'zh-tw', 'ltr', '🇹🇼'),
    ('es', 'Spanish', 'Español', 'es', 'ltr', '🇪🇸'),
    ('fr', 'French', 'Français', 'fr', 'ltr', '🇫🇷'),
    ('de', 'German', 'Deutsch', 'de', 'ltr', '🇩🇪'),
    ('pt', 'Portuguese', 'Português', 'pt', 'ltr', '🇵🇹'),
    ('ru', 'Russian', 'Русский', 'ru', 'ltr', '🇷🇺'),
    ('ar', 'Arabic', 'العربية', 'ar', 'rtl', '🇸🇦'),
    ('hi', 'Hindi', 'हिन्दी', 'hi', 'ltr', '🇮🇳'),
    ('it', 'Italian', 'Italiano', 'it', 'ltr', '🇮🇹'),
    ('nl', 'Dutch', 'Nederlands', 'nl', 'ltr', '🇳🇱'),
    ('tr', 'Turkish', 'Türkçe', 'tr', 'ltr', '🇹🇷'),
    ('vi', 'Vietnamese', 'Tiếng Việt', 'vi', 'ltr', '🇻🇳'),
    ('th', 'Thai', 'ไทย', 'th', 'ltr', '🇹🇭'),
    ('id', 'Indonesian', 'Bahasa Indonesia', 'id', 'ltr', '🇮🇩'),
    ('ms', 'Malay', 'Bahasa Melayu', 'ms', 'ltr', '🇲🇾'),
    ('tl', 'Filipino', 'Filipino', 'tl', 'ltr', '🇵🇭')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    google_code = EXCLUDED.google_code,
    direction = EXCLUDED.direction,
    flag_emoji = EXCLUDED.flag_emoji,
    updated_at = CURRENT_TIMESTAMP;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_language_metadata_name ON language_metadata(name);
CREATE INDEX IF NOT EXISTS idx_language_metadata_google_code ON language_metadata(google_code);

-- 업데이트 트리거 생성
DROP TRIGGER IF EXISTS update_language_metadata_updated_at ON language_metadata;
CREATE TRIGGER update_language_metadata_updated_at
    BEFORE UPDATE ON language_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 성공 메시지
SELECT 'Language metadata table created successfully!' as result;