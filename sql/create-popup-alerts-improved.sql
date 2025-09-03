-- Drop existing table if needed (for clean setup)
DROP TABLE IF EXISTS popup_alerts CASCADE;

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create popup_alerts table with multi-language support
CREATE TABLE popup_alerts (
    id SERIAL PRIMARY KEY,
    message_ko TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_jp TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "backgroundColor" VARCHAR(7) DEFAULT '#3B82F6',
    "textColor" VARCHAR(7) DEFAULT '#FFFFFF',
    template VARCHAR(20) DEFAULT 'info',
    "showCloseButton" BOOLEAN DEFAULT true,
    "startDate" TIMESTAMP DEFAULT NOW(),
    "endDate" TIMESTAMP DEFAULT NULL,
    "priority" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_popup_alerts_active ON popup_alerts("isActive");
CREATE INDEX idx_popup_alerts_dates ON popup_alerts("startDate", "endDate");
CREATE INDEX idx_popup_alerts_priority ON popup_alerts("priority" DESC);

-- Create trigger for updating updatedAt
CREATE TRIGGER update_popup_alerts_updated_at 
BEFORE UPDATE ON popup_alerts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample popup alerts with multi-language support
INSERT INTO popup_alerts (
    message_ko, 
    message_en, 
    message_jp, 
    "isActive", 
    "backgroundColor", 
    "textColor", 
    template, 
    "showCloseButton",
    "priority"
) 
VALUES 
(
    '🎉 신규 회원 가입시 10% 할인 쿠폰 증정! 지금 가입하세요!',
    '🎉 Get 10% off coupon for new members! Sign up now!',
    '🎉 新規会員登録で10%割引クーポンプレゼント！今すぐ登録！',
    true, 
    '#DC2626', 
    '#FFFFFF', 
    'urgent', 
    true,
    100
),
(
    '📦 전 상품 무료 배송 이벤트 진행중!',
    '📦 Free shipping on all products!',
    '📦 全商品送料無料キャンペーン実施中！',
    false, 
    '#10B981', 
    '#FFFFFF', 
    'success', 
    true,
    90
)
ON CONFLICT DO NOTHING;