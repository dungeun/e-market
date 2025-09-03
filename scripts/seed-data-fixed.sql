-- 카테고리 데이터
INSERT INTO categories (name, slug, description) VALUES
('전자제품', 'electronics', '최신 전자제품'),
('패션', 'fashion', '트렌디한 패션 아이템'),
('식품', 'food', '신선한 식품'),
('뷰티', 'beauty', '뷰티 제품'),
('스포츠', 'sports', '스포츠 용품')
ON CONFLICT (slug) DO NOTHING;

-- 상품 데이터
INSERT INTO products (name, slug, description, price, category, stock, image) VALUES
('MacBook Pro 14인치', 'macbook-pro-14', 'M3 Pro 칩셋 탑재 최신 맥북', 2990000, '전자제품', 10, 'https://picsum.photos/id/1/800/600'),
('iPhone 15 Pro', 'iphone-15-pro', '티타늄 디자인의 프로 모델', 1550000, '전자제품', 25, 'https://picsum.photos/id/2/800/600'),
('AirPods Pro 2', 'airpods-pro-2', '액티브 노이즈 캔슬링 이어폰', 359000, '전자제품', 50, 'https://picsum.photos/id/3/800/600'),
('나이키 에어맥스', 'nike-airmax', '편안한 쿠셔닝의 운동화', 139000, '패션', 30, 'https://picsum.photos/id/4/800/600'),
('아디다스 트레이닝 세트', 'adidas-training-set', '운동용 상하의 세트', 89000, '패션', 20, 'https://picsum.photos/id/5/800/600'),
('유기농 샐러드 세트', 'organic-salad-set', '신선한 유기농 채소 믹스', 12900, '식품', 100, 'https://picsum.photos/id/6/800/600'),
('프리미엄 한우 세트', 'premium-hanwoo-set', '1++ 등급 한우 선물세트', 250000, '식품', 5, 'https://picsum.photos/id/7/800/600'),
('설화수 에센셜 세트', 'sulwhasoo-essential-set', '한방 스킨케어 세트', 180000, '뷰티', 15, 'https://picsum.photos/id/8/800/600'),
('요가 매트 프리미엄', 'yoga-mat-premium', '미끄럼 방지 요가매트', 45000, '스포츠', 40, 'https://picsum.photos/id/9/800/600'),
('덤벨 세트 20kg', 'dumbbell-set-20kg', '홈트레이닝용 덤벨', 89000, '스포츠', 12, 'https://picsum.photos/id/10/800/600')
ON CONFLICT (slug) DO NOTHING;

-- 테스트 사용자 데이터 (비밀번호: 'test123')
INSERT INTO users (email, name, password, role) VALUES
('admin@test.com', '관리자', '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxkAla', 'admin'),
('user@test.com', '일반사용자', '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gOMxkAla', 'user')
ON CONFLICT (email) DO NOTHING;