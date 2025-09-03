-- Update existing products with used goods information
UPDATE products 
SET 
  condition = (ARRAY['S', 'A', 'B', 'C'])[floor(random() * 4 + 1)],
  usage_period = CASE 
    WHEN RANDOM() < 0.3 THEN '3개월 미만'
    WHEN RANDOM() < 0.6 THEN '6개월 ~ 1년'
    ELSE '1년 이상'
  END,
  purchase_date = CASE 
    WHEN RANDOM() < 0.3 THEN '2024년 12월'
    WHEN RANDOM() < 0.6 THEN '2024년 6월'
    ELSE '2023년'
  END,
  defects = '정상 사용감 있으나 기능 정상',
  seller_name = CASE 
    WHEN RANDOM() < 0.5 THEN '김민수'
    ELSE '이영희'
  END,
  seller_phone = '010-' || LPAD((RANDOM() * 10000)::INT::TEXT, 4, '0') || '-' || LPAD((RANDOM() * 10000)::INT::TEXT, 4, '0'),
  seller_location = CASE 
    WHEN RANDOM() < 0.25 THEN '안산시 원곡동'
    WHEN RANDOM() < 0.5 THEN '수원시 팔달구'
    WHEN RANDOM() < 0.75 THEN '부천시 중동'
    ELSE '시흥시 정왕동'
  END,
  verified_seller = RANDOM() < 0.7,
  negotiable = RANDOM() < 0.8,
  direct_trade = true,
  delivery_available = RANDOM() < 0.3,
  warranty_info = '보증 없음'
WHERE 1=1;

-- Update some specific popular items
UPDATE products 
SET 
  condition = 'A',
  usage_period = '6개월',
  purchase_date = '2024년 7월',
  defects = '생활기스 있으나 작동 완벽',
  seller_name = '박상민',
  seller_location = '안산시 원곡동',
  verified_seller = true,
  negotiable = true,
  warranty_info = '구매영수증 보유, 6개월 자체 보증'
WHERE name LIKE '%에어컨%' OR name LIKE '%냉장고%' OR name LIKE '%세탁기%';

-- Update electronics with better condition
UPDATE products 
SET condition = 'A',
    defects = '박스 미개봉 또는 전시상품',
    warranty_info = '제조사 보증서 보유'
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE slug IN ('smartphones', 'laptops', 'tablets')
) AND condition = 'C';