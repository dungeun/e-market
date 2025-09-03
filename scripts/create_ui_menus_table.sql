-- Create ui_menus table
CREATE TABLE IF NOT EXISTS ui_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL DEFAULT 'header', -- 'header' or 'footer'
  "sectionId" VARCHAR(100) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  visible BOOLEAN DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_ui_menus_type ON ui_menus(type);
CREATE INDEX idx_ui_menus_order ON ui_menus("order");

-- Insert default header menus (ALL and hardcoded menus)
INSERT INTO ui_menus (type, "sectionId", content, visible, "order") VALUES
  ('header', 'all', '{"label": "ALL", "name": "ALL", "href": "#", "icon": null, "label_en": "ALL", "label_ja": "すべて"}'::jsonb, true, 1),
  ('header', 'campaigns', '{"label": "캠페인", "name": "캠페인", "href": "/campaigns", "icon": null, "label_en": "Campaigns", "label_ja": "キャンペーン"}'::jsonb, true, 2),
  ('header', 'influencers', '{"label": "인플루언서", "name": "인플루언서", "href": "/influencers", "icon": null, "label_en": "Influencers", "label_ja": "インフルエンサー"}'::jsonb, true, 3),
  ('header', 'community', '{"label": "커뮤니티", "name": "커뮤니티", "href": "/community", "icon": null, "label_en": "Community", "label_ja": "コミュニティ"}'::jsonb, true, 4),
  ('header', 'pricing', '{"label": "가격정책", "name": "가격정책", "href": "/pricing", "icon": null, "label_en": "Pricing", "label_ja": "価格"}'::jsonb, true, 5),
  ('header', 'brand', '{"label": "BRAND", "name": "BRAND", "href": "/brands", "icon": null, "label_en": "BRAND", "label_ja": "ブランド"}'::jsonb, true, 6),
  ('header', 'community2', '{"label": "COMMUNITY", "name": "COMMUNITY", "href": "/community", "icon": null, "label_en": "COMMUNITY", "label_ja": "コミュニティ"}'::jsonb, true, 7);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating timestamp
CREATE TRIGGER update_ui_menus_updated_at BEFORE UPDATE
  ON ui_menus FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();