-- Add is_active column to ui_sections table if it doesn't exist
-- This migration ensures the ui_sections table has the is_active column

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ui_sections'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE ui_sections 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        
        -- Update existing rows to be active by default
        UPDATE ui_sections 
        SET is_active = TRUE 
        WHERE is_active IS NULL;
        
        RAISE NOTICE 'Added is_active column to ui_sections table';
    ELSE
        RAISE NOTICE 'is_active column already exists in ui_sections table';
    END IF;
END $$;

-- Ensure the order column exists as well
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ui_sections'
        AND column_name = 'order'
    ) THEN
        ALTER TABLE ui_sections 
        ADD COLUMN "order" INTEGER DEFAULT 0;
        
        -- Set default order values based on existing rows
        UPDATE ui_sections 
        SET "order" = 
            CASE key
                WHEN 'hero' THEN 1
                WHEN 'quicklinks' THEN 2
                WHEN 'category' THEN 3
                WHEN 'promo' THEN 4
                WHEN 'active-campaigns' THEN 5
                WHEN 'products' THEN 6
                WHEN 'ranking' THEN 7
                WHEN 'recommended' THEN 8
                ELSE 99
            END
        WHERE "order" IS NULL OR "order" = 0;
        
        RAISE NOTICE 'Added order column to ui_sections table';
    ELSE
        RAISE NOTICE 'order column already exists in ui_sections table';
    END IF;
END $$;