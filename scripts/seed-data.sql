-- 카테고리 데이터
INSERT INTO categories (id, name, slug, description) VALUES
('cat_electronics', '전자제품', 'electronics', '최신 전자제품'),
('cat_fashion', '패션', 'fashion', '트렌디한 패션 아이템'),
('cat_food', '식품', 'food', '신선한 식품'),
('cat_beauty', '뷰티', 'beauty', '뷰티 제품'),
('cat_sports', '스포츠', 'sports', '스포츠 용품')
ON CONFLICT (id) DO NOTHING;

-- 상품 데이터
INSERT INTO products (id, name, slug, description, price, original_price, stock, category_id, status, featured, new, rating, review_count) VALUES
('prod_001', 'MacBook Pro 14인치', 'macbook-pro-14', 'M3 Pro 칩셋 탑재 최신 맥북', 2990000, 3290000, 10, 'cat_electronics', '판매중', true, true, 4.8, 152),
('prod_002', 'iPhone 15 Pro', 'iphone-15-pro', '티타늄 디자인의 프로 모델', 1550000, 1650000, 25, 'cat_electronics', '판매중', true, true, 4.9, 523),
('prod_003', 'AirPods Pro 2', 'airpods-pro-2', '액티브 노이즈 캔슬링 이어폰', 359000, 379000, 50, 'cat_electronics', '판매중', false, true, 4.7, 289),
('prod_004', '나이키 에어맥스', 'nike-airmax', '편안한 쿠셔닝의 운동화', 139000, 159000, 30, 'cat_fashion', '판매중', true, false, 4.5, 167),
('prod_005', '아디다스 트레이닝 세트', 'adidas-training-set', '운동용 상하의 세트', 89000, 109000, 20, 'cat_fashion', '판매중', false, true, 4.3, 89),
('prod_006', '유기농 샐러드 세트', 'organic-salad-set', '신선한 유기농 채소 믹스', 12900, NULL, 100, 'cat_food', '판매중', false, false, 4.6, 45),
('prod_007', '프리미엄 한우 세트', 'premium-hanwoo-set', '1++ 등급 한우 선물세트', 250000, 280000, 5, 'cat_food', '판매중', true, false, 4.9, 78),
('prod_008', '설화수 에센셜 세트', 'sulwhasoo-essential-set', '한방 스킨케어 세트', 180000, 220000, 15, 'cat_beauty', '판매중', true, true, 4.8, 234),
('prod_009', '요가 매트 프리미엄', 'yoga-mat-premium', '미끄럼 방지 요가매트', 45000, 55000, 40, 'cat_sports', '판매중', false, true, 4.4, 123),
('prod_010', '덤벨 세트 20kg', 'dumbbell-set-20kg', '홈트레이닝용 덤벨', 89000, NULL, 12, 'cat_sports', '판매중', true, false, 4.6, 67)
ON CONFLICT (id) DO NOTHING;

-- 상품 이미지 데이터
INSERT INTO product_images (id, product_id, url, alt, is_primary, order_index) VALUES
('img_001', 'prod_001', 'https://picsum.photos/id/1/800/600', 'MacBook Pro 14인치', true, 0),
('img_002', 'prod_002', 'https://picsum.photos/id/2/800/600', 'iPhone 15 Pro', true, 0),
('img_003', 'prod_003', 'https://picsum.photos/id/3/800/600', 'AirPods Pro 2', true, 0),
('img_004', 'prod_004', 'https://picsum.photos/id/4/800/600', '나이키 에어맥스', true, 0),
('img_005', 'prod_005', 'https://picsum.photos/id/5/800/600', '아디다스 트레이닝 세트', true, 0),
('img_006', 'prod_006', 'https://picsum.photos/id/6/800/600', '유기농 샐러드 세트', true, 0),
('img_007', 'prod_007', 'https://picsum.photos/id/7/800/600', '프리미엄 한우 세트', true, 0),
('img_008', 'prod_008', 'https://picsum.photos/id/8/800/600', '설화수 에센셜 세트', true, 0),
('img_009', 'prod_009', 'https://picsum.photos/id/9/800/600', '요가 매트 프리미엄', true, 0),
('img_010', 'prod_010', 'https://picsum.photos/id/10/800/600', '덤벨 세트 20kg', true, 0)
ON CONFLICT (id) DO NOTHING;

-- 테스트 사용자 데이터
INSERT INTO users (id, email, name, password, role) VALUES
('user_001', 'admin@test.com', '관리자', '$2a$10$YourHashedPasswordHere', 'admin'),
('user_002', 'user@test.com', '일반사용자', '$2a$10$YourHashedPasswordHere', 'user')
ON CONFLICT (id) DO NOTHING;