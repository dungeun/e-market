import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Loading campaigns with status:', status, 'limit:', limit);

    // 임시 더미 캠페인 데이터
    const dummyCampaigns = [
      {
        id: 'camp-1',
        title: '신제품 뷰티 리뷰 캠페인',
        brand: 'BeautyBrand',
        applicants: 45,
        maxApplicants: 100,
        deadline: 7,
        category: 'beauty',
        platforms: ['instagram', 'youtube'],
        description: '새로운 화장품 리뷰를 작성해주세요',
        createdAt: '2024-01-15',
        budget: '50만원',
        imageUrl: '/images/campaign-1.jpg'
      },
      {
        id: 'camp-2',
        title: '패션 스타일링 콘텐츠',
        brand: 'FashionCorp',
        applicants: 32,
        maxApplicants: 50,
        deadline: 5,
        category: 'fashion',
        platforms: ['instagram', 'tiktok'],
        description: '봄 신상 의류 스타일링 영상',
        createdAt: '2024-01-14',
        budget: '80만원',
        imageUrl: '/images/campaign-2.jpg'
      },
      {
        id: 'camp-3',
        title: '맛집 리뷰 챌린지',
        brand: 'FoodiePlace',
        applicants: 67,
        maxApplicants: 80,
        deadline: 3,
        category: 'food',
        platforms: ['instagram', 'blog'],
        description: '새로 오픈한 레스토랑 리뷰',
        createdAt: '2024-01-13',
        budget: '30만원',
        imageUrl: '/images/campaign-3.jpg'
      },
      {
        id: 'camp-4',
        title: '여행지 추천 콘텐츠',
        brand: 'TravelKorea',
        applicants: 23,
        maxApplicants: 40,
        deadline: 10,
        category: 'travel',
        platforms: ['youtube', 'blog'],
        description: '국내 여행지 추천 영상',
        createdAt: '2024-01-12',
        budget: '100만원',
        imageUrl: '/images/campaign-4.jpg'
      },
      {
        id: 'camp-5',
        title: '테크 제품 언박싱',
        brand: 'TechGear',
        applicants: 89,
        maxApplicants: 120,
        deadline: 14,
        category: 'tech',
        platforms: ['youtube', 'instagram'],
        description: '최신 스마트폰 언박싱 리뷰',
        createdAt: '2024-01-11',
        budget: '200만원',
        imageUrl: '/images/campaign-5.jpg'
      },
      {
        id: 'camp-6',
        title: '홈 트레이닝 루틴',
        brand: 'FitLife',
        applicants: 56,
        maxApplicants: 70,
        deadline: 12,
        category: 'fitness',
        platforms: ['instagram', 'youtube'],
        description: '집에서 하는 운동 루틴 소개',
        createdAt: '2024-01-10',
        budget: '60만원',
        imageUrl: '/images/campaign-6.jpg'
      },
      {
        id: 'camp-7',
        title: '라이프스타일 브이로그',
        brand: 'LifeStyle',
        applicants: 78,
        maxApplicants: 90,
        deadline: 8,
        category: 'lifestyle',
        platforms: ['youtube', 'tiktok'],
        description: '일상 브이로그 촬영',
        createdAt: '2024-01-09',
        budget: '40만원',
        imageUrl: '/images/campaign-7.jpg'
      },
      {
        id: 'camp-8',
        title: '반려동물 제품 리뷰',
        brand: 'PetCare',
        applicants: 34,
        maxApplicants: 50,
        deadline: 6,
        category: 'pet',
        platforms: ['instagram', 'blog'],
        description: '반려동물 용품 사용 후기',
        createdAt: '2024-01-08',
        budget: '35만원',
        imageUrl: '/images/campaign-8.jpg'
      }
    ];

    // 상태별 필터링
    const activeCampaigns = status === 'active' 
      ? dummyCampaigns.filter(camp => camp.deadline > 0)
      : dummyCampaigns;

    // 제한 적용
    const limitedCampaigns = activeCampaigns.slice(0, limit);

    return NextResponse.json({
      success: true,
      campaigns: limitedCampaigns,
      total: activeCampaigns.length,
      status,
      limit
    });

  } catch (error) {
    console.error('Failed to load campaigns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load campaigns',
        campaigns: []
      },
      { status: 500 }
    );
  }
}