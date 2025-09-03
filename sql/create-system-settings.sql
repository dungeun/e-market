-- Create system_settings table for storing system configurations
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'set_' || encode(gen_random_bytes(8), 'hex'),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger for system_settings table
CREATE TRIGGER update_system_settings_updated_at 
BEFORE UPDATE ON system_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default Google Translate API settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES 
('google_translate_api_key', '', 'Google Translate API Key for automatic translation', 'translation', false),
('google_translate_enabled', 'false', 'Enable/disable Google Translate API integration', 'translation', true)
ON CONFLICT (key) DO NOTHING;