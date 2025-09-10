-- B2B 관리 시스템 테이블 생성
-- Date: 2025-01-09

-- 1. 창고(물류센터) 테이블
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) DEFAULT 'general', -- general, cold, hazmat, etc.
  address VARCHAR(500) NOT NULL,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'KR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity INTEGER DEFAULT 0, -- 총 보관 가능 수량
  current_stock INTEGER DEFAULT 0, -- 현재 보관 수량
  manager_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB, -- 운영 시간 정보
  shipping_zones JSONB, -- 배송 가능 지역
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 입점업체(벤더) 테이블
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  business_number VARCHAR(20) UNIQUE, -- 사업자등록번호
  ceo_name VARCHAR(100),
  business_type VARCHAR(50), -- manufacturer, distributor, retailer
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, suspended, rejected
  address VARCHAR(500),
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  bank_name VARCHAR(50),
  bank_account VARCHAR(50),
  account_holder VARCHAR(100),
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- 수수료율 (%)
  settlement_cycle INTEGER DEFAULT 30, -- 정산 주기 (일)
  contract_start DATE,
  contract_end DATE,
  documents JSONB, -- 제출 서류 정보
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  approved_at TIMESTAMP,
  approved_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 입점 신청 테이블
CREATE TABLE IF NOT EXISTS vendor_applications (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  application_type VARCHAR(50), -- new, renewal, update
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, approved, rejected
  submitted_data JSONB, -- 신청 당시 데이터
  review_notes TEXT,
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 제품-창고 재고 테이블 (제품이 어느 창고에 얼마나 있는지)
CREATE TABLE IF NOT EXISTS product_warehouse_stock (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id),
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- 예약된 수량
  min_stock INTEGER DEFAULT 10, -- 최소 재고
  max_stock INTEGER DEFAULT 1000, -- 최대 재고
  reorder_point INTEGER DEFAULT 50, -- 재주문점
  location VARCHAR(100), -- 창고 내 위치 (예: A-3-15)
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id)
);

-- 5. 창고 이동 내역
CREATE TABLE IF NOT EXISTS warehouse_transfers (
  id SERIAL PRIMARY KEY,
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  from_warehouse_id INTEGER REFERENCES warehouses(id),
  to_warehouse_id INTEGER REFERENCES warehouses(id),
  product_id VARCHAR(50),
  quantity INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, completed, cancelled
  requested_by INTEGER,
  approved_by INTEGER,
  transfer_date DATE,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 배송-창고 연결 테이블 (주문이 어느 창고에서 배송되는지)
CREATE TABLE IF NOT EXISTS order_warehouse_shipments (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  order_item_id VARCHAR(50),
  warehouse_id INTEGER REFERENCES warehouses(id),
  product_id VARCHAR(50),
  quantity INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered
  tracking_number VARCHAR(100),
  carrier VARCHAR(50), -- 택배사
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 벤더 정산 내역
CREATE TABLE IF NOT EXISTS vendor_settlements (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  settlement_number VARCHAR(50) UNIQUE NOT NULL,
  period_start DATE,
  period_end DATE,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  commission_amount DECIMAL(12, 2) DEFAULT 0,
  settlement_amount DECIMAL(12, 2) DEFAULT 0, -- total_sales - commission_amount
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  bank_transfer_info JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_warehouses_active ON warehouses(is_active);
CREATE INDEX idx_warehouses_region ON warehouses(region);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX idx_product_warehouse_stock_product ON product_warehouse_stock(product_id);
CREATE INDEX idx_product_warehouse_stock_warehouse ON product_warehouse_stock(warehouse_id);
CREATE INDEX idx_warehouse_transfers_status ON warehouse_transfers(status);
CREATE INDEX idx_order_warehouse_shipments_order ON order_warehouse_shipments(order_id);
CREATE INDEX idx_order_warehouse_shipments_status ON order_warehouse_shipments(status);
CREATE INDEX idx_vendor_settlements_vendor ON vendor_settlements(vendor_id);
CREATE INDEX idx_vendor_settlements_status ON vendor_settlements(status);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_applications_updated_at BEFORE UPDATE ON vendor_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_warehouse_stock_updated_at BEFORE UPDATE ON product_warehouse_stock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_transfers_updated_at BEFORE UPDATE ON warehouse_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_warehouse_shipments_updated_at BEFORE UPDATE ON order_warehouse_shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_settlements_updated_at BEFORE UPDATE ON vendor_settlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 입력
INSERT INTO warehouses (code, name, type, address, postal_code, city, region, manager_name, phone, email, capacity, operating_hours) VALUES
  ('WH001', '서울 중앙 물류센터', 'general', '서울특별시 강남구 테헤란로 123', '06234', '서울', '서울', '김철수', '02-1234-5678', 'seoul@warehouse.com', 50000, '{"mon-fri": "09:00-18:00", "sat": "09:00-13:00"}'),
  ('WH002', '경기 북부 물류센터', 'general', '경기도 고양시 일산동구 중앙로 456', '10380', '고양', '경기', '이영희', '031-987-6543', 'gyeonggi@warehouse.com', 75000, '{"mon-fri": "08:00-20:00", "sat": "09:00-15:00"}'),
  ('WH003', '부산 냉장 물류센터', 'cold', '부산광역시 사하구 감천항로 789', '49434', '부산', '부산', '박민수', '051-555-1234', 'busan@warehouse.com', 30000, '{"24/7": true}');

INSERT INTO vendors (code, company_name, business_number, ceo_name, business_type, status, address, phone, email, commission_rate) VALUES
  ('V001', '삼성패션', '123-45-67890', '김대표', 'manufacturer', 'approved', '서울시 강남구 삼성로 100', '02-3333-4444', 'contact@samsungfashion.com', 15.00),
  ('V002', 'LG뷰티', '234-56-78901', '박대표', 'distributor', 'approved', '서울시 영등포구 여의대로 200', '02-5555-6666', 'info@lgbeauty.com', 12.00),
  ('V003', '신세계푸드', '345-67-89012', '최대표', 'manufacturer', 'pending', '서울시 중구 소공로 300', '02-7777-8888', 'sales@shinsegaefood.com', 10.00);

-- 확인 쿼리
SELECT 
  'Migration Complete!' as status,
  (SELECT COUNT(*) FROM warehouses) as total_warehouses,
  (SELECT COUNT(*) FROM vendors) as total_vendors,
  (SELECT COUNT(*) FROM vendors WHERE status = 'approved') as approved_vendors;