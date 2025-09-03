-- 간단한 언어팩 테이블 생성 (언어 설정 테이블 없이)

-- 기존 테이블 삭제 (있는 경우)
DROP TABLE IF EXISTS language_pack_translations CASCADE;
DROP TABLE IF EXISTS language_pack_keys CASCADE;

-- 언어팩 키 테이블 생성
CREATE TABLE language_pack_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_id VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 언어팩 번역 테이블 생성
CREATE TABLE language_pack_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- ko, en, ja
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    translator_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);

-- 성능을 위한 인덱스 생성
CREATE INDEX idx_pack_keys_component ON language_pack_keys(component_type, component_id);
CREATE INDEX idx_pack_keys_active ON language_pack_keys(is_active);
CREATE INDEX idx_pack_translations_lookup ON language_pack_translations(key_id, language_code);
CREATE INDEX idx_pack_translations_language ON language_pack_translations(language_code);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
CREATE TRIGGER update_language_pack_keys_updated_at
BEFORE UPDATE ON language_pack_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_language_pack_translations_updated_at
BEFORE UPDATE ON language_pack_translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();