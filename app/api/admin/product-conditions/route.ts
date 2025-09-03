import { NextRequest } from 'next/server';
import { createApiHandler, success } from '@/lib/api/handler';

// 상품 상태 등급 정의
const PRODUCT_CONDITIONS = [
  {
    id: 'condition-s',
    grade: 'S',
    name: 'S급 (미개봉)',
    nameEn: 'S Grade (Unopened)',
    description: '미개봉 새제품',
    descriptionEn: 'Unopened new product',
    color: '#22c55e', // green
    value: 95
  },
  {
    id: 'condition-a',
    grade: 'A',
    name: 'A급 (거의 새것)',
    nameEn: 'A Grade (Like New)',
    description: '사용감이 거의 없는 상태',
    descriptionEn: 'Almost no signs of use',
    color: '#3b82f6', // blue
    value: 85
  },
  {
    id: 'condition-b',
    grade: 'B',
    name: 'B급 (사용감 있음)',
    nameEn: 'B Grade (Used)',
    description: '정상적인 사용감이 있지만 기능에 문제 없음',
    descriptionEn: 'Normal signs of use but fully functional',
    color: '#f59e0b', // amber
    value: 70
  },
  {
    id: 'condition-c',
    grade: 'C',
    name: 'C급 (많이 사용됨)',
    nameEn: 'C Grade (Heavily Used)',
    description: '사용감이 많지만 작동에 문제 없음',
    descriptionEn: 'Heavily used but still working',
    color: '#ef4444', // red
    value: 50
  }
];

// GET /api/admin/product-conditions - 상품 상태 등급 목록 조회
export const GET = createApiHandler({
  adminOnly: true,
  cache: { enabled: true, ttl: 300 },
  handler: async () => {
    return success({ conditions: PRODUCT_CONDITIONS });
  }
});