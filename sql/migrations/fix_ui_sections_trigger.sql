-- Fix the trigger for ui_sections table to use correct column name

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_ui_sections_updated_at ON ui_sections;

-- Create or replace the trigger function to use updatedAt instead of updated_at
CREATE OR REPLACE FUNCTION update_ui_sections_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_ui_sections_updated_at
    BEFORE UPDATE ON ui_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_ui_sections_updated_at_column();

-- Also clean up the duplicate is_active column (keep isActive, remove is_active)
-- First copy any data from is_active to isActive if needed
UPDATE ui_sections 
SET "isActive" = COALESCE("isActive", is_active, true)
WHERE "isActive" IS NULL AND is_active IS NOT NULL;

-- Then drop the duplicate column
ALTER TABLE ui_sections DROP COLUMN IF EXISTS is_active;