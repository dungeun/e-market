-- Create popup_alerts table for managing website popup notifications
CREATE TABLE IF NOT EXISTS popup_alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "backgroundColor" VARCHAR(7) DEFAULT '#3B82F6',
    "textColor" VARCHAR(7) DEFAULT '#FFFFFF',
    template VARCHAR(20) DEFAULT 'info',
    "showCloseButton" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create trigger for popup_alerts table
CREATE TRIGGER update_popup_alerts_updated_at 
BEFORE UPDATE ON popup_alerts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample popup alert
INSERT INTO popup_alerts (message, "isActive", "backgroundColor", "textColor", template, "showCloseButton") 
VALUES 
('🎉 신규 회원 가입시 10% 할인 쿠폰 증정! 지금 가입하세요!', true, '#DC2626', '#FFFFFF', 'urgent', true)
ON CONFLICT DO NOTHING;