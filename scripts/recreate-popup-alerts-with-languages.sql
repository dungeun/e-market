-- Recreate popup_alerts table with proper structure for dynamic languages
-- Date: 2025-01-09

-- Step 1: Drop existing table if empty (backup first if needed)
DROP TABLE IF EXISTS popup_alerts CASCADE;

-- Step 2: Create new popup_alerts table
CREATE TABLE popup_alerts (
  id SERIAL PRIMARY KEY,
  "isActive" BOOLEAN DEFAULT true,
  "backgroundColor" VARCHAR(7) DEFAULT '#3B82F6',
  "textColor" VARCHAR(7) DEFAULT '#FFFFFF',
  template VARCHAR(50) DEFAULT 'info',
  "showCloseButton" BOOLEAN DEFAULT true,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  priority INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Temporary columns for backward compatibility
  message_ko TEXT,
  message_en TEXT,
  message_jp TEXT
);

-- Step 3: Create popup_alert_translations table
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

-- Step 4: Create indexes for performance
CREATE INDEX idx_popup_alert_translations_popup_id 
  ON popup_alert_translations(popup_alert_id);
  
CREATE INDEX idx_popup_alert_translations_language 
  ON popup_alert_translations(language_code);

CREATE INDEX idx_popup_alerts_active_priority 
  ON popup_alerts("isActive", priority DESC);

-- Step 5: Create function to get active popup with translations
CREATE OR REPLACE FUNCTION get_active_popup_with_translations()
RETURNS TABLE (
  id INTEGER,
  "isActive" BOOLEAN,
  "backgroundColor" VARCHAR(7),
  "textColor" VARCHAR(7),
  template VARCHAR(50),
  "showCloseButton" BOOLEAN,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  priority INTEGER,
  translations JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa."isActive",
    pa."backgroundColor",
    pa."textColor",
    pa.template,
    pa."showCloseButton",
    pa."startDate",
    pa."endDate",
    pa.priority,
    COALESCE(
      json_object_agg(
        pat.language_code, 
        pat.message
      ) FILTER (WHERE pat.language_code IS NOT NULL),
      '{}'::json
    ) as translations
  FROM popup_alerts pa
  LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id
  WHERE pa."isActive" = true
    AND (pa."startDate" IS NULL OR pa."startDate" <= NOW())
    AND (pa."endDate" IS NULL OR pa."endDate" >= NOW())
  GROUP BY pa.id
  ORDER BY pa.priority DESC, pa."createdAt" DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to sync legacy columns with translations
CREATE OR REPLACE FUNCTION sync_popup_translations()
RETURNS TRIGGER AS $$
BEGIN
  -- When inserting/updating popup_alerts with legacy columns
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Sync Korean
    IF NEW.message_ko IS NOT NULL AND NEW.message_ko != '' THEN
      INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
      VALUES (NEW.id, 'ko', NEW.message_ko)
      ON CONFLICT (popup_alert_id, language_code) 
      DO UPDATE SET message = EXCLUDED.message, updated_at = NOW();
    END IF;
    
    -- Sync English
    IF NEW.message_en IS NOT NULL AND NEW.message_en != '' THEN
      INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
      VALUES (NEW.id, 'en', NEW.message_en)
      ON CONFLICT (popup_alert_id, language_code) 
      DO UPDATE SET message = EXCLUDED.message, updated_at = NOW();
    END IF;
    
    -- Sync Japanese
    IF NEW.message_jp IS NOT NULL AND NEW.message_jp != '' THEN
      INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
      VALUES (NEW.id, 'ja', NEW.message_jp)
      ON CONFLICT (popup_alert_id, language_code) 
      DO UPDATE SET message = EXCLUDED.message, updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_popup_translations_trigger
AFTER INSERT OR UPDATE ON popup_alerts
FOR EACH ROW
EXECUTE FUNCTION sync_popup_translations();

-- Step 7: Create trigger to update legacy columns from translations (reverse sync)
CREATE OR REPLACE FUNCTION sync_popup_legacy_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Update legacy columns when translations change
  IF NEW.language_code = 'ko' THEN
    UPDATE popup_alerts SET message_ko = NEW.message WHERE id = NEW.popup_alert_id;
  ELSIF NEW.language_code = 'en' THEN
    UPDATE popup_alerts SET message_en = NEW.message WHERE id = NEW.popup_alert_id;
  ELSIF NEW.language_code IN ('ja', 'jp') THEN
    UPDATE popup_alerts SET message_jp = NEW.message WHERE id = NEW.popup_alert_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_popup_legacy_columns_trigger
AFTER INSERT OR UPDATE ON popup_alert_translations
FOR EACH ROW
EXECUTE FUNCTION sync_popup_legacy_columns();

-- Step 8: Insert sample popup alert with translations
INSERT INTO popup_alerts ("isActive", template, "backgroundColor", "textColor", priority)
VALUES (true, 'info', '#3B82F6', '#FFFFFF', 100);

-- Get the inserted ID and add translations
INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
VALUES 
  ((SELECT id FROM popup_alerts ORDER BY id DESC LIMIT 1), 'ko', '🎉 환영합니다! 동적 언어 지원이 활성화되었습니다.'),
  ((SELECT id FROM popup_alerts ORDER BY id DESC LIMIT 1), 'en', '🎉 Welcome! Dynamic language support is now enabled.'),
  ((SELECT id FROM popup_alerts ORDER BY id DESC LIMIT 1), 'ja', '🎉 ようこそ！動的言語サポートが有効になりました。');

-- Verification
SELECT 
  'Migration Complete!' as status,
  (SELECT COUNT(*) FROM popup_alerts) as total_alerts,
  (SELECT COUNT(*) FROM popup_alert_translations) as total_translations,
  (SELECT array_agg(DISTINCT language_code) FROM popup_alert_translations) as languages;