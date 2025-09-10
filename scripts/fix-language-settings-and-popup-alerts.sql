-- Fix language_settings table and create popup alerts with dynamic language support
-- Date: 2025-01-09

-- Step 1: Backup existing language_settings if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM language_settings LIMIT 1) THEN
    CREATE TABLE IF NOT EXISTS language_settings_backup AS SELECT * FROM language_settings;
  END IF;
END $$;

-- Step 2: Drop and recreate language_settings with proper structure
DROP TABLE IF EXISTS language_settings CASCADE;

CREATE TABLE language_settings (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  google_code VARCHAR(10),
  direction VARCHAR(3) DEFAULT 'ltr',
  flag_emoji VARCHAR(10),
  enabled BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Insert default languages
INSERT INTO language_settings (code, name, native_name, google_code, flag_emoji, enabled, is_default, display_order) VALUES
  ('ko', 'Korean', '한국어', 'ko', '🇰🇷', true, true, 1),
  ('en', 'English', 'English', 'en', '🇺🇸', true, false, 2),
  ('ja', 'Japanese', '日本語', 'ja', '🇯🇵', true, false, 3),
  ('zh', 'Chinese', '中文', 'zh-CN', '🇨🇳', false, false, 4),
  ('es', 'Spanish', 'Español', 'es', '🇪🇸', false, false, 5),
  ('fr', 'French', 'Français', 'fr', '🇫🇷', false, false, 6),
  ('de', 'German', 'Deutsch', 'de', '🇩🇪', false, false, 7),
  ('pt', 'Portuguese', 'Português', 'pt', '🇵🇹', false, false, 8),
  ('ru', 'Russian', 'Русский', 'ru', '🇷🇺', false, false, 9),
  ('ar', 'Arabic', 'العربية', 'ar', '🇸🇦', false, false, 10),
  ('hi', 'Hindi', 'हिन्दी', 'hi', '🇮🇳', false, false, 11),
  ('vi', 'Vietnamese', 'Tiếng Việt', 'vi', '🇻🇳', false, false, 12),
  ('th', 'Thai', 'ไทย', 'th', '🇹🇭', false, false, 13),
  ('id', 'Indonesian', 'Bahasa Indonesia', 'id', '🇮🇩', false, false, 14),
  ('it', 'Italian', 'Italiano', 'it', '🇮🇹', false, false, 15)
ON CONFLICT (code) DO NOTHING;

-- Step 4: Create unique constraint for language_settings
ALTER TABLE language_settings ADD CONSTRAINT unique_language_code UNIQUE (code);

-- Step 5: Now create popup_alert_translations table
CREATE TABLE IF NOT EXISTS popup_alert_translations (
  id SERIAL PRIMARY KEY,
  popup_alert_id INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_popup_alert
    FOREIGN KEY (popup_alert_id) 
    REFERENCES popup_alerts(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_language
    FOREIGN KEY (language_code) 
    REFERENCES language_settings(code) 
    ON DELETE CASCADE,
    
  -- Unique constraint to prevent duplicate translations
  CONSTRAINT unique_popup_language 
    UNIQUE (popup_alert_id, language_code)
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_popup_alert_translations_popup_id 
  ON popup_alert_translations(popup_alert_id);
  
CREATE INDEX IF NOT EXISTS idx_popup_alert_translations_language 
  ON popup_alert_translations(language_code);

-- Step 7: Create view for easy querying
CREATE OR REPLACE VIEW popup_alerts_with_translations AS
SELECT 
  pa.*,
  COALESCE(
    json_object_agg(
      pat.language_code, 
      json_build_object(
        'message', pat.message,
        'language_name', ls.name,
        'native_name', ls.native_name,
        'flag_emoji', ls.flag_emoji
      )
    ) FILTER (WHERE pat.language_code IS NOT NULL),
    '{}'::json
  ) as translations
FROM popup_alerts pa
LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id
LEFT JOIN language_settings ls ON pat.language_code = ls.code
GROUP BY pa.id;

-- Step 8: Create helper function to get active popup
CREATE OR REPLACE FUNCTION get_active_popup_for_language(lang_code VARCHAR)
RETURNS TABLE (
  id INTEGER,
  message TEXT,
  "backgroundColor" VARCHAR(7),
  "textColor" VARCHAR(7),
  template VARCHAR(50),
  "showCloseButton" BOOLEAN,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pat.message,
    pa."backgroundColor",
    pa."textColor",
    pa.template,
    pa."showCloseButton",
    pa.priority
  FROM popup_alerts pa
  LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id AND pat.language_code = lang_code
  WHERE pa."isActive" = true
    AND (pa."startDate" IS NULL OR pa."startDate" <= NOW())
    AND (pa."endDate" IS NULL OR pa."endDate" >= NOW())
    AND pat.message IS NOT NULL
  ORDER BY pa.priority DESC, pa."createdAt" DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Insert sample translations for existing popup alert
INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
SELECT 
  pa.id,
  ls.code,
  CASE ls.code
    WHEN 'ko' THEN '🎉 환영합니다! 동적 언어 지원이 활성화되었습니다.'
    WHEN 'en' THEN '🎉 Welcome! Dynamic language support is now enabled.'
    WHEN 'ja' THEN '🎉 ようこそ！動的言語サポートが有効になりました。'
    ELSE '🎉 Welcome!'
  END
FROM popup_alerts pa
CROSS JOIN language_settings ls
WHERE ls.enabled = true
  AND NOT EXISTS (
    SELECT 1 FROM popup_alert_translations pat 
    WHERE pat.popup_alert_id = pa.id AND pat.language_code = ls.code
  );

-- Step 10: Update popup_alerts legacy columns from translations
UPDATE popup_alerts pa
SET 
  message_ko = (SELECT message FROM popup_alert_translations WHERE popup_alert_id = pa.id AND language_code = 'ko'),
  message_en = (SELECT message FROM popup_alert_translations WHERE popup_alert_id = pa.id AND language_code = 'en'),
  message_jp = (SELECT message FROM popup_alert_translations WHERE popup_alert_id = pa.id AND language_code = 'ja');

-- Verification
SELECT 
  'Migration Complete!' as status,
  (SELECT COUNT(*) FROM language_settings WHERE enabled = true) as active_languages,
  (SELECT COUNT(*) FROM popup_alerts) as total_alerts,
  (SELECT COUNT(*) FROM popup_alert_translations) as total_translations,
  (SELECT array_agg(DISTINCT language_code ORDER BY language_code) FROM popup_alert_translations) as languages;