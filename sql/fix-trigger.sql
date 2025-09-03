-- Fix the database trigger function to use correct camelCase field names
-- 데이터베이스 트리거 함수 수정: camelCase 필드명 사용

-- Drop existing trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create new trigger function that uses updatedAt instead of updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the table has updatedAt field (camelCase)
    IF TG_TABLE_NAME IN ('ui_sections') THEN
        NEW."updatedAt" = NOW();
    ELSE
        -- For tables that still use snake_case
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate all triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_accounts_updated_at BEFORE UPDATE ON business_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ui_sections_updated_at BEFORE UPDATE ON ui_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_language_packs_updated_at BEFORE UPDATE ON language_packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();