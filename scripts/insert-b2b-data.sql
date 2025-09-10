-- B2B 시스템 샘플 데이터 추가

-- 1. 창고 데이터
INSERT INTO warehouses (code, name, type, address, postal_code, city, region, capacity, current_stock, manager_name, phone, email, operating_hours) VALUES
  ('WH001', '서울 중앙 물류센터', 'general', '서울특별시 강남구 테헤란로 123', '06234', '서울', '서울', 50000, 12000, '김철수', '02-1234-5678', 'seoul@warehouse.com', '{"mon-fri": "09:00-18:00", "sat": "09:00-13:00"}'),
  ('WH002', '경기 북부 물류센터', 'general', '경기도 고양시 일산동구 중앙로 456', '10380', '고양', '경기', 75000, 23000, '이영희', '031-987-6543', 'gyeonggi@warehouse.com', '{"mon-fri": "08:00-20:00", "sat": "09:00-15:00"}'),
  ('WH003', '부산 냉장 물류센터', 'cold', '부산광역시 사하구 감천항로 789', '49434', '부산', '부산', 30000, 8500, '박민수', '051-555-1234', 'busan@warehouse.com', '{"24/7": true}'),
  ('WH004', '인천 국제 물류센터', 'general', '인천광역시 중구 공항로 321', '22382', '인천', '인천', 100000, 45000, '최대한', '032-777-8888', 'incheon@warehouse.com', '{"24/7": true}')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  capacity = EXCLUDED.capacity,
  current_stock = EXCLUDED.current_stock,
  updated_at = CURRENT_TIMESTAMP;

-- 2. 입점업체 데이터
INSERT INTO vendors (code, company_name, business_number, ceo_name, business_type, status, address, postal_code, phone, email, website, bank_name, bank_account, account_holder, commission_rate, settlement_cycle, contract_start, contract_end, approved_at) VALUES
  ('V001', '삼성패션', '123-45-67890', '김대표', 'manufacturer', 'approved', '서울시 강남구 삼성로 100', '06234', '02-3333-4444', 'contact@samsungfashion.com', 'https://www.samsungfashion.com', '국민은행', '123-456-789012', '삼성패션(주)', 15.00, 30, '2024-01-01', '2025-12-31', CURRENT_TIMESTAMP),
  ('V002', 'LG뷰티', '234-56-78901', '박대표', 'distributor', 'approved', '서울시 영등포구 여의대로 200', '07320', '02-5555-6666', 'info@lgbeauty.com', 'https://www.lgbeauty.com', '우리은행', '234-567-890123', 'LG뷰티(주)', 12.00, 30, '2024-01-01', '2025-12-31', CURRENT_TIMESTAMP),
  ('V003', '신세계푸드', '345-67-89012', '최대표', 'manufacturer', 'approved', '서울시 중구 소공로 300', '04530', '02-7777-8888', 'sales@shinsegaefood.com', 'https://www.shinsegaefood.com', '신한은행', '345-678-901234', '신세계푸드(주)', 10.00, 15, '2024-03-01', '2025-02-28', CURRENT_TIMESTAMP),
  ('V004', '현대백화점', '456-78-90123', '정대표', 'retailer', 'approved', '서울시 강남구 압구정로 165', '06001', '02-9999-0000', 'contact@hyundai.com', 'https://www.hyundai.com', '하나은행', '456-789-012345', '현대백화점(주)', 18.00, 45, '2024-02-01', '2026-01-31', CURRENT_TIMESTAMP),
  ('V005', '스타트업테크', '567-89-01234', '이대표', 'manufacturer', 'pending', '서울시 서초구 강남대로 500', '06521', '02-1111-2222', 'info@startuptech.com', 'https://www.startuptech.com', '카카오뱅크', '567-890-123456', '스타트업테크(주)', 20.00, 30, NULL, NULL, NULL)
ON CONFLICT (code) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- 3. 입점 신청 레코드 생성 (pending 상태용)
INSERT INTO vendor_applications (vendor_id, application_type, status, submitted_data)
SELECT v.id, 'new', 'pending', '{"note": "입점 신청 검토 중"}'
FROM vendors v
WHERE v.status = 'pending'
ON CONFLICT DO NOTHING;

-- 4. 현재 상태 확인
SELECT 
  'B2B 시스템 현황' as title,
  (SELECT COUNT(*) FROM warehouses WHERE is_active = true) as total_warehouses,
  (SELECT SUM(capacity) FROM warehouses WHERE is_active = true) as total_capacity,
  (SELECT SUM(current_stock) FROM warehouses WHERE is_active = true) as total_stock,
  (SELECT COUNT(*) FROM vendors WHERE is_active = true) as total_vendors,
  (SELECT COUNT(*) FROM vendors WHERE status = 'approved') as approved_vendors,
  (SELECT COUNT(*) FROM vendors WHERE status = 'pending') as pending_vendors;

-- 5. 창고별 현황
SELECT 
  '창고별 현황' as title,
  code,
  name,
  city,
  capacity,
  current_stock,
  ROUND((current_stock::float / capacity * 100), 1) as usage_rate
FROM warehouses 
WHERE is_active = true 
ORDER BY name;

-- 6. 업체별 현황
SELECT 
  '업체별 현황' as title,
  code,
  company_name,
  business_type,
  status,
  commission_rate,
  CASE 
    WHEN approved_at IS NOT NULL THEN '승인완료'
    ELSE '승인대기'
  END as approval_status
FROM vendors 
WHERE is_active = true 
ORDER BY status, company_name;