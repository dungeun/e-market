-- ui_sections 테이블에 누락된 컬럼 추가
ALTER TABLE ui_sections 
ADD COLUMN IF NOT EXISTS key VARCHAR(255),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS data JSONB,
ADD COLUMN IF NOT EXISTS translations JSONB;

-- hero 섹션 기본 데이터 삽입
INSERT INTO ui_sections (name, type, key, title, "order", "isActive", config, data, translations)
VALUES (
  'Hero Banner',
  'hero',
  'hero',
  '히어로 배너',
  1,
  true,
  '{"autoPlay": true, "duration": 5000}'::jsonb,
  '{
    "slides": [
      {
        "id": "1",
        "title": "특별한 혜택",
        "subtitle": "지금 바로 만나보세요",
        "tag": "🔥 HOT",
        "link": "/products",
        "bgColor": "bg-gradient-to-br from-indigo-600 to-purple-600",
        "visible": true,
        "order": 1
      },
      {
        "id": "2", 
        "title": "신상품 출시",
        "subtitle": "최신 트렌드를 만나보세요",
        "tag": "NEW",
        "link": "/products?filter=new",
        "bgColor": "bg-gradient-to-br from-blue-600 to-cyan-600",
        "visible": true,
        "order": 2
      }
    ]
  }'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (name) DO UPDATE
SET data = EXCLUDED.data,
    config = EXCLUDED.config;