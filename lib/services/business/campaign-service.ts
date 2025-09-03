import { prisma } from '@/lib/db';
import { translationService } from '../translation.service';

export interface CampaignFilters {
  status?: string;
  search?: string;
  mainCategory?: string;
  filter?: 'all' | 'popular' | 'deadline' | 'new';
  businessId?: string;
}

export interface CampaignData {
  businessId?: string;
  title: string;
  description: string;
  platform: string;
  budget: number;
  targetFollowers: number;
  startDate: string | Date;
  endDate: string | Date;
  requirements?: string;
  hashtags?: string | string[];
  imageUrl?: string;
  status?: string;
  category?: string;
  enableTranslation?: boolean;
}

export class CampaignService {
  // 캠페인 목록 조회 (관리자용)
  static async getAdminCampaigns(filters: CampaignFilters, pagination: { page: number; limit: number }) {
    const { status, search, mainCategory } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: unknown = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { business: { name: { contains: search, mode: 'insensitive' } } },
        { business: { businessProfile: { companyName: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    // 캠페인 조회
    const [allCampaigns, total] = await Promise.all([
      query({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              email: true,
              businessProfile: {
                select: {
                  companyName: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          },
          applications: {
            where: { status: 'APPROVED' },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      query({ where })
    ]);

    // mainCategory 필터링
    let filteredCampaigns = allCampaigns;
    if (mainCategory && mainCategory !== 'all') {
      filteredCampaigns = allCampaigns.filter(campaign => {
        const category = (campaign as unknown).category?.toLowerCase() || '';
        return this.matchesMainCategory(category, mainCategory);
      });
    }

    // 페이지네이션 적용
    const paginatedCampaigns = filteredCampaigns.slice(skip, skip + limit);
    const filteredTotal = filteredCampaigns.length;

    // 응답 데이터 포맷
    const formattedCampaigns = paginatedCampaigns.map(campaign => this.formatAdminCampaign(campaign));

    return {
      campaigns: formattedCampaigns,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit)
      }
    };
  }

  // 홈페이지용 캠페인 목록 조회
  static async getPublicCampaigns(filters: CampaignFilters, limit: number = 10) {
    const { filter = 'all' } = filters;

    let orderBy: unknown = { createdAt: 'desc' };
    let where: unknown = { status: 'APPROVED' }; // 승인된 캠페인만 표시

    switch (filter) {
      case 'popular':
        // 지원자 수 기준 (임시로 createdAt 사용)
        orderBy = { createdAt: 'desc' };
        break;
      case 'deadline':
        // 마감 임박순
        where.endDate = { gte: new Date() };
        orderBy = { endDate: 'asc' };
        break;
      case 'new':
        // 신규 캠페인
        orderBy = { createdAt: 'desc' };
        break;
    }

    const campaigns = await query({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            businessProfile: {
              select: {
                companyName: true
              }
            }
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy,
      take: limit
    });

    const formattedCampaigns = campaigns.map((campaign, index) => 
      this.formatPublicCampaign(campaign, index + 1)
    );

    return {
      success: true,
      campaigns: formattedCampaigns,
      total: formattedCampaigns.length
    };
  }

  // 캠페인 생성
  static async createCampaign(data: CampaignData) {
    const {
      businessId,
      title,
      description,
      platform,
      budget,
      targetFollowers,
      startDate,
      endDate,
      requirements,
      hashtags,
      imageUrl,
      status = 'PENDING',
      enableTranslation = false
    } = data;

    // 필수 필드 검증
    if (!businessId || !title || !description || !platform || !budget || !targetFollowers || !startDate || !endDate) {
      throw new Error('필수 정보가 누락되었습니다.');
    }

    // 자동 번역 수행
    let translatedData = {};
    if (enableTranslation && process.env.GOOGLE_TRANSLATE_API_KEY) {
      try {
        translatedData = await translationService.translateCampaignData({
          title,
          description,
          requirements: requirements || '',
          hashtags: Array.isArray(hashtags) ? hashtags.join(', ') : hashtags || ''
        });
      } catch (error) {

      }
    }

    // hashtags 처리
    const hashtagsString = Array.isArray(hashtags) 
      ? hashtags.join(', ') 
      : hashtags || null;

    // 캠페인 생성
    const campaign = await query({
      data: {
        businessId,
        title,
        description,
        platform: platform || 'general',
        budget: budget || 0,
        targetFollowers: targetFollowers || 0,
        requirements,
        hashtags: hashtagsString,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status.toUpperCase(),
        imageUrl,
        ...(Object.keys(translatedData).length > 0 && {
          translations: translatedData
        })
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      campaign: {
        ...campaign,
        startDate: campaign.startDate.toISOString().split('T')[0],
        endDate: campaign.endDate.toISOString().split('T')[0],
        status: campaign.status.toLowerCase()
      }
    };
  }

  // 캠페인 단일 조회
  static async getCampaignById(id: string, includeApplications = false) {
    const campaign = await query({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true,
            businessProfile: {
              select: {
                companyName: true
              }
            }
          }
        },
        ...(includeApplications && {
          applications: {
            include: {
              influencer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }),
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!campaign) {
      throw new Error('캠페인을 찾을 수 없습니다.');
    }

    return this.formatAdminCampaign(campaign);
  }

  // 캠페인 업데이트
  static async updateCampaign(id: string, data: Partial<CampaignData>) {
    const updateData: unknown = { ...data };

    // 날짜 변환
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // hashtags 처리
    if (updateData.hashtags) {
      updateData.hashtags = Array.isArray(updateData.hashtags) 
        ? updateData.hashtags.join(', ') 
        : updateData.hashtags;
    }

    // status 처리
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    const campaign = await query({
      where: { id },
      data: updateData,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      campaign: this.formatAdminCampaign(campaign)
    };
  }

  // 캠페인 삭제
  static async deleteCampaign(id: string) {
    await query({
      where: { id }
    });

    return { success: true };
  }

  // 캠페인 상태 변경
  static async updateCampaignStatus(id: string, status: string) {
    const campaign = await query({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      campaign: this.formatAdminCampaign(campaign)
    };
  }

  // 메인 카테고리 매칭
  private static matchesMainCategory(category: string, mainCategory: string): boolean {
    switch(mainCategory) {
      case '병원':
        return category.includes('병원') || category.includes('의료') || category.includes('치과') || category.includes('성형');
      case '구매평':
        return category.includes('리뷰') || category.includes('구매') || category.includes('후기');
      case '캠페인':
        return !category.includes('병원') && !category.includes('의료') && !category.includes('치과') && 
               !category.includes('성형') && !category.includes('리뷰') && !category.includes('구매') && !category.includes('후기');
      default:
        return true;
    }
  }

  // 관리자용 캠페인 데이터 포맷
  private static formatAdminCampaign(campaign: unknown) {
    let mainCategory = '캠페인';
    const category = campaign.category?.toLowerCase() || '';
    
    if (category.includes('병원') || category.includes('의료') || category.includes('치과') || category.includes('성형')) {
      mainCategory = '병원';
    } else if (category.includes('리뷰') || category.includes('구매') || category.includes('후기')) {
      mainCategory = '구매평';
    }
    
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      businessName: campaign.business?.businessProfile?.companyName || campaign.business?.name,
      businessEmail: campaign.business?.email,
      platform: campaign.platform,
      budget: campaign.budget,
      targetFollowers: campaign.targetFollowers,
      startDate: campaign.startDate?.toISOString()?.split('T')[0] || campaign.startDate,
      endDate: campaign.endDate?.toISOString()?.split('T')[0] || campaign.endDate,
      status: campaign.status?.toLowerCase() || 'pending',
      applicantCount: campaign._count?.applications || 0,
      selectedCount: campaign.applications?.length || 0,
      createdAt: campaign.createdAt?.toISOString()?.split('T')[0] || campaign.createdAt,
      imageUrl: campaign.imageUrl,
      hashtags: campaign.hashtags,
      requirements: campaign.requirements,
      isPaid: campaign.isPaid,
      platformFeeRate: campaign.platformFeeRate || 0.2,
      mainCategory: mainCategory,
      category: campaign.category || '패션'
    };
  }

  // 공개용 캠페인 데이터 포맷
  private static formatPublicCampaign(campaign: unknown, rank: number) {
    const now = new Date();
    const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      id: campaign.id,
      rank,
      title: campaign.title || '제목 없음',
      brand: campaign.business?.businessProfile?.companyName || campaign.business?.name || '업체명 미정',
      applicants: campaign._count?.applications || 0,
      maxApplicants: campaign.targetFollowers || 100,
      deadline: daysLeft,
      category: campaign.category || '기타',
      platforms: campaign.platform ? [campaign.platform.toLowerCase()] : ['instagram'],
      description: campaign.description || `${campaign.title} 마케팅 캠페인입니다.`,
      createdAt: campaign.createdAt,
      budget: campaign.budget ? `${campaign.budget.toLocaleString()}원` : '협의',
      imageUrl: campaign.imageUrl || '/placeholder-campaign.jpg'
    };
  }
}

export const campaignService = CampaignService;