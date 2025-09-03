-- 일본어 번역 데이터 정리 스크립트

-- 1. 현재 일본어 번역 데이터 상태 확인
SELECT 
    'language_pack_translations' as table_name,
    COUNT(*) as japanese_count
FROM language_pack_translations 
WHERE language_code = 'ja'
UNION ALL
SELECT 
    'language_settings selected_languages',
    COUNT(*)
FROM language_settings 
WHERE selected_languages @> '["ja"]';

-- 2. language_settings에서 selected_languages 배열에서 일본어 제거
UPDATE language_settings 
SET selected_languages = selected_languages - 'ja',
    updated_at = CURRENT_TIMESTAMP
WHERE selected_languages @> '["ja"]';

-- 3. language_pack_translations에서 일본어 번역 데이터 삭제
DELETE FROM language_pack_translations 
WHERE language_code = 'ja';

-- 4. ui_menus 테이블의 content JSONB에서 일본어 관련 필드 제거
-- 트리거 비활성화하고 업데이트
ALTER TABLE ui_menus DISABLE TRIGGER update_ui_menus_updated_at;

UPDATE ui_menus 
SET content = content - 'label_ja'
WHERE content ? 'label_ja';

-- 트리거 다시 활성화
ALTER TABLE ui_menus ENABLE TRIGGER update_ui_menus_updated_at;

-- 5. 정리 결과 확인
SELECT 
    'After cleanup - language_pack_translations' as table_name,
    COUNT(*) as japanese_count
FROM language_pack_translations 
WHERE language_code = 'ja'
UNION ALL
SELECT 
    'After cleanup - language_settings with ja',
    COUNT(*)
FROM language_settings 
WHERE selected_languages @> '["ja"]'
UNION ALL
SELECT 
    'After cleanup - ui_menus with label_ja',
    COUNT(*)
FROM ui_menus 
WHERE content ? 'label_ja';

-- 6. 현재 선택된 언어 확인
SELECT 
    id,
    selected_languages,
    default_language,
    max_languages,
    updated_at
FROM language_settings 
ORDER BY id;