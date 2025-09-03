import { NextRequest, NextResponse } from 'next/server';

// Mock 캠페인 데이터 (campaign 테이블이 없음)
const mockCampaigns = [
  {
    id: 'campaign-1',
    title: '뷰티 인플루언서 모집',
    description: '신제품 런칭 홍보 캠페인',
    platform: 'instagram',
    budget: 5000000,
    targetFollowers: 10000,
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    status: 'approved',
    imageUrl: '/images/campaign-1.jpg',
    business: {
      id: 'business-1',
      name: '뷰티 브랜드',
      businessProfile: {
        companyName: '뷰티 컴퍼니'
      }
    },
    _count: {
      applications: 5
    },
    likes: 45,
    category: 'beauty',
    hashtags: '#뷰티 #신제품 #런칭'
  },
  {
    id: 'campaign-2',
    title: '패션 브랜드 협업',
    description: 'SS 시즌 컬렉션 홍보',
    platform: 'youtube',
    budget: 8000000,
    targetFollowers: 50000,
    startDate: '2024-01-15',
    endDate: '2024-03-01',
    status: 'approved',
    imageUrl: '/images/campaign-2.jpg',
    business: {
      id: 'business-2',
      name: '패션 브랜드',
      businessProfile: {
        companyName: '패션 컴퍼니'
      }
    },
    _count: {
      applications: 12
    },
    likes: 120,
    category: 'fashion',
    hashtags: '#패션 #SS시즌 #신상품'
  },
  {
    id: 'campaign-3',
    title: '맛집 리뷰 캠페인',
    description: '새로운 레스토랑 오픈 홍보',
    platform: 'instagram',
    budget: 3000000,
    targetFollowers: 5000,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    status: 'approved',
    imageUrl: '/images/campaign-3.jpg',
    business: {
      id: 'business-3',
      name: '레스토랑',
      businessProfile: {
        companyName: '푸드 컴퍼니'
      }
    },
    _count: {
      applications: 8
    },
    likes: 88,
    category: 'food',
    hashtags: '#맛집 #레스토랑 #오픈이벤트'
  },
  {
    id: 'campaign-4',
    title: '테크 제품 리뷰',
    description: '신제품 가젯 리뷰 캠페인',
    platform: 'youtube',
    budget: 10000000,
    targetFollowers: 100000,
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    status: 'approved',
    imageUrl: '/images/campaign-4.jpg',
    business: {
      id: 'business-4',
      name: '테크 브랜드',
      businessProfile: {
        companyName: '테크 컴퍼니'
      }
    },
    _count: {
      applications: 15
    },
    likes: 150,
    category: 'tech',
    hashtags: '#테크 #가젯 #리뷰'
  },
  {
    id: 'campaign-5',
    title: '여행 콘텐츠 제작',
    description: '국내 여행지 홍보 캠페인',
    platform: 'instagram',
    budget: 6000000,
    targetFollowers: 20000,
    startDate: '2024-02-10',
    endDate: '2024-03-10',
    status: 'approved',
    imageUrl: '/images/campaign-5.jpg',
    business: {
      id: 'business-5',
      name: '여행사',
      businessProfile: {
        companyName: '트래블 컴퍼니'
      }
    },
    _count: {
      applications: 10
    },
    likes: 95,
    category: 'travel',
    hashtags: '#여행 #국내여행 #여행스타그램'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ACTIVE';
    const sortBy = searchParams.get('sortBy') || 'likes';
    const limit = parseInt(searchParams.get('limit') || '5');
    
    console.log('Loading simple campaigns with status:', status, 'sortBy:', sortBy, 'limit:', limit);

    // Mock 데이터 정렬
    let sortedCampaigns = [...mockCampaigns];
    
    if (sortBy === 'likes') {
      // 좋아요 수 기준 정렬
      sortedCampaigns.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'applications') {
      // 지원자 수 기준 정렬
      sortedCampaigns.sort((a, b) => b._count.applications - a._count.applications);
    } else if (sortBy === 'newest') {
      // 최신순 (이미 정렬되어 있음)
    }
    
    // limit 적용
    const campaigns = sortedCampaigns.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((campaign, index) => ({
        id: campaign.id,
        rank: index + 1,
        title: campaign.title,
        description: campaign.description,
        imageUrl: campaign.imageUrl,
        likes: campaign.likes,
        platform: campaign.platform,
        category: campaign.category,
        hashtags: campaign.hashtags,
        budget: campaign.budget,
        targetFollowers: campaign.targetFollowers,
        daysLeft: Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        applicantCount: campaign._count.applications,
        companyName: campaign.business.businessProfile.companyName
      })),
      total: campaigns.length
    });

  } catch (error) {
    console.error('Failed to load simple campaigns:', error);
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