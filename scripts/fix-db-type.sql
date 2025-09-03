-- Fix ui_sections table type field
-- Set type = key where type is NULL or empty
UPDATE ui_sections 
SET type = key 
WHERE type IS NULL OR type = '';

-- Verify the update
SELECT id, key, type, title FROM ui_sections;