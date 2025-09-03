/**
 * 해외 노동자를 위한 중고 거래 카테고리 데이터
 * 필수 생활용품 중심의 심플한 2단계 구조
 */

export interface Category {
  id: string
  name: string
  nameEn?: string  // 영어명
  slug: string
  level: 1 | 2
  parentId?: string
  icon?: string
  priority: number  // 노출 우선순위
  isEssential?: boolean  // 필수품 여부
}

export const mainCategories: Category[] = [
  {
    id: 'appliances',
    name: '생활필수 가전',
    nameEn: 'Essential Appliances',
    slug: 'appliances',
    level: 1,
    icon: '🏠',
    priority: 1,
    isEssential: true
  },
  {
    id: 'mobile',
    name: '모바일/통신',
    nameEn: 'Mobile & Communication',
    slug: 'mobile',
    level: 1,
    icon: '📱',
    priority: 2,
    isEssential: true
  },
  {
    id: 'furniture',
    name: '가구/침구',
    nameEn: 'Furniture & Bedding',
    slug: 'furniture',
    level: 1,
    icon: '🪑',
    priority: 3,
    isEssential: true
  },
  {
    id: 'kitchen',
    name: '주방용품',
    nameEn: 'Kitchen',
    slug: 'kitchen',
    level: 1,
    icon: '🍳',
    priority: 4,
    isEssential: true
  },
  {
    id: 'computer',
    name: '컴퓨터/사무',
    nameEn: 'Computer & Office',
    slug: 'computer',
    level: 1,
    icon: '💻',
    priority: 5,
    isEssential: false
  },
  {
    id: 'living',
    name: '생활/기타',
    nameEn: 'Living & Others',
    slug: 'living',
    level: 1,
    icon: '🚲',
    priority: 6,
    isEssential: false
  }
]

export const subCategories: Category[] = [
  // 생활필수 가전
  {
    id: 'tv',
    name: 'TV/모니터',
    nameEn: 'TV/Monitor',
    slug: 'tv',
    level: 2,
    parentId: 'appliances',
    priority: 1
  },
  {
    id: 'refrigerator',
    name: '냉장고',
    nameEn: 'Refrigerator',
    slug: 'refrigerator',
    level: 2,
    parentId: 'appliances',
    priority: 2
  },
  {
    id: 'washer',
    name: '세탁기',
    nameEn: 'Washing Machine',
    slug: 'washer',
    level: 2,
    parentId: 'appliances',
    priority: 3
  },
  {
    id: 'aircon',
    name: '에어컨/히터',
    nameEn: 'AC/Heater',
    slug: 'aircon',
    level: 2,
    parentId: 'appliances',
    priority: 4
  },
  {
    id: 'microwave',
    name: '전자레인지',
    nameEn: 'Microwave',
    slug: 'microwave',
    level: 2,
    parentId: 'appliances',
    priority: 5
  },

  // 모바일/통신
  {
    id: 'smartphone',
    name: '스마트폰',
    nameEn: 'Smartphone',
    slug: 'smartphone',
    level: 2,
    parentId: 'mobile',
    priority: 1
  },
  {
    id: 'tablet',
    name: '태블릿',
    nameEn: 'Tablet',
    slug: 'tablet',
    level: 2,
    parentId: 'mobile',
    priority: 2
  },
  {
    id: 'wifi',
    name: '와이파이 공유기',
    nameEn: 'WiFi Router',
    slug: 'wifi',
    level: 2,
    parentId: 'mobile',
    priority: 3
  },
  {
    id: 'charger',
    name: '충전기/케이블',
    nameEn: 'Charger/Cable',
    slug: 'charger',
    level: 2,
    parentId: 'mobile',
    priority: 4
  },

  // 가구/침구
  {
    id: 'bed',
    name: '침대/매트리스',
    nameEn: 'Bed/Mattress',
    slug: 'bed',
    level: 2,
    parentId: 'furniture',
    priority: 1
  },
  {
    id: 'desk',
    name: '책상/의자',
    nameEn: 'Desk/Chair',
    slug: 'desk',
    level: 2,
    parentId: 'furniture',
    priority: 2
  },
  {
    id: 'closet',
    name: '옷장/수납장',
    nameEn: 'Closet/Storage',
    slug: 'closet',
    level: 2,
    parentId: 'furniture',
    priority: 3
  },
  {
    id: 'bedding',
    name: '이불/베개',
    nameEn: 'Blanket/Pillow',
    slug: 'bedding',
    level: 2,
    parentId: 'furniture',
    priority: 4
  },

  // 주방용품
  {
    id: 'rice-cooker',
    name: '밥솥/전기포트',
    nameEn: 'Rice Cooker/Kettle',
    slug: 'rice-cooker',
    level: 2,
    parentId: 'kitchen',
    priority: 1
  },
  {
    id: 'gas-stove',
    name: '가스레인지',
    nameEn: 'Gas Stove',
    slug: 'gas-stove',
    level: 2,
    parentId: 'kitchen',
    priority: 2
  },
  {
    id: 'dishes',
    name: '그릇/조리도구',
    nameEn: 'Dishes/Cookware',
    slug: 'dishes',
    level: 2,
    parentId: 'kitchen',
    priority: 3
  },
  {
    id: 'food-storage',
    name: '냉장 보관용품',
    nameEn: 'Food Storage',
    slug: 'food-storage',
    level: 2,
    parentId: 'kitchen',
    priority: 4
  },

  // 컴퓨터/사무
  {
    id: 'laptop',
    name: '노트북',
    nameEn: 'Laptop',
    slug: 'laptop',
    level: 2,
    parentId: 'computer',
    priority: 1
  },
  {
    id: 'desktop',
    name: '데스크탑',
    nameEn: 'Desktop',
    slug: 'desktop',
    level: 2,
    parentId: 'computer',
    priority: 2
  },
  {
    id: 'printer',
    name: '프린터',
    nameEn: 'Printer',
    slug: 'printer',
    level: 2,
    parentId: 'computer',
    priority: 3
  },
  {
    id: 'monitor',
    name: '모니터',
    nameEn: 'Monitor',
    slug: 'monitor',
    level: 2,
    parentId: 'computer',
    priority: 4
  },

  // 생활/기타
  {
    id: 'bicycle',
    name: '자전거',
    nameEn: 'Bicycle',
    slug: 'bicycle',
    level: 2,
    parentId: 'living',
    priority: 1
  },
  {
    id: 'fan',
    name: '선풍기',
    nameEn: 'Fan',
    slug: 'fan',
    level: 2,
    parentId: 'living',
    priority: 2
  },
  {
    id: 'vacuum',
    name: '청소기',
    nameEn: 'Vacuum Cleaner',
    slug: 'vacuum',
    level: 2,
    parentId: 'living',
    priority: 3
  },
  {
    id: 'daily',
    name: '생활용품',
    nameEn: 'Daily Necessities',
    slug: 'daily',
    level: 2,
    parentId: 'living',
    priority: 4
  }
]

