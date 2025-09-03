-- 샘플 데이터 삽입
-- 중고 상품 커머스용 테스트 데이터

-- 카테고리 데이터
INSERT INTO categories (id, name, slug, parent_id, level, description, icon, color, menu_order) VALUES 
('CAT-001', '전자제품', 'electronics', NULL, 1, '스마트폰, 노트북, 태블릿, 이어폰, 충전기 등', '📱', '#0ea5e9', 1),
('CAT-002', '전자기기', 'appliances', NULL, 1, 'TV, 냉장고, 세탁기, 에어컨, 전자레인지, 청소기 등', '🏠', '#10b981', 2),
('CAT-003', '가구', 'furniture', NULL, 1, '침대, 매트리스, 책상, 의자, 옷장, 이불, 생활용품 등', '🪑', '#f59e0b', 3),

-- 전자제품 하위 카테고리
('CAT-001-1', '스마트폰', 'smartphones', 'CAT-001', 2, '아이폰, 갤럭시, 기타 스마트폰', NULL, NULL, 1),
('CAT-001-2', '노트북', 'laptops', 'CAT-001', 2, '맥북, 그램, 기타 노트북', NULL, NULL, 2),
('CAT-001-3', '태블릿', 'tablets', 'CAT-001', 2, '아이패드, 갤럭시탭, 기타 태블릿', NULL, NULL, 3),
('CAT-001-4', '이어폰/헤드폰', 'earphones', 'CAT-001', 2, '에어팟, 무선이어폰, 헤드폰', NULL, NULL, 4),

-- 전자기기 하위 카테고리  
('CAT-002-1', 'TV/모니터', 'tv-monitors', 'CAT-002', 2, 'TV, 모니터, 디스플레이', NULL, NULL, 1),
('CAT-002-2', '냉장고', 'refrigerators', 'CAT-002', 2, '냉장고, 김치냉장고', NULL, NULL, 2),
('CAT-002-3', '세탁기', 'washers', 'CAT-002', 2, '세탁기, 건조기', NULL, NULL, 3),

-- 가구 하위 카테고리
('CAT-003-1', '침대/매트리스', 'beds', 'CAT-003', 2, '침대, 매트리스, 침구', NULL, NULL, 1),
('CAT-003-2', '책상/의자', 'desks-chairs', 'CAT-003', 2, '책상, 의자, 사무용품', NULL, NULL, 2),
('CAT-003-3', '옷장/수납장', 'wardrobes', 'CAT-003', 2, '옷장, 수납장, 서랍장', NULL, NULL, 3);

-- 상품 데이터
INSERT INTO products (id, name, slug, sku, description, short_description, price, compare_price, category_id, quantity, is_featured, status) VALUES 
('prod-1', 'iPhone 14 Pro 128GB (A급)', 'iphone-14-pro-128gb-grade-a', 'IPH14PRO128A', '상태 양호한 iPhone 14 Pro입니다. 액정 파손 없고 배터리 효율 95% 이상입니다. 정품 케이스와 충전기 포함.', '상태 양호한 iPhone 14 Pro, 배터리 95%+', 950000.00, 1200000.00, 'CAT-001-1', 1, true, 'ACTIVE'),
('prod-2', '삼성 갤럭시 S24 Ultra (새제품)', 'samsung-galaxy-s24-ultra-new', 'SAMS24ULTRANEW', '미개봉 새제품 갤럭시 S24 Ultra입니다. 정품 보증서 포함, 256GB 모델입니다.', '미개봉 새제품 갤럭시 S24 Ultra 256GB', 1100000.00, 1400000.00, 'CAT-001-1', 1, true, 'ACTIVE'),
('prod-3', 'LG 그램 17인치 노트북 (A급)', 'lg-gram-17inch-grade-a', 'LGGRAM17A', '가볍고 성능 좋은 LG 그램 17인치입니다. 사용감 적고 배터리 상태 양호합니다. i5 프로세서, 8GB RAM, 512GB SSD.', '가볍고 성능 좋은 LG 그램 17인치', 800000.00, 1200000.00, 'CAT-001-2', 1, false, 'ACTIVE'),
('prod-4', '에어팟 프로 2세대 (B급)', 'airpods-pro-2nd-gen-grade-b', 'AIRPODPRO2B', '애플 에어팟 프로 2세대입니다. 약간의 사용감 있지만 기능은 정상 작동합니다.', '애플 에어팟 프로 2세대, 기능 정상', 180000.00, 359000.00, 'CAT-001-4', 2, false, 'ACTIVE'),
('prod-5', 'LG 55인치 4K TV (A급)', 'lg-55inch-4k-tv-grade-a', 'LG55TV4KA', 'LG 55인치 4K 스마트 TV입니다. 화질 선명하고 상태 양호합니다.', 'LG 55인치 4K 스마트 TV', 650000.00, 1200000.00, 'CAT-002-1', 1, false, 'ACTIVE'),
('prod-6', '삼성 냉장고 4도어 (B급)', 'samsung-refrigerator-4door-grade-b', 'SAMREF4DB', '삼성 4도어 냉장고입니다. 약간의 외관 스크래치가 있지만 성능은 우수합니다.', '삼성 4도어 냉장고, 성능 우수', 450000.00, 800000.00, 'CAT-002-2', 1, false, 'ACTIVE'),
('prod-7', '이케아 책상+의자 세트 (A급)', 'ikea-desk-chair-set-grade-a', 'IKEADESKCHA', '이케아 원목 책상과 의자 세트입니다. 상태 매우 좋고 조립 설명서 포함.', '이케아 원목 책상+의자 세트', 120000.00, 200000.00, 'CAT-003-2', 1, false, 'ACTIVE'),
('prod-8', '퀸 침대 매트리스 (A급)', 'queen-mattress-grade-a', 'QUEENMATQA', '퀸 사이즈 메모리폼 매트리스입니다. 사용기간 1년 미만, 매우 깨끗한 상태.', '퀸 메모리폼 매트리스, 거의 새것', 250000.00, 500000.00, 'CAT-003-1', 1, false, 'ACTIVE');

