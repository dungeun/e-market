-- site_settings 테이블 생성
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 설정 추가
INSERT INTO site_settings (key, value, description) VALUES
('general', '{
  "siteName": "Commerce Store",
  "siteUrl": "https://commerce.example.com",
  "logo": "/logo.png",
  "favicon": "/favicon.ico",
  "description": "최고의 온라인 쇼핑 경험을 제공합니다.",
  "keywords": "온라인쇼핑, 이커머스, 전자상거래",
  "adminEmail": "admin@example.com",
  "timezone": "Asia/Seoul",
  "language": "ko",
  "currency": "KRW",
  "dateFormat": "YYYY-MM-DD",
  "timeFormat": "24h",
  "maintenanceMode": false,
  "maintenanceMessage": "시스템 점검 중입니다. 잠시 후 다시 시도해주세요."
}', '일반 설정'),
('store', '{
  "storeName": "Commerce Store",
  "storeEmail": "store@example.com",
  "storePhone": "02-1234-5678",
  "storeAddress": "서울시 강남구 테헤란로 123",
  "businessNumber": "123-45-67890",
  "ceoName": "홍길동",
  "onlineBusinessNumber": "2024-서울강남-1234",
  "facebook": "https://facebook.com/commercestore",
  "instagram": "https://instagram.com/commercestore",
  "twitter": "https://twitter.com/commercestore",
  "youtube": "https://youtube.com/commercestore"
}', '스토어 정보'),
('shipping', '{
  "freeShippingThreshold": 50000,
  "defaultShippingFee": 3000,
  "expressShippingFee": 5000,
  "returnPeriod": 7,
  "exchangePeriod": 7
}', '배송 설정'),
('payment', '{
  "enableCreditCard": true,
  "enableBankTransfer": true,
  "enableVirtualAccount": true,
  "enableKakaoPay": true,
  "enableNaverPay": true,
  "enableTossPay": false,
  "pgProvider": "nicepay",
  "merchantId": "MERCHANT123",
  "taxRate": 10
}', '결제 설정'),
('inventory', '{
  "trackInventory": true,
  "allowBackorders": false,
  "lowStockThreshold": 10,
  "outOfStockThreshold": 0,
  "holdStockMinutes": 60
}', '재고 설정'),
('email', '{
  "orderConfirmation": true,
  "shippingNotification": true,
  "deliveryNotification": true,
  "returnNotification": true,
  "promotionalEmails": true,
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUser": "noreply@example.com"
}', '이메일 설정'),
('security', '{
  "requireEmailVerification": true,
  "passwordMinLength": 8,
  "passwordRequireUppercase": true,
  "passwordRequireNumbers": true,
  "passwordRequireSpecialChars": false,
  "maxLoginAttempts": 5,
  "lockoutDuration": 30,
  "enableTwoFactor": false,
  "sessionTimeout": 60
}', '보안 설정'),
('backup', '{
  "autoBackup": true,
  "backupFrequency": "daily",
  "backupTime": "03:00",
  "backupRetention": 30,
  "backupLocation": "cloud"
}', '백업 설정'),
('seo', '{
  "enableSitemap": true,
  "enableRobots": true,
  "googleAnalytics": "G-XXXXXXXXXX",
  "naverWebmaster": "",
  "googleSearchConsole": ""
}', 'SEO 설정')
ON CONFLICT (key) DO NOTHING;