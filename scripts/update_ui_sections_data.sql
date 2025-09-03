-- Update UI sections with proper data for each section

-- 1. Hero Section Data
UPDATE ui_sections 
SET data = '{
  "slides": [
    {
      "id": 1,
      "title": "중고 가전제품 특가",
      "subtitle": "외국인 노동자를 위한 필수 생활가전",
      "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600",
      "link": "/products?category=used-appliances",
      "buttonText": "지금 구매하기"
    },
    {
      "id": 2, 
      "title": "가구 할인 이벤트",
      "subtitle": "깨끗한 중고 가구 최대 70% 할인",
      "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
      "link": "/products?category=used-furniture",
      "buttonText": "할인 상품 보기"
    }
  ]
}'::jsonb
WHERE key = 'hero';

-- 2. Category Section Data
UPDATE ui_sections 
SET data = '{
  "categories": [
    {
      "id": "1",
      "name": "에어컨",
      "icon": "❄️",
      "link": "/products?category=aircon",
      "badge": "HOT",
      "color": "text-blue-600"
    },
    {
      "id": "2", 
      "name": "냉장고",
      "icon": "🧊",
      "link": "/products?category=refrigerator",
      "color": "text-cyan-600"
    },
    {
      "id": "3",
      "name": "세탁기", 
      "icon": "🌀",
      "link": "/products?category=washer",
      "color": "text-purple-600"
    },
    {
      "id": "4",
      "name": "TV",
      "icon": "📺",
      "link": "/products?category=tv",
      "badge": "SALE",
      "color": "text-red-600"
    },
    {
      "id": "5",
      "name": "전자레인지",
      "icon": "🔥",
      "link": "/products?category=microwave",
      "color": "text-orange-600"
    },
    {
      "id": "6",
      "name": "침대/매트리스",
      "icon": "🛏️",
      "link": "/products?category=bed",
      "color": "text-indigo-600"
    },
    {
      "id": "7",
      "name": "책상/의자",
      "icon": "🪑",
      "link": "/products?category=desk",
      "color": "text-green-600"
    },
    {
      "id": "8",
      "name": "주방용품",
      "icon": "🍳",
      "link": "/products?category=kitchen",
      "color": "text-yellow-600"
    }
  ]
}'::jsonb
WHERE key = 'category';

-- 3. Quick Links Section Data  
UPDATE ui_sections 
SET data = '{
  "links": [
    {
      "id": "1",
      "title": "포인트 적립",
      "description": "구매 시 5% 적립",
      "icon": "💰",
      "link": "/mypage/points",
      "color": "bg-yellow-50 border-yellow-200"
    },
    {
      "id": "2",
      "title": "무료배송",
      "description": "30,000원 이상 구매 시",
      "icon": "🚚",
      "link": "/info/shipping",
      "color": "bg-blue-50 border-blue-200"
    },
    {
      "id": "3",
      "title": "고객지원",
      "description": "24시간 언제든지",
      "icon": "💬",
      "link": "/support",
      "color": "bg-green-50 border-green-200"
    },
    {
      "id": "4",
      "title": "신규 회원",
      "description": "첫 구매 10% 할인",
      "icon": "🎉",
      "link": "/auth/register",
      "color": "bg-purple-50 border-purple-200"
    }
  ]
}'::jsonb
WHERE key = 'quicklinks';

-- 4. Promo Section Data
UPDATE ui_sections 
SET data = '{
  "banners": [
    {
      "id": "1",
      "title": "여름 특가 세일",
      "subtitle": "에어컨, 선풍기 최대 50% 할인",
      "buttonText": "지금 쇼핑하기",
      "link": "/products?sale=summer",
      "backgroundColor": "bg-gradient-to-r from-orange-400 to-pink-500",
      "textColor": "text-white",
      "visible": true,
      "order": 1
    },
    {
      "id": "2",
      "title": "신규 회원 혜택",
      "subtitle": "첫 구매 시 무료배송 + 10% 할인",
      "buttonText": "회원가입하기",
      "link": "/auth/register",
      "backgroundColor": "bg-gradient-to-r from-blue-500 to-purple-600",
      "textColor": "text-white",
      "visible": true,
      "order": 2
    }
  ]
}'::jsonb
WHERE key = 'promo';

-- 5. Ranking Section Data
UPDATE ui_sections 
SET data = '{
  "title": "실시간 인기 상품",
  "products": [],
  "refreshInterval": 60000
}'::jsonb
WHERE key = 'ranking';

-- 6. Recommended Section Data
UPDATE ui_sections 
SET data = '{
  "title": "추천 상품",
  "subtitle": "고객님을 위한 맞춤 추천",
  "products": [],
  "algorithm": "collaborative_filtering"
}'::jsonb
WHERE key = 'recommended';

-- 7. Featured Products Data
UPDATE ui_sections 
SET data = '{
  "title": "이달의 특가",
  "subtitle": "놓치면 후회하는 특별 할인",
  "products": [],
  "badge": "SALE"
}'::jsonb
WHERE key = 'featured-products';