// 브랜드 데이터 (카테고리별)
export const brandsByCategory = {
  'tv': ['삼성', 'LG', '소니', '샤오미'],
  'refrigerator': ['삼성', 'LG', '캐리어', '위니아'],
  'washer': ['삼성', 'LG', '미디어', '위니아'],
  'aircon': ['삼성', 'LG', '캐리어', '위니아'],
  'smartphone': ['삼성', '애플', 'LG', '샤오미'],
  'laptop': ['삼성', 'LG', '레노버', 'HP', 'DELL'],
  'bed': ['에이스', '시몬스', '템퍼', '이케아'],
  'rice-cooker': ['쿠쿠', '쿠첸', '린나이']
}

// 제품 상태 등급
export const conditionGrades = {
  'S': { 
    label: '새제품', 
    labelEn: 'Like New',
    description: '미개봉 또는 거의 사용하지 않음',
    discount: '10-20%' 
  },
  'A': { 
    label: 'A급', 
    labelEn: 'Grade A',
    description: '사용감 적음, 작동 완벽',
    discount: '20-35%' 
  },
  'B': { 
    label: 'B급', 
    labelEn: 'Grade B',
    description: '사용감 있음, 작동 정상',
    discount: '35-50%' 
  },
  'C': { 
    label: 'C급', 
    labelEn: 'Grade C',
    description: '사용감 많음, 작동 가능',
    discount: '50% 이상' 
  }
}

// 가격 필터 옵션
export const priceRanges = [
  { label: '5만원 이하', min: 0, max: 50000 },
  { label: '5-10만원', min: 50000, max: 100000 },
  { label: '10-30만원', min: 100000, max: 300000 },
  { label: '30-50만원', min: 300000, max: 500000 },
  { label: '50만원 이상', min: 500000, max: null }
]

// 카테고리 헬퍼 함수
export function getCategoryWithSubs(mainCategoryId: string) {
  const main = mainCategories.find(c => c.id === mainCategoryId)
  const subs = subCategories.filter(c => c.parentId === mainCategoryId)
  return { main, subs }
}

export function getAllCategories() {
  return mainCategories.map(main => ({
    ...main,
    subcategories: subCategories.filter(sub => sub.parentId === main.id)
  }))
}

export function getCategoryBrands(categorySlug: string): string[] {
  return brandsByCategory[categorySlug] || []
}