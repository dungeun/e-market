-- 기존 ui_menus 테이블의 메뉴를 언어팩 시스템으로 마이그레이션하는 스크립트

-- 1. 기존 메뉴들을 위한 언어팩 키 생성 및 번역 데이터 추가
DO $$
DECLARE
    menu_record RECORD;
    language_pack_key TEXT;
    key_id UUID;
    menu_content JSONB;
    menu_name TEXT;
    menu_name_en TEXT;
    menu_name_ja TEXT;
BEGIN
    -- 모든 기존 메뉴를 순회
    FOR menu_record IN 
        SELECT * FROM ui_menus 
        WHERE type = 'header' AND visible = true
        ORDER BY "order" ASC
    LOOP
        menu_content := menu_record.content;
        menu_name := COALESCE(menu_content->>'label', menu_content->>'name', menu_record."sectionId");
        menu_name_en := menu_content->>'label_en';
        menu_name_ja := menu_content->>'label_ja';
        
        -- 언어팩 키 생성 (기존 sectionId 기반)
        language_pack_key := 'header.menu.' || menu_record."sectionId";
        
        -- 중복 키 체크
        SELECT id INTO key_id FROM language_pack_keys WHERE key_name = language_pack_key;
        
        -- 언어팩 키가 없으면 생성
        IF key_id IS NULL THEN
            -- 언어팩 키 생성
            INSERT INTO language_pack_keys (key_name, component_type, component_id, description)
            VALUES (language_pack_key, 'menu', 'header', 'Header 메뉴: ' || menu_name)
            RETURNING id INTO key_id;
            
            -- 한국어 번역 추가
            IF menu_name IS NOT NULL THEN
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES (key_id, 'ko', menu_name, false);
            END IF;
            
            -- 영어 번역 추가 (있는 경우)
            IF menu_name_en IS NOT NULL THEN
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES (key_id, 'en', menu_name_en, true);
            ELSE
                -- 영어 번역이 없으면 한국어와 동일하게
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES (key_id, 'en', menu_name, false);
            END IF;
            
            -- 일본어 번역 추가 (있는 경우)
            IF menu_name_ja IS NOT NULL THEN
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES (key_id, 'ja', menu_name_ja, true);
            ELSE
                -- 일본어 번역이 없으면 한국어와 동일하게
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES (key_id, 'ja', menu_name, false);
            END IF;
        END IF;
        
        -- ui_menus 테이블의 content 업데이트 (언어팩 키 참조 추가)
        UPDATE ui_menus 
        SET content = jsonb_set(
            content, 
            '{languagePackKey}', 
            to_jsonb(language_pack_key)
        )
        WHERE id = menu_record.id;
        
        RAISE NOTICE '메뉴 마이그레이션 완료: % -> %', menu_name, language_pack_key;
    END LOOP;
END $$;

-- 마이그레이션 결과 확인
SELECT 
    um.id,
    um."sectionId",
    um.content->>'languagePackKey' as language_pack_key,
    lpk.key_name,
    json_object_agg(lpt.language_code, lpt.translation) as translations
FROM ui_menus um
JOIN language_pack_keys lpk ON lpk.key_name = (um.content->>'languagePackKey')
JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
WHERE um.type = 'header' AND um.visible = true
GROUP BY um.id, um."sectionId", um.content->>'languagePackKey', lpk.key_name
ORDER BY um."order" ASC;