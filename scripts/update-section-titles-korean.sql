-- UI 섹션 제목을 한글로 업데이트
UPDATE ui_sections SET title = '히어로 배너' WHERE key = 'hero';
UPDATE ui_sections SET title = '카테고리' WHERE key = 'category';
UPDATE ui_sections SET title = '베스트 상품' WHERE key = '베스트';
UPDATE ui_sections SET title = '바로가기' WHERE key = 'quicklinks';
UPDATE ui_sections SET title = '추천 상품' WHERE key = 'featured-products';
UPDATE ui_sections SET title = '프로모션' WHERE key = 'promo';
UPDATE ui_sections SET title = '실시간 랭킹' WHERE key = 'ranking';
UPDATE ui_sections SET title = '신상품' WHERE key = 'new-arrivals';
UPDATE ui_sections SET title = '트렌드 상품' WHERE key = 'trending-products';
UPDATE ui_sections SET title = '특별 할인' WHERE key = 'special-offers';
UPDATE ui_sections SET title = '추천 콘텐츠' WHERE key = 'recommended';

-- 번역 데이터도 함께 업데이트 (JSON 형식)
UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "히어로 배너"}'::jsonb
)
WHERE key = 'hero';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "카테고리"}'::jsonb
)
WHERE key = 'category';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "베스트 상품"}'::jsonb
)
WHERE key = '베스트';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "바로가기"}'::jsonb
)
WHERE key = 'quicklinks';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "추천 상품"}'::jsonb
)
WHERE key = 'featured-products';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "프로모션"}'::jsonb
)
WHERE key = 'promo';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "실시간 랭킹"}'::jsonb
)
WHERE key = 'ranking';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "신상품"}'::jsonb
)
WHERE key = 'new-arrivals';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "트렌드 상품"}'::jsonb
)
WHERE key = 'trending-products';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "특별 할인"}'::jsonb
)
WHERE key = 'special-offers';

UPDATE ui_sections 
SET translations = jsonb_set(
  COALESCE(translations, '{}')::jsonb,
  '{ko}',
  '{"title": "추천 콘텐츠"}'::jsonb
)
WHERE key = 'recommended';