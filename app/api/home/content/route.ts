// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'faq' 또는 'testimonials'

    if (type === 'faq') {
      // FAQ 데이터 조회
      const faqs = await query({
        where: {
          key: {
            startsWith: 'faq_'
          }
        },
        orderBy: {
          key: 'asc'
        }
      });

      const faqItems = faqs.map(faq => {
        try {
          const data = JSON.parse(faq.value);
          return {
            question: data.question,
            answer: data.answer,
            order: data.order || 0
          };
        } catch {
          return null;
        }
      }).filter(Boolean).sort((a, b) => a.order - b.order);

      // FAQ가 없으면 기본 FAQ 반환
      if (faqItems.length === 0) {
        const defaultFaq = [
          {
            question: "E-Market Korea는 어떤 서비스인가요?",
            answer: "E-Market Korea는 한국에서 생활하는 외국인 노동자들을 위한 중고 거래 플랫폼입니다. 필수 생활용품을 합리적인 가격에 구매할 수 있습니다.",
            order: 1
          },
          {
            question: "어떤 상품을 거래할 수 있나요?",
            answer: "TV, 냉장고, 세탁기, 스마트폰, 노트북, 침대, 책상 등 외국인 노동자들에게 필요한 생활필수품을 거래할 수 있습니다.",
            order: 2
          },
          {
            question: "상품 상태는 어떻게 분류되나요?",
            answer: "S급(새제품), A급(사용감 적음), B급(사용감 있음), C급(사용감 많음)으로 분류하여 명확한 상품 정보를 제공합니다.",
            order: 3
          },
          {
            question: "캠페인 진행 과정은 어떻게 되나요?",
            answer: "캠페인 등록 → 인플루언서 매칭 → 협의 및 계약 → 콘텐츠 제작 → 성과 측정의 5단계로 진행됩니다.",
            order: 4
          }
        ];
        
        return NextResponse.json({
          success: true,
          faq: defaultFaq
        });
      }

      return NextResponse.json({
        success: true,
        faq: faqItems
      });
    }

    if (type === 'testimonials') {
      // 성공 사례 데이터 조회 (실제 사용자 리뷰 기반)
      const testimonials = await query({
        where: {
          key: {
            startsWith: 'testimonial_'
          }
        },
        orderBy: {
          key: 'asc'
        }
      });

      const testimonialItems = testimonials.map(testimonial => {
        try {
          const data = JSON.parse(testimonial.value);
          return {
            name: data.name,
            role: data.role,
            content: data.content,
            rating: data.rating || 5,
            avatar: data.avatar,
            order: data.order || 0
          };
        } catch {
          return null;
        }
      }).filter(Boolean).sort((a, b) => a.order - b.order);

      // 기본 성공 사례가 없으면 기본값 반환
      if (testimonialItems.length === 0) {
        const defaultTestimonials = [
          {
            name: "뷰티브랜드 A",
            role: "코스메틱 브랜드",
            content: "E-Market Korea에서 냉장고와 세탁기를 합리적인 가격에 구매했습니다. 상품 상태도 설명과 정확히 일치해서 매우 만족해요!",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
            order: 1
          },
          {
            name: "@lifestyle_kim",
            role: "라이프스타일 인플루언서",
            content: "다양한 브랜드와 협업하면서 월 수익이 3배 늘었습니다. 투명한 정산 시스템이 정말 만족스러워요.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616c9c3e0e6?w=60&h=60&fit=crop&crop=face",
            order: 2
          },
          {
            name: "테크기업 B",
            role: "IT 스타트업",
            content: "신제품 런칭 캠페인에서 목표 대비 150% 달성! AI 매칭으로 정확한 타겟팅이 가능했습니다.",
            rating: 5,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
            order: 3
          }
        ];

        return NextResponse.json({
          success: true,
          testimonials: defaultTestimonials
        });
      }

      return NextResponse.json({
        success: true,
        testimonials: testimonialItems
      });
    }

    // 모든 콘텐츠 반환
    const [faqResult, testimonialResult] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/home/content?type=faq`).then(r => r.json()),
      fetch(`${request.nextUrl.origin}/api/home/content?type=testimonials`).then(r => r.json())
    ]);

    return NextResponse.json({
      success: true,
      faq: faqResult.faq || [],
      testimonials: testimonialResult.testimonials || []
    });

  } catch (error) {

    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}