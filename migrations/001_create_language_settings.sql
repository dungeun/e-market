-- Migration: Create language_settings table
-- Date: 2025-09-02
-- Purpose: PRD TASK-004 - Language settings management

-- Drop table if exists (for development)
DROP TABLE IF EXISTS language_settings CASCADE;

-- Create language_settings table
CREATE TABLE language_settings (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    enabled BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add constraint to ensure only one default language
CREATE UNIQUE INDEX idx_only_one_default 
ON language_settings (is_default) 
WHERE is_default = true;

-- Add constraint to limit maximum 3 enabled languages
CREATE OR REPLACE FUNCTION check_max_enabled_languages()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enabled = true THEN
        IF (SELECT COUNT(*) FROM language_settings WHERE enabled = true AND code != NEW.code) >= 3 THEN
            RAISE EXCEPTION 'Maximum 3 languages can be enabled at the same time';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_enabled_languages
BEFORE INSERT OR UPDATE ON language_settings
FOR EACH ROW
EXECUTE FUNCTION check_max_enabled_languages();

-- Create index for performance
CREATE INDEX idx_language_settings_enabled ON language_settings(enabled);
CREATE INDEX idx_language_settings_order ON language_settings(display_order);

-- Insert Korean as the only default language
INSERT INTO language_settings (code, name, native_name, enabled, is_default, display_order)
VALUES ('ko', 'Korean', '한국어', true, true, 1)
ON CONFLICT (code) DO UPDATE SET
    enabled = true,
    is_default = true,
    display_order = 1,
    updated_at = CURRENT_TIMESTAMP;

-- Insert other languages (disabled by default, admin can enable up to 2 more)
INSERT INTO language_settings (code, name, native_name, enabled, is_default, display_order)
VALUES 
    ('en', 'English', 'English', false, false, 2),
    ('ja', 'Japanese', '日本語', false, false, 3),
    ('zh', 'Chinese', '中文', false, false, 4),
    ('es', 'Spanish', 'Español', false, false, 5),
    ('fr', 'French', 'Français', false, false, 6),
    ('de', 'German', 'Deutsch', false, false, 7),
    ('pt', 'Portuguese', 'Português', false, false, 8),
    ('ru', 'Russian', 'Русский', false, false, 9),
    ('ar', 'Arabic', 'العربية', false, false, 10),
    ('hi', 'Hindi', 'हिन्दी', false, false, 11),
    ('it', 'Italian', 'Italiano', false, false, 12),
    ('nl', 'Dutch', 'Nederlands', false, false, 13),
    ('tr', 'Turkish', 'Türkçe', false, false, 14),
    ('vi', 'Vietnamese', 'Tiếng Việt', false, false, 15)
ON CONFLICT (code) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_language_settings_updated_at
BEFORE UPDATE ON language_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();