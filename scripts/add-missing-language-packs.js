const fs = require('fs');
const path = require('path');

const missingLanguagePacks = [
  // 카테고리 관련 언어팩
  {
    "key": "category:beauty",
    "ko": "뷰티",
    "en": "Beauty", 
    "jp": "美容",
    "category": "category",
    "description": "뷰티 카테고리"
  },
  {
    "key": "category:electronics",
    "ko": "전자제품",
    "en": "Electronics", 
    "jp": "電子製品",
    "category": "category", 
    "description": "전자제품 카테고리"
  },
  {
    "key": "category:fashion",
    "ko": "패션",
    "en": "Fashion", 
    "jp": "ファッション",
    "category": "category",
    "description": "패션 카테고리"
  },
  {
    "key": "category:food",
    "ko": "식품",
    "en": "Food", 
    "jp": "食品",
    "category": "category",
    "description": "식품 카테고리"
  },
  {
    "key": "category:travel",
    "ko": "여행",
    "en": "Travel", 
    "jp": "旅行",
    "category": "category",
    "description": "여행 카테고리"
  },
  {
    "key": "category:tech",
    "ko": "테크",
    "en": "Tech", 
    "jp": "テック",
    "category": "category",
    "description": "테크 카테고리"
  },
  {
    "key": "category:sports",
    "ko": "스포츠",
    "en": "Sports", 
    "jp": "スポーツ",
    "category": "category",
    "description": "스포츠 카테고리"
  },
  {
    "key": "category:lifestyle",
    "ko": "라이프스타일",
    "en": "Lifestyle", 
    "jp": "ライフスタイル",
    "category": "category",
    "description": "라이프스타일 카테고리"
  },
  {
    "key": "category:pet",
    "ko": "펫",
    "en": "Pet", 
    "jp": "ペット",
    "category": "category",
    "description": "펫 카테고리"
  },
  {
    "key": "category:baby",
    "ko": "육아",
    "en": "Baby", 
    "jp": "育児",
    "category": "category",
    "description": "육아 카테고리"
  },
  {
    "key": "category:game",
    "ko": "게임",
    "en": "Game", 
    "jp": "ゲーム",
    "category": "category",
    "description": "게임 카테고리"
  },
  {
    "key": "category:education",
    "ko": "교육",
    "en": "Education", 
    "jp": "教育",
    "category": "category",
    "description": "교육 카테고리"
  },
  // 퀵링크 관련 언어팩
  {
    "key": "quicklink:events",
    "ko": "이벤트",
    "en": "Events", 
    "jp": "イベント",
    "category": "quicklink",
    "description": "이벤트 퀵링크"
  },
  {
    "key": "quicklink:coupons",
    "ko": "쿠폰",
    "en": "Coupons", 
    "jp": "クーポン",
    "category": "quicklink",
    "description": "쿠폰 퀵링크"
  },
  {
    "key": "quicklink:ranking",
    "ko": "랭킹",
    "en": "Ranking", 
    "jp": "ランキング",
    "category": "quicklink", 
    "description": "랭킹 퀵링크"
  },
  // 프로모션 관련 언어팩
  {
    "key": "promo:title",
    "ko": "최저가보장! 100% AS",
    "en": "Lowest Price Guarantee! 100% Service", 
    "jp": "最低価格保証! 100% サービス",
    "category": "promo",
    "description": "프로모션 제목"
  },
  {
    "key": "promo:subtitle", 
    "ko": "믿을 수 있는 가격으로 캠페인!",
    "en": "Campaigns at trustworthy prices!", 
    "jp": "信頼できる価格でキャンペーン！",
    "category": "promo",
    "description": "프로모션 부제목"
  },
  // 배지 관련 언어팩
  {
    "key": "badge:hot",
    "ko": "HOT",
    "en": "HOT", 
    "jp": "HOT",
    "category": "badge",
    "description": "핫 배지"
  },
  {
    "key": "badge:new",
    "ko": "NEW",
    "en": "NEW", 
    "jp": "NEW",
    "category": "badge",
    "description": "신규 배지"
  }
];

console.log('Missing language packs to be added:');
console.log(JSON.stringify(missingLanguagePacks, null, 2));
console.log(`\nTotal: ${missingLanguagePacks.length} language packs`);

// SQL 생성 (참고용)
console.log('\n=== SQL Statements ===');
missingLanguagePacks.forEach(pack => {
  console.log(`INSERT INTO language_packs (key, ko, en, jp, category, description) VALUES ('${pack.key}', '${pack.ko}', '${pack.en}', '${pack.jp}', '${pack.category}', '${pack.description}');`);
});