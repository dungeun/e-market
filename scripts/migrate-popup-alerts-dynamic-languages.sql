-- Migration: Convert popup_alerts to dynamic language support
-- Date: 2025-01-09
-- Purpose: Enable popup alerts to use dynamic languages from language_settings

-- Step 1: Create popup_alert_translations table
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

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_popup_alert_translations_popup_id 
  ON popup_alert_translations(popup_alert_id);
  
CREATE INDEX IF NOT EXISTS idx_popup_alert_translations_language 
  ON popup_alert_translations(language_code);

-- Step 3: Migrate existing data from popup_alerts to popup_alert_translations
-- Insert Korean translations
INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
SELECT id, 'ko', message_ko
FROM popup_alerts
WHERE message_ko IS NOT NULL AND message_ko != ''
ON CONFLICT (popup_alert_id, language_code) DO NOTHING;

-- Insert English translations
INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
SELECT id, 'en', message_en
FROM popup_alerts
WHERE message_en IS NOT NULL AND message_en != ''
ON CONFLICT (popup_alert_id, language_code) DO NOTHING;

-- Insert Japanese translations (handle both 'ja' and 'jp' codes)
INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
SELECT id, 
  CASE 
    WHEN EXISTS (SELECT 1 FROM language_settings WHERE code = 'ja' AND enabled = true) THEN 'ja'
    WHEN EXISTS (SELECT 1 FROM language_settings WHERE code = 'jp' AND enabled = true) THEN 'jp'
    ELSE 'ja'
  END,
  message_jp
FROM popup_alerts
WHERE message_jp IS NOT NULL AND message_jp != ''
ON CONFLICT (popup_alert_id, language_code) DO NOTHING;

-- Step 4: Add comment to document the table
COMMENT ON TABLE popup_alert_translations IS 'Stores translations for popup alerts in multiple languages';
COMMENT ON COLUMN popup_alert_translations.popup_alert_id IS 'Reference to the popup alert';
COMMENT ON COLUMN popup_alert_translations.language_code IS 'Language code from language_settings';
COMMENT ON COLUMN popup_alert_translations.message IS 'Translated message for this language';

-- Step 5: Create a view for easier querying (optional but helpful)
CREATE OR REPLACE VIEW popup_alerts_with_translations AS
SELECT 
  pa.*,
  COALESCE(
    json_object_agg(
      pat.language_code, 
      pat.message
    ) FILTER (WHERE pat.language_code IS NOT NULL),
    '{}'::json
  ) as translations
FROM popup_alerts pa
LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id
GROUP BY pa.id;

-- Step 6: Create function to get popup alert with translations
CREATE OR REPLACE FUNCTION get_popup_alert_translations(alert_id INTEGER)
RETURNS TABLE (
  language_code VARCHAR(10),
  message TEXT,
  language_name VARCHAR(100),
  native_name VARCHAR(100),
  flag_emoji VARCHAR(10)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pat.language_code,
    pat.message,
    ls.name as language_name,
    ls.native_name,
    ls.flag_emoji
  FROM popup_alert_translations pat
  JOIN language_settings ls ON pat.language_code = ls.code
  WHERE pat.popup_alert_id = alert_id
  ORDER BY ls.display_order;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_popup_alert_translations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popup_alert_translations_updated_at
BEFORE UPDATE ON popup_alert_translations
FOR EACH ROW
EXECUTE FUNCTION update_popup_alert_translations_timestamp();

-- Note: The old columns (message_ko, message_en, message_jp) are kept for backward compatibility
-- They can be dropped later with: ALTER TABLE popup_alerts DROP COLUMN message_ko, DROP COLUMN message_en, DROP COLUMN message_jp;

-- Verification query
SELECT 
  'Migration Complete!' as status,
  COUNT(DISTINCT popup_alert_id) as alerts_migrated,
  COUNT(*) as total_translations,
  array_agg(DISTINCT language_code) as languages
FROM popup_alert_translations;