-- Seed Data for Korean Enterprise Commerce Platform
-- 한국형 엔터프라이즈 커머스 플랫폼 초기 데이터

-- Categories (카테고리)
INSERT INTO categories (id, name, slug, description, image_url, position, is_active) VALUES
('cat_fashion', '패션/의류', 'fashion', '패션 및 의류 상품 카테고리', '/images/categories/fashion.jpg', 1, true),
('cat_beauty', '뷰티/화장품', 'beauty', '뷰티 및 화장품 상품 카테고리', '/images/categories/beauty.jpg', 2, true),
('cat_electronics', '전자제품', 'electronics', '전자제품 및 IT 상품 카테고리', '/images/categories/electronics.jpg', 3, true),
('cat_home', '홈/인테리어', 'home', '홈 인테리어 및 생활용품 카테고리', '/images/categories/home.jpg', 4, true),
('cat_food', '식품/음료', 'food', '식품 및 음료 상품 카테고리', '/images/categories/food.jpg', 5, true),
('cat_sports', '스포츠/레저', 'sports', '스포츠 및 레저 용품 카테고리', '/images/categories/sports.jpg', 6, true),
('cat_books', '도서/문구', 'books', '도서 및 문구 상품 카테고리', '/images/categories/books.jpg', 7, true),
('cat_baby', '유아/출산', 'baby', '유아 및 출산 용품 카테고리', '/images/categories/baby.jpg', 8, true);

-- Tax Rules (세금 규칙)
INSERT INTO tax_rules (id, name, rate, description, is_active, country_code, tax_type) VALUES
('tax_vat_kr', '부가가치세', 10.00, '한국 표준 부가가치세 10%', true, 'KR', 'VAT'),
('tax_special_kr', '특별소비세', 20.00, '한국 특별소비세 (주류/담배)', true, 'KR', 'EXCISE'),
('tax_zero_kr', '영세율', 0.00, '수출품목 영세율 적용', true, 'KR', 'ZERO_RATE'),
('tax_exempt_kr', '면세', 0.00, '면세 대상 상품', true, 'KR', 'EXEMPT');

