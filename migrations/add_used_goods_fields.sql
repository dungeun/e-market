-- Add used goods specific fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS condition VARCHAR(1) CHECK (condition IN ('S', 'A', 'B', 'C')),
ADD COLUMN IF NOT EXISTS usage_period VARCHAR(255),
ADD COLUMN IF NOT EXISTS purchase_date VARCHAR(255),
ADD COLUMN IF NOT EXISTS defects TEXT,
ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS seller_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS negotiable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS direct_trade BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warranty_info TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_verified_seller ON products(verified_seller);
CREATE INDEX IF NOT EXISTS idx_products_seller_location ON products(seller_location);

-- Add comment to describe condition grades
COMMENT ON COLUMN products.condition IS 'S: 미사용 신품급, A: 사용감 거의 없음, B: 일반 사용감, C: 사용감 많음';