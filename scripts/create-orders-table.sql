-- orders 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(200),
  customer_phone VARCHAR(20),
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  tracking_number VARCHAR(100),
  courier VARCHAR(50),
  delivery_note TEXT,
  estimated_time VARCHAR(50),
  actual_delivery_time TIMESTAMP,
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- order_items 테이블 생성
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 주문 데이터 추가
INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, payment_status, payment_method, tracking_number, courier, delivery_note)
VALUES 
  ('ORD-20250109-001', '김철수', 'kim@example.com', '010-1234-5678', '서울특별시 강남구 테헤란로 123', 89000, 'pending', 'paid', 'card', NULL, NULL, '문 앞에 놓아주세요'),
  ('ORD-20250109-002', '이영희', 'lee@example.com', '010-2345-6789', '서울특별시 서초구 강남대로 456', 156000, 'processing', 'paid', 'card', NULL, NULL, '경비실에 맡겨주세요'),
  ('ORD-20250109-003', '박민수', 'park@example.com', '010-3456-7890', '경기도 성남시 분당구 판교로 789', 234000, 'shipped', 'paid', 'bank', '1234567890', 'CJ대한통운', '부재시 연락 부탁드립니다'),
  ('ORD-20250109-004', '최지현', 'choi@example.com', '010-4567-8901', '서울특별시 송파구 올림픽로 111', 67000, 'delivered', 'paid', 'card', '9876543210', '한진택배', NULL),
  ('ORD-20250109-005', '정수진', 'jung@example.com', '010-5678-9012', '인천광역시 연수구 송도대로 222', 198000, 'shipped', 'paid', 'card', '5555666677', '로젠택배', '오전 배송 부탁드립니다'),
  ('ORD-20250109-006', '강민호', 'kang@example.com', '010-6789-0123', '경기도 용인시 수지구 풍덕천로 333', 445000, 'processing', 'paid', 'bank', NULL, NULL, '주말 배송 가능합니다'),
  ('ORD-20250109-007', '한서연', 'han@example.com', '010-7890-1234', '서울특별시 마포구 월드컵로 444', 78000, 'pending', 'pending', 'card', NULL, NULL, NULL),
  ('ORD-20250109-008', '윤태영', 'yoon@example.com', '010-8901-2345', '서울특별시 중구 명동길 555', 312000, 'delivered', 'paid', 'card', '1111222233', '우체국택배', '1층 매장입니다'),
  ('ORD-20250109-009', '임하늘', 'lim@example.com', '010-9012-3456', '부산광역시 해운대구 해운대로 666', 567000, 'shipped', 'paid', 'bank', '4444555566', '롯데택배', '저녁 6시 이후 배송'),
  ('ORD-20250109-010', '조은별', 'jo@example.com', '010-0123-4567', '대구광역시 중구 동성로 777', 123000, 'cancelled', 'refunded', 'card', NULL, NULL, '주문 취소됨');

-- 각 주문에 대한 상품 항목 추가
INSERT INTO order_items (order_id, product_name, price, quantity)
SELECT 
  o.id,
  CASE 
    WHEN o.id % 3 = 0 THEN '노트북'
    WHEN o.id % 3 = 1 THEN '무선 이어폰'
    ELSE '스마트워치'
  END,
  o.total_amount / 2,
  1
FROM orders o;

INSERT INTO order_items (order_id, product_name, price, quantity)
SELECT 
  o.id,
  CASE 
    WHEN o.id % 3 = 0 THEN '마우스'
    WHEN o.id % 3 = 1 THEN '충전기'
    ELSE '케이스'
  END,
  o.total_amount / 2,
  1
FROM orders o
WHERE o.total_amount > 100000;