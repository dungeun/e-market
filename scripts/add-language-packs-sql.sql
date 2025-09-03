-- 카테고리 언어팩 추가
-- category:beauty
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_beauty_ko', 'ko', 'category', 'beauty', '뷰티', '뷰티 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_beauty_en', 'en', 'category', 'beauty', 'Beauty', '뷰티 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_beauty_jp', 'jp', 'category', 'beauty', '美容', '뷰티 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:electronics  
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_electronics_ko', 'ko', 'category', 'electronics', '전자제품', '전자제품 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_electronics_en', 'en', 'category', 'electronics', 'Electronics', '전자제품 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_electronics_jp', 'jp', 'category', 'electronics', '電子製品', '전자제품 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:fashion
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_fashion_ko', 'ko', 'category', 'fashion', '패션', '패션 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_fashion_en', 'en', 'category', 'fashion', 'Fashion', '패션 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_fashion_jp', 'jp', 'category', 'fashion', 'ファッション', '패션 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:food
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_food_ko', 'ko', 'category', 'food', '식품', '식품 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_food_en', 'en', 'category', 'food', 'Food', '식품 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_food_jp', 'jp', 'category', 'food', '食品', '식품 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:travel
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_travel_ko', 'ko', 'category', 'travel', '여행', '여행 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_travel_en', 'en', 'category', 'travel', 'Travel', '여행 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_travel_jp', 'jp', 'category', 'travel', '旅行', '여행 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:tech
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_tech_ko', 'ko', 'category', 'tech', '테크', '테크 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_tech_en', 'en', 'category', 'tech', 'Tech', '테크 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_tech_jp', 'jp', 'category', 'tech', 'テック', '테크 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:sports
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_sports_ko', 'ko', 'category', 'sports', '스포츠', '스포츠 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_sports_en', 'en', 'category', 'sports', 'Sports', '스포츠 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_sports_jp', 'jp', 'category', 'sports', 'スポーツ', '스포츠 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:lifestyle
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_lifestyle_ko', 'ko', 'category', 'lifestyle', '라이프스타일', '라이프스타일 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_lifestyle_en', 'en', 'category', 'lifestyle', 'Lifestyle', '라이프스타일 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_lifestyle_jp', 'jp', 'category', 'lifestyle', 'ライフスタイル', '라이프스타일 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- category:pet
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('category_pet_ko', 'ko', 'category', 'pet', '펫', '펫 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_pet_en', 'en', 'category', 'pet', 'Pet', '펫 카테고리', 'category', true, 1, NOW(), NOW()),
  ('category_pet_jp', 'jp', 'category', 'pet', 'ペット', '펫 카테고리', 'category', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- 퀵링크 언어팩 추가
-- quicklink:events
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('quicklink_events_ko', 'ko', 'quicklink', 'events', '이벤트', '이벤트 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_events_en', 'en', 'quicklink', 'events', 'Events', '이벤트 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_events_jp', 'jp', 'quicklink', 'events', 'イベント', '이벤트 퀵링크', 'quicklink', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- quicklink:coupons
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('quicklink_coupons_ko', 'ko', 'quicklink', 'coupons', '쿠폰', '쿠폰 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_coupons_en', 'en', 'quicklink', 'coupons', 'Coupons', '쿠폰 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_coupons_jp', 'jp', 'quicklink', 'coupons', 'クーポン', '쿠폰 퀵링크', 'quicklink', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- quicklink:ranking
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('quicklink_ranking_ko', 'ko', 'quicklink', 'ranking', '랭킹', '랭킹 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_ranking_en', 'en', 'quicklink', 'ranking', 'Ranking', '랭킹 퀵링크', 'quicklink', true, 1, NOW(), NOW()),
  ('quicklink_ranking_jp', 'jp', 'quicklink', 'ranking', 'ランキング', '랭킹 퀵링크', 'quicklink', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- 프로모션 언어팩 추가
-- promo:title
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('promo_title_ko', 'ko', 'promo', 'title', '최저가보장! 100% AS', '프로모션 제목', 'promo', true, 1, NOW(), NOW()),
  ('promo_title_en', 'en', 'promo', 'title', 'Lowest Price Guarantee! 100% Service', '프로모션 제목', 'promo', true, 1, NOW(), NOW()),
  ('promo_title_jp', 'jp', 'promo', 'title', '最低価格保証! 100% サービス', '프로모션 제목', 'promo', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- promo:subtitle
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('promo_subtitle_ko', 'ko', 'promo', 'subtitle', '믿을 수 있는 가격으로 캠페인!', '프로모션 부제목', 'promo', true, 1, NOW(), NOW()),
  ('promo_subtitle_en', 'en', 'promo', 'subtitle', 'Campaigns at trustworthy prices!', '프로모션 부제목', 'promo', true, 1, NOW(), NOW()),
  ('promo_subtitle_jp', 'jp', 'promo', 'subtitle', '信頼できる価格でキャンペーン！', '프로모션 부제목', 'promo', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();

-- 배지 언어팩 추가
-- badge:hot
INSERT INTO language_packs (id, "languageCode", namespace, key, value, description, category, "isActive", version, "createdAt", "updatedAt") 
VALUES 
  ('badge_hot_ko', 'ko', 'badge', 'hot', 'HOT', '핫 배지', 'badge', true, 1, NOW(), NOW()),
  ('badge_hot_en', 'en', 'badge', 'hot', 'HOT', '핫 배지', 'badge', true, 1, NOW(), NOW()),
  ('badge_hot_jp', 'jp', 'badge', 'hot', 'HOT', '핫 배지', 'badge', true, 1, NOW(), NOW())
ON CONFLICT ("languageCode", namespace, key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  "updatedAt" = NOW();