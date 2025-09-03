import { NextRequest } from 'next/server';
import { createApiHandler, success, error } from '@/lib/api/handler';
import { query } from '@/lib/db';

// 전자제품 브랜드 목록 (해외 노동자들이 자주 찾는 브랜드)
const STATIC_BRANDS = {
  electronics: [
    { id: 'brand-001', name: 'Samsung', nameKo: '삼성', category: 'electronics' },
    { id: 'brand-002', name: 'Apple', nameKo: '애플', category: 'electronics' },
    { id: 'brand-003', name: 'LG', nameKo: 'LG', category: 'electronics' },
    { id: 'brand-004', name: 'Sony', nameKo: '소니', category: 'electronics' },
    { id: 'brand-005', name: 'Xiaomi', nameKo: '샤오미', category: 'electronics' },
    { id: 'brand-006', name: 'ASUS', nameKo: '아수스', category: 'electronics' },
    { id: 'brand-007', name: 'Lenovo', nameKo: '레노버', category: 'electronics' },
    { id: 'brand-008', name: 'HP', nameKo: 'HP', category: 'electronics' },
    { id: 'brand-009', name: 'Dell', nameKo: '델', category: 'electronics' },
    { id: 'brand-010', name: 'JBL', nameKo: 'JBL', category: 'electronics' },
    { id: 'brand-011', name: 'Bose', nameKo: '보스', category: 'electronics' },
    { id: 'brand-012', name: 'Other', nameKo: '기타', category: 'electronics' }
  ],
  appliances: [
    { id: 'brand-020', name: 'Samsung', nameKo: '삼성', category: 'appliances' },
    { id: 'brand-021', name: 'LG', nameKo: 'LG', category: 'appliances' },
    { id: 'brand-022', name: 'Whirlpool', nameKo: '월풀', category: 'appliances' },
    { id: 'brand-023', name: 'Carrier', nameKo: '캐리어', category: 'appliances' },
    { id: 'brand-024', name: 'Daewoo', nameKo: '대우', category: 'appliances' },
    { id: 'brand-025', name: 'Haier', nameKo: '하이얼', category: 'appliances' },
    { id: 'brand-026', name: 'Cuckoo', nameKo: '쿠쿠', category: 'appliances' },
    { id: 'brand-027', name: 'Cuchen', nameKo: '쿠첸', category: 'appliances' },
    { id: 'brand-028', name: 'Other', nameKo: '기타', category: 'appliances' }
  ],
  furniture: [
    { id: 'brand-040', name: 'IKEA', nameKo: '이케아', category: 'furniture' },
    { id: 'brand-041', name: 'Hanssem', nameKo: '한샘', category: 'furniture' },
    { id: 'brand-042', name: 'Livart', nameKo: '리바트', category: 'furniture' },
    { id: 'brand-043', name: 'Iloom', nameKo: '일룸', category: 'furniture' },
    { id: 'brand-044', name: 'Simmons', nameKo: '시몬스', category: 'furniture' },
    { id: 'brand-045', name: 'Ace Bed', nameKo: '에이스침대', category: 'furniture' },
    { id: 'brand-046', name: 'Jangin', nameKo: '장인가구', category: 'furniture' },
    { id: 'brand-047', name: 'Other', nameKo: '기타', category: 'furniture' }
  ]
};

// GET /api/admin/brands - 브랜드 목록 조회
export const GET = createApiHandler({
  adminOnly: true,
  cache: { enabled: true, ttl: 300 },
  handler: async (request: NextRequest) => {
    try {
      // 카테고리별로 브랜드를 반환
      const category = request.nextUrl.searchParams.get('category');
      
      if (category) {
        // 특정 카테고리의 브랜드만 반환
        const categoryMapping: Record<string, string> = {
          'CAT-001': 'electronics',
          'CAT-002': 'appliances', 
          'CAT-003': 'furniture',
          'electronics': 'electronics',
          'appliances': 'appliances',
          'furniture': 'furniture'
        };
        
        const mappedCategory = categoryMapping[category];
        if (mappedCategory && STATIC_BRANDS[mappedCategory as keyof typeof STATIC_BRANDS]) {
          return success({ 
            brands: STATIC_BRANDS[mappedCategory as keyof typeof STATIC_BRANDS] 
          });
        }
      }
      
      // 모든 브랜드 반환
      const allBrands = [
        ...STATIC_BRANDS.electronics,
        ...STATIC_BRANDS.appliances,
        ...STATIC_BRANDS.furniture
      ];
      
      return success({ brands: allBrands });
    } catch (err) {
      console.error('Failed to fetch brands:', err);
      return error('Failed to fetch brands', 500);
    }
  }
});