-- 상품 속성 (중고 상품 특화)
INSERT INTO product_attributes (id, product_id, name, value) VALUES 
('attr-1', 'prod-1', 'condition', 'A'),
('attr-2', 'prod-1', 'brand', 'Apple'),
('attr-3', 'prod-1', 'location', '서울 강남구'),
('attr-4', 'prod-2', 'condition', 'S'),
('attr-5', 'prod-2', 'brand', 'Samsung'),
('attr-6', 'prod-2', 'location', '서울 송파구'),
('attr-7', 'prod-3', 'condition', 'A'),
('attr-8', 'prod-3', 'brand', 'LG'),
('attr-9', 'prod-3', 'location', '인천 남동구'),
('attr-10', 'prod-4', 'condition', 'B'),
('attr-11', 'prod-4', 'brand', 'Apple'),
('attr-12', 'prod-4', 'location', '부산 해운대구'),
('attr-13', 'prod-5', 'condition', 'A'),
('attr-14', 'prod-5', 'brand', 'LG'),
('attr-15', 'prod-5', 'location', '대구 수성구'),
('attr-16', 'prod-6', 'condition', 'B'),
('attr-17', 'prod-6', 'brand', 'Samsung'),
('attr-18', 'prod-6', 'location', '서울 마포구'),
('attr-19', 'prod-7', 'condition', 'A'),
('attr-20', 'prod-7', 'brand', 'IKEA'),
('attr-21', 'prod-7', 'location', '경기 성남시'),
('attr-22', 'prod-8', 'condition', 'A'),
('attr-23', 'prod-8', 'brand', '시몬스'),
('attr-24', 'prod-8', 'location', '서울 강서구');

-- 상품 이미지
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_main) VALUES 
('img-1', 'prod-1', '/api/placeholder/400/400', 'iPhone 14 Pro 메인 이미지', 0, true),
('img-2', 'prod-2', '/api/placeholder/400/400', '갤럭시 S24 Ultra 메인 이미지', 0, true),
('img-3', 'prod-3', '/api/placeholder/400/400', 'LG 그램 17인치 메인 이미지', 0, true),
('img-4', 'prod-4', '/api/placeholder/400/400', '에어팟 프로 2세대 메인 이미지', 0, true),
('img-5', 'prod-5', '/api/placeholder/400/400', 'LG 55인치 4K TV 메인 이미지', 0, true),
('img-6', 'prod-6', '/api/placeholder/400/400', '삼성 냉장고 4도어 메인 이미지', 0, true),
('img-7', 'prod-7', '/api/placeholder/400/400', '이케아 책상+의자 세트 메인 이미지', 0, true),
('img-8', 'prod-8', '/api/placeholder/400/400', '퀸 침대 매트리스 메인 이미지', 0, true);

-- 리뷰 데이터
INSERT INTO reviews (id, product_id, user_name, user_email, rating, title, comment, is_approved) VALUES 
('rev-1', 'prod-1', '김철수', 'kim@example.com', 5, '정말 상태 좋아요!', '설명 그대로 배터리도 좋고 외관도 깨끗해요. 만족합니다.', true),
('rev-2', 'prod-1', '박영희', 'park@example.com', 4, '가성비 좋음', '중고치고는 상태가 정말 좋네요. 추천합니다.', true),
('rev-3', 'prod-2', '이민수', 'lee@example.com', 5, '새제품 맞네요', '정말 미개봉 새제품이었습니다. 포장도 완벽했어요.', true),
('rev-4', 'prod-3', '최지영', 'choi@example.com', 4, '성능 좋아요', '가볍고 성능도 좋습니다. 배터리 지속시간도 만족.', true);
