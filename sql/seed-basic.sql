-- Basic Seed Data for Korean Enterprise Commerce Platform
-- 한국형 엔터프라이즈 커머스 플랫폼 기본 초기 데이터

-- Categories (카테고리) - 기존 스키마에 맞춤
INSERT INTO categories (id, name, slug, description, image_url, position, is_active) VALUES
('cat_fashion', '패션/의류', 'fashion', '패션 및 의류 상품 카테고리', '/images/categories/fashion.jpg', 1, true),
('cat_beauty', '뷰티/화장품', 'beauty', '뷰티 및 화장품 상품 카테고리', '/images/categories/beauty.jpg', 2, true),
('cat_electronics', '전자제품', 'electronics', '전자제품 및 IT 상품 카테고리', '/images/categories/electronics.jpg', 3, true),
('cat_home', '홈/인테리어', 'home', '홈 인테리어 및 생활용품 카테고리', '/images/categories/home.jpg', 4, true),
('cat_food', '식품/음료', 'food', '식품 및 음료 상품 카테고리', '/images/categories/food.jpg', 5, true),
('cat_sports', '스포츠/레저', 'sports', '스포츠 및 레저 용품 카테고리', '/images/categories/sports.jpg', 6, true),
('cat_books', '도서/문구', 'books', '도서 및 문구 상품 카테고리', '/images/categories/books.jpg', 7, true),
('cat_baby', '유아/출산', 'baby', '유아 및 출산 용품 카테고리', '/images/categories/baby.jpg', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Admin Users (관리자 계정) - 기존 스키마에 맞춤
INSERT INTO users (id, email, password, name, phone, type, status, verified, role) VALUES
('admin_master', 'admin@commerce.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '시스템 관리자', '02-1234-5678', 'ADMIN', 'ACTIVE', true, 'ADMIN'),
('admin_cs', 'cs@commerce.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '고객서비스 관리자', '02-1234-5679', 'ADMIN', 'ACTIVE', true, 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Sample Individual Users (개인 사용자)
INSERT INTO users (id, email, password, name, phone, type, status, verified, role, phone_verified) VALUES
('user_kim', 'kim.user@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '김고객', '010-1234-5678', 'USER', 'ACTIVE', true, 'USER', true),
('user_lee', 'lee.user@naver.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '이고객', '010-2345-6789', 'USER', 'ACTIVE', true, 'USER', false),
('user_park', 'park.user@daum.net', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '박고객', '010-3456-7890', 'USER', 'ACTIVE', false, 'USER', true)
ON CONFLICT (id) DO NOTHING;

-- Sample Business Users (기업 사용자)
INSERT INTO users (id, email, password, name, phone, type, status, verified, role) VALUES
('business_abc', 'ceo@abc-corp.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '김사장', '02-9876-5432', 'BUSINESS', 'ACTIVE', true, 'USER'),
('business_xyz', 'manager@xyz-company.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '이부장', '031-1111-2222', 'BUSINESS', 'ACTIVE', true, 'USER')
ON CONFLICT (id) DO NOTHING;

-- Products (상품) - 기존 스키마에 맞춤
INSERT INTO products (id, name, slug, description, short_description, category_id, brand, sku, price, compare_at, cost_price, stock, min_stock, track_stock, weight, status, featured, digital, taxable, tax_rate) VALUES
('prod_galaxy_s24', '갤럭시 S24', 'galaxy-s24', 'Samsung Galaxy S24 최신 스마트폰. AI 기능이 강화된 플래그십 모델로 혁신적인 카메라와 성능을 자랑합니다.', '삼성 갤럭시 S24 AI 스마트폰', 'cat_electronics', '삼성', 'SAM-GS24-128-BK', 999000.00, 1200000.00, 750000.00, 50, 10, true, 200.0, 'ACTIVE', true, false, true, 10.0),
('prod_lg_oled_tv', 'LG OLED 55인치 TV', 'lg-oled-55', 'LG OLED55C4PNA 55인치 4K 스마트 TV. webOS 탑재로 넷플릭스, 유튜브 등 다양한 OTT 서비스 이용 가능.', 'LG 55인치 OLED 4K TV', 'cat_electronics', 'LG', 'LG-OLED55C4-KR', 1990000.00, 2500000.00, 1500000.00, 15, 3, true, 18500.0, 'ACTIVE', true, false, true, 10.0),
('prod_sulwhasoo_serum', '설화수 윤조에센스', 'sulwhasoo-serum', '설화수 대표 에센스. 한방 원료로 만든 프리미엄 스킨케어 제품으로 깊은 보습과 영양을 제공합니다.', '설화수 윤조에센스 60ml', 'cat_beauty', '아모레퍼시픽', 'SWS-YJ-ESS-60ML', 89000.00, 110000.00, 45000.00, 100, 20, true, 150.0, 'ACTIVE', true, false, true, 10.0),
('prod_nike_shoes', '나이키 에어맥스 270', 'nike-airmax-270', '나이키 에어맥스 270 운동화. 편안한 쿠셔닝과 스타일리시한 디자인으로 일상과 운동 모두 완벽한 신발.', '나이키 에어맥스 270 운동화', 'cat_sports', '나이키', 'NIKE-AM270-BK-260', 159000.00, 189000.00, 95000.00, 75, 15, true, 500.0, 'ACTIVE', false, false, true, 10.0),
('prod_dyson_vacuum', '다이슨 V15 무선청소기', 'dyson-v15', '다이슨 V15 디텍트 무선청소기. 레이저로 먼지를 찾아내는 혁신적인 청소기로 강력한 흡입력을 자랑합니다.', '다이슨 V15 레이저 무선청소기', 'cat_home', '다이슨', 'DYS-V15-DETECT-KR', 899000.00, 1100000.00, 650000.00, 25, 5, true, 3200.0, 'ACTIVE', true, false, true, 10.0)
ON CONFLICT (id) DO NOTHING;

-- Product Images (상품 이미지)
INSERT INTO product_images (id, product_id, url, alt_text, position, primary_image) VALUES
('img_galaxy_1', 'prod_galaxy_s24', '/products/galaxy-s24/main.jpg', '갤럭시 S24 메인 이미지', 1, true),
('img_galaxy_2', 'prod_galaxy_s24', '/products/galaxy-s24/back.jpg', '갤럭시 S24 후면 이미지', 2, false),
('img_galaxy_3', 'prod_galaxy_s24', '/products/galaxy-s24/camera.jpg', '갤럭시 S24 카메라 상세', 3, false),
('img_lg_tv_1', 'prod_lg_oled_tv', '/products/lg-oled/main.jpg', 'LG OLED TV 메인', 1, true),
('img_lg_tv_2', 'prod_lg_oled_tv', '/products/lg-oled/side.jpg', 'LG OLED TV 측면', 2, false),
('img_sulwha_1', 'prod_sulwhasoo_serum', '/products/sulwhasoo/essence-main.jpg', '설화수 윤조에센스', 1, true),
('img_nike_1', 'prod_nike_shoes', '/products/nike/airmax-main.jpg', '나이키 에어맥스 270', 1, true),
('img_dyson_1', 'prod_dyson_vacuum', '/products/dyson/v15-main.jpg', '다이슨 V15 청소기', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Product Variants (상품 옵션)
INSERT INTO product_variants (id, product_id, name, sku, price, compare_at, cost_price, stock, weight, status) VALUES
('var_galaxy_128_black', 'prod_galaxy_s24', '128GB 팬텀 블랙', 'SAM-GS24-128-BK', 999000.00, 1200000.00, 750000.00, 50, 200.0, 'ACTIVE'),
('var_galaxy_256_black', 'prod_galaxy_s24', '256GB 팬텀 블랙', 'SAM-GS24-256-BK', 1199000.00, 1400000.00, 850000.00, 30, 200.0, 'ACTIVE'),
('var_galaxy_128_violet', 'prod_galaxy_s24', '128GB 코발트 바이올렛', 'SAM-GS24-128-VT', 999000.00, 1200000.00, 750000.00, 25, 200.0, 'ACTIVE'),
('var_nike_260', 'prod_nike_shoes', '260mm', 'NIKE-AM270-BK-260', 159000.00, 189000.00, 95000.00, 20, 500.0, 'ACTIVE'),
('var_nike_270', 'prod_nike_shoes', '270mm', 'NIKE-AM270-BK-270', 159000.00, 189000.00, 95000.00, 15, 500.0, 'ACTIVE'),
('var_nike_280', 'prod_nike_shoes', '280mm', 'NIKE-AM270-BK-280', 159000.00, 189000.00, 95000.00, 18, 500.0, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Carts (장바구니)
INSERT INTO carts (id, user_id, session_id) VALUES
('cart_kim', 'user_kim', NULL),
('cart_lee', 'user_lee', NULL),
('cart_sess_123', NULL, 'sess_anonymous_123')
ON CONFLICT (id) DO NOTHING;

-- Cart Items (장바구니 상품)
INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity) VALUES
('ci_kim_1', 'cart_kim', 'prod_dyson_vacuum', NULL, 1),
('ci_lee_1', 'cart_lee', 'prod_nike_shoes', 'var_nike_260', 1),
('ci_sess_1', 'cart_sess_123', 'prod_galaxy_s24', 'var_galaxy_256_black', 1)
ON CONFLICT (id) DO NOTHING;

-- Sample Orders (주문 샘플) - 기존 스키마에 맞춤
INSERT INTO orders (id, user_id, order_number, status, payment_status, total_amount, subtotal, tax_amount, shipping_cost, currency, notes) VALUES
('ord_001', 'user_kim', 'ORD-20241223-001', 'DELIVERED', 'PAID', 1008000.00, 999000.00, 99900.00, 3000.00, 'KRW', '첫 번째 주문'),
('ord_002', 'user_lee', 'ORD-20241223-002', 'PROCESSING', 'PAID', 95500.00, 89000.00, 8900.00, 3500.00, 'KRW', '뷰티 제품 주문'),
('ord_003', 'business_abc', 'ORD-20241223-003', 'PENDING', 'PENDING', 1998000.00, 1980000.00, 198000.00, 0.00, 'KRW', '기업 대량 주문'),
('ord_004', 'user_park', 'ORD-20241223-004', 'CANCELLED', 'REFUNDED', 167000.00, 159000.00, 15900.00, 4500.00, 'KRW', '취소된 주문')
ON CONFLICT (id) DO NOTHING;

-- Order Items (주문 상품)
INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price, total, product_name, variant_name) VALUES
('oi_001_1', 'ord_001', 'prod_galaxy_s24', 'var_galaxy_128_black', 1, 999000.00, 999000.00, '갤럭시 S24', '128GB 팬텀 블랙'),
('oi_002_1', 'ord_002', 'prod_sulwhasoo_serum', NULL, 1, 89000.00, 89000.00, '설화수 윤조에센스', NULL),
('oi_003_1', 'ord_003', 'prod_lg_oled_tv', NULL, 1, 1990000.00, 1990000.00, 'LG OLED 55인치 TV', NULL),
('oi_004_1', 'ord_004', 'prod_nike_shoes', 'var_nike_270', 1, 159000.00, 159000.00, '나이키 에어맥스 270', '270mm')
ON CONFLICT (id) DO NOTHING;

-- Payments (결제)
INSERT INTO payments (id, order_id, method, status, amount, currency, gateway, reference, processed_at) VALUES
('pay_001', 'ord_001', 'CARD', 'COMPLETED', 1008000.00, 'KRW', 'TOSSPAY', 'toss_20241223_001', '2024-12-23 10:30:00'),
('pay_002', 'ord_002', 'BANK_TRANSFER', 'COMPLETED', 95500.00, 'KRW', 'BANK', 'bank_20241223_001', '2024-12-23 11:15:00'),
('pay_003', 'ord_003', 'CORPORATE', 'PENDING', 1998000.00, 'KRW', 'CORPORATE', 'corp_20241223_001', NULL),
('pay_004', 'ord_004', 'CARD', 'REFUNDED', 167000.00, 'KRW', 'TOSSPAY', 'toss_20241223_002', '2024-12-23 09:45:00')
ON CONFLICT (id) DO NOTHING;

-- Reviews (리뷰)
INSERT INTO reviews (id, product_id, user_id, rating, title, content, verified, approved, helpful_count) VALUES
('rev_001', 'prod_galaxy_s24', 'user_kim', 5, '정말 만족스러운 폰', '카메라 성능이 정말 좋고 배터리도 오래갑니다. AI 기능도 유용해요. 강력 추천!', true, true, 12),
('rev_002', 'prod_sulwhasoo_serum', 'user_lee', 4, '피부가 촉촉해져요', '사용한지 2주 정도 됐는데 확실히 피부 톤이 밝아진 것 같아요. 다만 가격이 조금 비싸네요.', true, true, 8),
('rev_003', 'prod_nike_shoes', 'user_park', 3, '디자인은 좋은데...', '디자인은 마음에 들지만 생각보다 무겁네요. 오래 신으면 발이 좀 아파요.', false, true, 3)
ON CONFLICT (id) DO NOTHING;

-- Notifications (알림)
INSERT INTO notifications (id, user_id, type, title, message, read_at, metadata) VALUES
('notif_001', 'user_kim', 'ORDER_SHIPPED', '주문 배송 시작', '주문번호 ORD-20241223-001 상품이 배송 시작되었습니다.', '2024-12-23 14:00:00', '{"order_id": "ord_001"}'),
('notif_002', 'user_lee', 'PRODUCT_RESTOCKED', '재입고 알림', '관심상품 갤럭시 S24가 재입고 되었습니다.', NULL, '{"product_id": "prod_galaxy_s24"}'),
('notif_003', 'business_abc', 'INVOICE_GENERATED', '세금계산서 발행', '주문번호 ORD-20241223-003에 대한 세금계산서가 발행되었습니다.', NULL, '{"order_id": "ord_003"}'),
('notif_004', 'user_kim', 'COUPON_EXPIRING', '쿠폰 만료 알림', 'VIP 할인쿠폰이 7일 후 만료됩니다.', NULL, '{"days_left": 7}')
ON CONFLICT (id) DO NOTHING;

-- Create basic indexes for better performance if they don't exist
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type_status ON users(type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_featured ON products(category_id, featured) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id, approved) WHERE approved = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;