-- Admin Users (관리자 계정)
INSERT INTO users (id, email, password_hash, name, phone, user_type, email_verified, is_active) VALUES
('admin_master', 'admin@commerce.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '시스템 관리자', '02-1234-5678', 'ADMIN', true, true),
('admin_cs', 'cs@commerce.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '고객서비스 관리자', '02-1234-5679', 'ADMIN', true, true);

-- Sample Individual Users (개인 사용자)
INSERT INTO users (id, email, password_hash, name, phone, user_type, email_verified, is_active, birth_date, gender, marketing_consent) VALUES
('user_kim', 'kim.user@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '김고객', '010-1234-5678', 'INDIVIDUAL', true, true, '1985-05-15', 'MALE', true),
('user_lee', 'lee.user@naver.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '이고객', '010-2345-6789', 'INDIVIDUAL', true, true, '1990-08-22', 'FEMALE', false),
('user_park', 'park.user@daum.net', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '박고객', '010-3456-7890', 'INDIVIDUAL', false, true, '1988-12-03', 'MALE', true);

-- Sample Business Users (기업 사용자)
INSERT INTO users (id, email, password_hash, name, phone, user_type, email_verified, is_active) VALUES
('business_abc', 'ceo@abc-corp.co.kr', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '김사장', '02-9876-5432', 'BUSINESS', true, true),
('business_xyz', 'manager@xyz-company.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrdu6kDqRKiNrwlHnYNsqGfJvXGKWK', '이부장', '031-1111-2222', 'BUSINESS', true, true);

-- Business Accounts (기업 계정)
INSERT INTO business_accounts (id, user_id, company_name, business_number, tax_number, company_address, company_phone, ceo_name, business_type, account_status, credit_limit, payment_terms_days) VALUES
('biz_abc', 'business_abc', '(주)ABC코퍼레이션', '123-45-67890', 'T123-45-67890', '서울시 강남구 테헤란로 123', '02-9876-5432', '김사장', 'CORPORATION', 'ACTIVE', 100000000.00, 30),
('biz_xyz', 'business_xyz', 'XYZ컴퍼니', '987-65-43210', 'T987-65-43210', '경기도 성남시 분당구 판교로 456', '031-1111-2222', '이부장', 'CORPORATION', 'ACTIVE', 50000000.00, 15);

-- User Addresses (사용자 주소)
INSERT INTO user_addresses (id, user_id, name, recipient_name, phone, address, detail_address, postal_code, is_default, address_type) VALUES
('addr_kim_home', 'user_kim', '집', '김고객', '010-1234-5678', '서울시 마포구 홍대입구역로 123', '5층 502호', '04030', true, 'HOME'),
('addr_kim_work', 'user_kim', '회사', '김고객', '02-5555-6666', '서울시 중구 명동길 456', '빌딩 10층', '04560', false, 'WORK'),
('addr_lee_home', 'user_lee', '우리집', '이고객', '010-2345-6789', '부산시 해운대구 마린시티로 789', '101동 1505호', '48120', true, 'HOME'),
('addr_biz_abc', 'business_abc', '본사', '김사장', '02-9876-5432', '서울시 강남구 테헤란로 123', '12층', '06234', true, 'WORK');

-- Brands (브랜드)
INSERT INTO brands (id, name, name_en, slug, description, logo_url, website_url, country_code, is_premium, is_active) VALUES
('brand_samsung', '삼성', 'Samsung', 'samsung', '대한민국 대표 전자기업', '/brands/samsung.png', 'https://samsung.co.kr', 'KR', true, true),
('brand_lg', 'LG', 'LG', 'lg', 'Life is Good', '/brands/lg.png', 'https://lg.co.kr', 'KR', true, true),
('brand_amorepacific', '아모레퍼시픽', 'AmorePacific', 'amorepacific', '한국 대표 화장품 브랜드', '/brands/amorepacific.png', 'https://amorepacific.com', 'KR', true, true),
('brand_hankook', '한국타이어', 'Hankook Tire', 'hankook-tire', '한국 타이어 브랜드', '/brands/hankook.png', 'https://hankooktire.com', 'KR', false, true);

-- Products (상품)
INSERT INTO products (id, name, slug, description, short_description, category_id, brand_id, sku, price, compare_price, cost_price, tax_rule_id, weight, dimensions, min_order_quantity, max_order_quantity, stock_quantity, low_stock_threshold, track_inventory, requires_shipping, is_digital, is_featured, status) VALUES
('prod_galaxy_s24', '갤럭시 S24', 'galaxy-s24', 'Samsung Galaxy S24 최신 스마트폰. AI 기능이 강화된 플래그십 모델로 혁신적인 카메라와 성능을 자랑합니다.', '삼성 갤럭시 S24 AI 스마트폰', 'cat_electronics', 'brand_samsung', 'SAM-GS24-128-BK', 999000.00, 1200000.00, 750000.00, 'tax_vat_kr', 200.0, '70.6 x 146.3 x 7.6 mm', 1, 10, 50, 10, true, true, false, true, 'ACTIVE'),
('prod_lg_oled_tv', 'LG OLED 55인치 TV', 'lg-oled-55', 'LG OLED55C4PNA 55인치 4K 스마트 TV. webOS 탑재로 넷플릭스, 유튜브 등 다양한 OTT 서비스 이용 가능.', 'LG 55인치 OLED 4K TV', 'cat_electronics', 'brand_lg', 'LG-OLED55C4-KR', 1990000.00, 2500000.00, 1500000.00, 'tax_vat_kr', 18500.0, '122.8 x 70.6 x 4.6 cm', 1, 5, 15, 3, true, true, false, true, 'ACTIVE'),
('prod_sulwhasoo_serum', '설화수 윤조에센스', 'sulwhasoo-serum', '설화수 대표 에센스. 한방 원료로 만든 프리미엄 스킨케어 제품으로 깊은 보습과 영양을 제공합니다.', '설화수 윤조에센스 60ml', 'cat_beauty', 'brand_amorepacific', 'SWS-YJ-ESS-60ML', 89000.00, 110000.00, 45000.00, 'tax_vat_kr', 150.0, '4.5 x 4.5 x 13.2 cm', 1, 20, 100, 20, true, true, false, true, 'ACTIVE'),
('prod_nike_shoes', '나이키 에어맥스 270', 'nike-airmax-270', '나이키 에어맥스 270 운동화. 편안한 쿠셔닝과 스타일리시한 디자인으로 일상과 운동 모두 완벽한 신발.', '나이키 에어맥스 270 운동화', 'cat_sports', NULL, 'NIKE-AM270-BK-260', 159000.00, 189000.00, 95000.00, 'tax_vat_kr', 500.0, '30 x 20 x 12 cm', 1, 10, 75, 15, true, true, false, false, 'ACTIVE'),
('prod_dyson_vacuum', '다이슨 V15 무선청소기', 'dyson-v15', '다이슨 V15 디텍트 무선청소기. 레이저로 먼지를 찾아내는 혁신적인 청소기로 강력한 흡입력을 자랑합니다.', '다이슨 V15 레이저 무선청소기', 'cat_home', NULL, 'DYS-V15-DETECT-KR', 899000.00, 1100000.00, 650000.00, 'tax_vat_kr', 3200.0, '25.4 x 25.4 x 126.9 cm', 1, 5, 25, 5, true, true, false, true, 'ACTIVE');

-- Product Images (상품 이미지)
INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_primary) VALUES
('img_galaxy_1', 'prod_galaxy_s24', '/products/galaxy-s24/main.jpg', '갤럭시 S24 메인 이미지', 1, true),
('img_galaxy_2', 'prod_galaxy_s24', '/products/galaxy-s24/back.jpg', '갤럭시 S24 후면 이미지', 2, false),
('img_galaxy_3', 'prod_galaxy_s24', '/products/galaxy-s24/camera.jpg', '갤럭시 S24 카메라 상세', 3, false),
('img_lg_tv_1', 'prod_lg_oled_tv', '/products/lg-oled/main.jpg', 'LG OLED TV 메인', 1, true),
('img_lg_tv_2', 'prod_lg_oled_tv', '/products/lg-oled/side.jpg', 'LG OLED TV 측면', 2, false),
('img_sulwha_1', 'prod_sulwhasoo_serum', '/products/sulwhasoo/essence-main.jpg', '설화수 윤조에센스', 1, true),
('img_nike_1', 'prod_nike_shoes', '/products/nike/airmax-main.jpg', '나이키 에어맥스 270', 1, true),
('img_dyson_1', 'prod_dyson_vacuum', '/products/dyson/v15-main.jpg', '다이슨 V15 청소기', 1, true);

-- Product Variants (상품 옵션)
INSERT INTO product_variants (id, product_id, name, sku, price, compare_price, cost_price, stock_quantity, weight, dimensions, is_active) VALUES
('var_galaxy_128_black', 'prod_galaxy_s24', '128GB 팬텀 블랙', 'SAM-GS24-128-BK', 999000.00, 1200000.00, 750000.00, 50, 200.0, '70.6 x 146.3 x 7.6 mm', true),
('var_galaxy_256_black', 'prod_galaxy_s24', '256GB 팬텀 블랙', 'SAM-GS24-256-BK', 1199000.00, 1400000.00, 850000.00, 30, 200.0, '70.6 x 146.3 x 7.6 mm', true),
('var_galaxy_128_violet', 'prod_galaxy_s24', '128GB 코발트 바이올렛', 'SAM-GS24-128-VT', 999000.00, 1200000.00, 750000.00, 25, 200.0, '70.6 x 146.3 x 7.6 mm', true),
('var_nike_260', 'prod_nike_shoes', '260mm', 'NIKE-AM270-BK-260', 159000.00, 189000.00, 95000.00, 20, 500.0, '30 x 20 x 12 cm', true),
('var_nike_270', 'prod_nike_shoes', '270mm', 'NIKE-AM270-BK-270', 159000.00, 189000.00, 95000.00, 15, 500.0, '30 x 20 x 12 cm', true),
('var_nike_280', 'prod_nike_shoes', '280mm', 'NIKE-AM270-BK-280', 159000.00, 189000.00, 95000.00, 18, 500.0, '30 x 20 x 12 cm', true);

-- Option Groups (옵션 그룹)
INSERT INTO option_groups (id, name, display_type, is_required, sort_order) VALUES
('opt_storage', '저장용량', 'DROPDOWN', true, 1),
('opt_color', '색상', 'SWATCH', true, 2),
('opt_size', '사이즈', 'DROPDOWN', true, 3);

-- Option Values (옵션 값)
INSERT INTO option_values (id, option_group_id, value, display_name, color_hex, image_url, sort_order) VALUES
('val_128gb', 'opt_storage', '128GB', '128GB', NULL, NULL, 1),
('val_256gb', 'opt_storage', '256GB', '256GB', NULL, NULL, 2),
('val_512gb', 'opt_storage', '512GB', '512GB', NULL, NULL, 3),
('val_black', 'opt_color', 'BLACK', '블랙', '#000000', NULL, 1),
('val_white', 'opt_color', 'WHITE', '화이트', '#FFFFFF', NULL, 2),
('val_violet', 'opt_color', 'VIOLET', '바이올렛', '#8B5CF6', NULL, 3),
('val_size_260', 'opt_size', '260', '260mm', NULL, NULL, 1),
('val_size_270', 'opt_size', '270', '270mm', NULL, NULL, 2),
('val_size_280', 'opt_size', '280', '280mm', NULL, NULL, 3);

-- Variant Option Values (상품 옵션 조합)
INSERT INTO variant_option_values (variant_id, option_value_id) VALUES
('var_galaxy_128_black', 'val_128gb'),
('var_galaxy_128_black', 'val_black'),
('var_galaxy_256_black', 'val_256gb'),
('var_galaxy_256_black', 'val_black'),
('var_galaxy_128_violet', 'val_128gb'),
('var_galaxy_128_violet', 'val_violet'),
('var_nike_260', 'val_size_260'),
('var_nike_270', 'val_size_270'),
('var_nike_280', 'val_size_280');

-- Shipping Zones (배송 지역)
INSERT INTO shipping_zones (id, name, description, countries, states, postal_codes, is_active) VALUES
('zone_seoul', '서울특별시', '서울특별시 전 지역', '["KR"]', '["서울특별시"]', '["0*"]', true),
('zone_gyeonggi', '경기도', '경기도 전 지역', '["KR"]', '["경기도"]', '["1*", "4*"]', true),
('zone_busan', '부산광역시', '부산광역시 전 지역', '["KR"]', '["부산광역시"]', '["4*"]', true),
('zone_others', '기타 지역', '그 외 전국 지역', '["KR"]', '[]', '[]', true);

-- Shipping Methods (배송 방법)
INSERT INTO shipping_methods (id, name, description, shipping_zone_id, price, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active) VALUES
('ship_seoul_std', '서울 표준배송', '서울 지역 표준 배송 (1-2일)', 'zone_seoul', 3000.00, 50000.00, 1, 2, true),
('ship_seoul_fast', '서울 당일배송', '서울 지역 당일 배송 (오후 2시 이전 주문)', 'zone_seoul', 8000.00, 100000.00, 0, 1, true),
('ship_gyeonggi_std', '경기 표준배송', '경기도 표준 배송 (1-3일)', 'zone_gyeonggi', 3500.00, 50000.00, 1, 3, true),
('ship_busan_std', '부산 표준배송', '부산 지역 표준 배송 (2-3일)', 'zone_busan', 4000.00, 50000.00, 2, 3, true),
('ship_others_std', '전국 표준배송', '전국 표준 배송 (2-4일)', 'zone_others', 4500.00, 50000.00, 2, 4, true);

-- Sample Orders (주문 샘플)
INSERT INTO orders (id, user_id, business_account_id, order_number, status, payment_status, total_amount, subtotal_amount, tax_amount, shipping_amount, discount_amount, currency, notes, shipping_method_id) VALUES
('ord_001', 'user_kim', NULL, 'ORD-20241223-001', 'DELIVERED', 'PAID', 1008000.00, 999000.00, 99900.00, 3000.00, 0.00, 'KRW', '첫 번째 주문', 'ship_seoul_std'),
('ord_002', 'user_lee', NULL, 'ORD-20241223-002', 'PROCESSING', 'PAID', 95500.00, 89000.00, 8900.00, 3500.00, 0.00, 'KRW', '뷰티 제품 주문', 'ship_gyeonggi_std'),
('ord_003', 'business_abc', 'biz_abc', 'ORD-20241223-003', 'PENDING', 'PENDING', 1998000.00, 1980000.00, 198000.00, 0.00, 0.00, 'KRW', '기업 대량 주문', NULL),
('ord_004', 'user_park', NULL, 'ORD-20241223-004', 'CANCELLED', 'REFUNDED', 167000.00, 159000.00, 15900.00, 4500.00, 12400.00, 'KRW', '취소된 주문', 'ship_others_std');

-- Order Items (주문 상품)
INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, total_price, product_name, variant_name) VALUES
('oi_001_1', 'ord_001', 'prod_galaxy_s24', 'var_galaxy_128_black', 1, 999000.00, 999000.00, '갤럭시 S24', '128GB 팬텀 블랙'),
('oi_002_1', 'ord_002', 'prod_sulwhasoo_serum', NULL, 1, 89000.00, 89000.00, '설화수 윤조에센스', NULL),
('oi_003_1', 'ord_003', 'prod_lg_oled_tv', NULL, 1, 1990000.00, 1990000.00, 'LG OLED 55인치 TV', NULL),
('oi_004_1', 'ord_004', 'prod_nike_shoes', 'var_nike_270', 1, 159000.00, 159000.00, '나이키 에어맥스 270', '270mm');

-- Order Addresses (주문 주소)
INSERT INTO order_addresses (id, order_id, type, recipient_name, phone, address, detail_address, postal_code, delivery_notes) VALUES
('oa_001_ship', 'ord_001', 'SHIPPING', '김고객', '010-1234-5678', '서울시 마포구 홍대입구역로 123', '5층 502호', '04030', '경비실에 보관'),
('oa_001_bill', 'ord_001', 'BILLING', '김고객', '010-1234-5678', '서울시 마포구 홍대입구역로 123', '5층 502호', '04030', NULL),
('oa_002_ship', 'ord_002', 'SHIPPING', '이고객', '010-2345-6789', '부산시 해운대구 마린시티로 789', '101동 1505호', '48120', '부재시 문 앞'),
('oa_002_bill', 'ord_002', 'BILLING', '이고객', '010-2345-6789', '부산시 해운대구 마린시티로 789', '101동 1505호', '48120', NULL),
('oa_003_ship', 'ord_003', 'SHIPPING', '김사장', '02-9876-5432', '서울시 강남구 테헤란로 123', '12층 물류팀', '06234', '근무시간 내 배송'),
('oa_003_bill', 'ord_003', 'BILLING', '(주)ABC코퍼레이션', '02-9876-5432', '서울시 강남구 테헤란로 123', '12층', '06234', NULL);

-- Payments (결제)
INSERT INTO payments (id, order_id, payment_method, status, amount, currency, gateway, transaction_id, processed_at) VALUES
('pay_001', 'ord_001', 'CREDIT_CARD', 'COMPLETED', 1008000.00, 'KRW', 'TOSSPAY', 'toss_20241223_001', '2024-12-23 10:30:00+09:00'),
('pay_002', 'ord_002', 'BANK_TRANSFER', 'COMPLETED', 95500.00, 'KRW', 'BANK', 'bank_20241223_001', '2024-12-23 11:15:00+09:00'),
('pay_003', 'ord_003', 'CORPORATE_ACCOUNT', 'PENDING', 1998000.00, 'KRW', 'CORPORATE', 'corp_20241223_001', NULL),
('pay_004', 'ord_004', 'CREDIT_CARD', 'REFUNDED', 167000.00, 'KRW', 'TOSSPAY', 'toss_20241223_002', '2024-12-23 09:45:00+09:00');

-- Carts (장바구니)
INSERT INTO carts (id, user_id, session_id) VALUES
('cart_kim', 'user_kim', NULL),
('cart_lee', 'user_lee', NULL),
('cart_sess_123', NULL, 'sess_anonymous_123');

-- Cart Items (장바구니 상품)
INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity) VALUES
('ci_kim_1', 'cart_kim', 'prod_dyson_vacuum', NULL, 1),
('ci_lee_1', 'cart_lee', 'prod_nike_shoes', 'var_nike_260', 1),
('ci_sess_1', 'cart_sess_123', 'prod_galaxy_s24', 'var_galaxy_256_black', 1);

-- Coupons (쿠폰)
INSERT INTO coupons (id, name, code, description, discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, used_count, start_date, end_date, is_active) VALUES
('coup_welcome', '신규가입 할인쿠폰', 'WELCOME2024', '신규 가입 고객 10% 할인', 'PERCENTAGE', 10.00, 50000.00, 100000.00, 1000, 45, '2024-01-01 00:00:00+09:00', '2024-12-31 23:59:59+09:00', true),
('coup_vip', 'VIP 고객 할인쿠폰', 'VIP50K', 'VIP 고객 5만원 할인', 'FIXED', 50000.00, 200000.00, 50000.00, 100, 12, '2024-01-01 00:00:00+09:00', '2024-12-31 23:59:59+09:00', true),
('coup_christmas', '크리스마스 특가', 'XMAS2024', '크리스마스 시즌 15% 할인', 'PERCENTAGE', 15.00, 100000.00, 200000.00, 500, 89, '2024-12-01 00:00:00+09:00', '2024-12-31 23:59:59+09:00', true);

-- Reviews (리뷰)
INSERT INTO reviews (id, product_id, user_id, order_item_id, rating, title, content, is_verified_purchase, is_approved, helpful_count) VALUES
('rev_001', 'prod_galaxy_s24', 'user_kim', 'oi_001_1', 5, '정말 만족스러운 폰', '카메라 성능이 정말 좋고 배터리도 오래갑니다. AI 기능도 유용해요. 강력 추천!', true, true, 12),
('rev_002', 'prod_sulwhasoo_serum', 'user_lee', 'oi_002_1', 4, '피부가 촉촉해져요', '사용한지 2주 정도 됐는데 확실히 피부 톤이 밝아진 것 같아요. 다만 가격이 조금 비싸네요.', true, true, 8),
('rev_003', 'prod_nike_shoes', 'user_park', NULL, 3, '디자인은 좋은데...', '디자인은 마음에 들지만 생각보다 무겁네요. 오래 신으면 발이 좀 아파요.', false, true, 3);

-- Wishlist (위시리스트)
INSERT INTO wishlists (id, user_id, product_id) VALUES
('wish_kim_1', 'user_kim', 'prod_dyson_vacuum'),
('wish_kim_2', 'user_kim', 'prod_lg_oled_tv'),
('wish_lee_1', 'user_lee', 'prod_galaxy_s24'),
('wish_park_1', 'user_park', 'prod_sulwhasoo_serum');

-- Notifications (알림)
INSERT INTO notifications (id, user_id, type, title, message, is_read, action_url) VALUES
('notif_001', 'user_kim', 'ORDER_SHIPPED', '주문 배송 시작', '주문번호 ORD-20241223-001 상품이 배송 시작되었습니다.', true, '/orders/ord_001'),
('notif_002', 'user_lee', 'PRODUCT_BACK_IN_STOCK', '재입고 알림', '관심상품 갤럭시 S24가 재입고 되었습니다.', false, '/products/galaxy-s24'),
('notif_003', 'business_abc', 'INVOICE_GENERATED', '세금계산서 발행', '주문번호 ORD-20241223-003에 대한 세금계산서가 발행되었습니다.', false, '/business/invoices'),
('notif_004', 'user_kim', 'COUPON_EXPIRING', '쿠폰 만료 알림', 'VIP 할인쿠폰이 7일 후 만료됩니다.', false, '/coupons');

-- Site Settings (사이트 설정)
INSERT INTO site_settings (key, value, description, is_public) VALUES
('site_name', '코머스플랫폼', '사이트명', true),
('site_description', '한국형 엔터프라이즈 커머스 플랫폼', '사이트 설명', true),
('site_keywords', '커머스,쇼핑몰,이커머스,B2B,B2C', 'SEO 키워드', true),
('company_name', '(주)커머스코리아', '회사명', true),
('company_address', '서울시 강남구 테헤란로 123', '회사 주소', true),
('company_phone', '02-1234-5678', '회사 전화번호', true),
('company_email', 'info@commerce.co.kr', '회사 이메일', true),
('business_number', '123-45-67890', '사업자등록번호', false),
('default_currency', 'KRW', '기본 통화', false),
('default_tax_rate', '10', '기본 세율 (%)', false),
('min_order_amount', '10000', '최소 주문 금액', false),
('free_shipping_threshold', '50000', '무료배송 최소금액', true),
('max_upload_size', '10485760', '최대 업로드 크기 (bytes)', false),
('allowed_file_types', 'jpg,jpeg,png,gif,pdf', '허용 파일 확장자', false),
('maintenance_mode', 'false', '유지보수 모드', false);

-- Activity Logs (활동 로그)
INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES
('log_001', 'user_kim', 'CREATE_ORDER', 'ORDER', 'ord_001', '{"order_number": "ORD-20241223-001", "amount": 1008000}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('log_002', 'user_lee', 'ADD_TO_CART', 'PRODUCT', 'prod_nike_shoes', '{"variant": "var_nike_260", "quantity": 1}', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'),
('log_003', 'admin_master', 'UPDATE_PRODUCT', 'PRODUCT', 'prod_galaxy_s24', '{"field": "price", "old_value": 990000, "new_value": 999000}', '192.168.1.200', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('log_004', 'business_abc', 'CREATE_ORDER', 'ORDER', 'ord_003', '{"order_number": "ORD-20241223-003", "amount": 1998000, "type": "business"}', '192.168.1.150', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Update sequences for all tables with ID columns
SELECT setval('categories_id_seq', 1000);
SELECT setval('tax_rules_id_seq', 1000);
SELECT setval('users_id_seq', 1000);
SELECT setval('business_accounts_id_seq', 1000);
SELECT setval('user_addresses_id_seq', 1000);
SELECT setval('brands_id_seq', 1000);
SELECT setval('products_id_seq', 1000);
SELECT setval('product_images_id_seq', 1000);
SELECT setval('product_variants_id_seq', 1000);
SELECT setval('option_groups_id_seq', 1000);
SELECT setval('option_values_id_seq', 1000);
SELECT setval('shipping_zones_id_seq', 1000);
SELECT setval('shipping_methods_id_seq', 1000);
SELECT setval('orders_id_seq', 1000);
SELECT setval('order_items_id_seq', 1000);
SELECT setval('order_addresses_id_seq', 1000);
SELECT setval('payments_id_seq', 1000);
SELECT setval('carts_id_seq', 1000);
SELECT setval('cart_items_id_seq', 1000);
SELECT setval('coupons_id_seq', 1000);
SELECT setval('reviews_id_seq', 1000);
SELECT setval('wishlists_id_seq', 1000);
SELECT setval('notifications_id_seq', 1000);
SELECT setval('site_settings_id_seq', 1000);
SELECT setval('activity_logs_id_seq', 1000);

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_status ON products(category_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id) WHERE is_approved = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);

COMMIT;