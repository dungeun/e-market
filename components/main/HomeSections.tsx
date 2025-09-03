"use client";

import { ReactNode, useMemo, memo } from "react";
import { useOptimizedUILocalization } from "@/hooks/useOptimizedUILocalization";

interface HomeSectionsProps {
  children: {
    hero?: ReactNode;
    category?: ReactNode;
    quicklinks?: ReactNode;
    promo?: ReactNode;
    ranking?: ReactNode;
    recommended?: ReactNode;
    featuredProducts?: ReactNode;
    'featured-products'?: ReactNode;
    products?: ReactNode;
    custom?: Record<string, ReactNode>;
    [key: string]: ReactNode | Record<string, ReactNode> | undefined;
  };
  sectionOrder?: string[];
}

function HomeSectionsComponent({ children, sectionOrder }: HomeSectionsProps) {
  const { sectionOrder: optimizedSectionOrder, sections, isLoading, isError } = useOptimizedUILocalization({
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5 * 60 * 1000 // 5분 캐싱
  });

  // 기본 섹션 순서 - 메모이제이션
  const defaultSectionOrder = useMemo(
    () => [
      { id: "hero", type: "hero", order: 1, visible: true },
      { id: "category", type: "category", order: 2, visible: true },
      { id: "quicklinks", type: "quicklinks", order: 3, visible: true },
      { id: "promo", type: "promo", order: 4, visible: true },
      { id: "featured-products", type: "featuredProducts", order: 5, visible: true },
      { id: "ranking", type: "ranking", order: 6, visible: true },
    ],
    [],
  );

  // 최적화된 섹션 순서 사용 - 중복 제거 로직 추가
  const sectionsToShow = useMemo(() => {
    let finalSections = [];

    // props로 전달된 sectionOrder가 있으면 우선 사용
    if (sectionOrder && Array.isArray(sectionOrder)) {
      finalSections = sectionOrder.map((id, index) => ({
        id,
        type: id === "featured-products" ? "featuredProducts" : id,
        order: index + 1,
        visible: true,
      }));
    }
    // 최적화된 UI 국제화 데이터에서 가져온 섹션 순서 사용
    else if (optimizedSectionOrder && optimizedSectionOrder.length > 0) {
      finalSections = optimizedSectionOrder.map((id, index) => ({
        id,
        type: id === "featured-products" ? "featuredProducts" : id,
        order: index + 1,
        visible: sections.find(s => s.id === id)?.visible !== false,
      }));
    }
    // 폴백: 기본 섹션 순서
    else {
      finalSections = defaultSectionOrder;
    }

    // 중복 키 제거 - id 기준으로 중복 제거
    const uniqueSections = finalSections.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.id === current.id);
      if (existingIndex === -1) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueSections;
  }, [sectionOrder, optimizedSectionOrder, sections, defaultSectionOrder]);

  // 표시할 섹션만 필터링하고 순서대로 정렬 - 메모이제이션
  const visibleSections = useMemo(() => {
    return sectionsToShow
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order);
  }, [sectionsToShow]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <div className="bg-white">
        <div className="flex justify-center items-center py-20">
          <div className="text-red-600">
            섹션 데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  // 각 섹션 렌더링
  return (
    <div className="bg-white">
      {visibleSections.map((section) => {
        let sectionContent = null;
        
        // section.id를 사용하여 children에서 찾기 (JSON의 실제 키와 매칭)
        switch (section.id) {
          case "hero":
            sectionContent = children.hero || null;
            break;
          case "category":
            sectionContent = children.category || null;
            break;
          case "quicklinks":
            sectionContent = children.quicklinks || null;
            break;
          case "promo":
            sectionContent = children.promo || null;
            break;
          case "ranking":
            sectionContent = children.ranking || null;
            break;
          case "recommended":
            sectionContent = children.recommended || null;
            break;
          case "featured-products":
            // featured-products는 여러 형태로 올 수 있음
            sectionContent = children['featured-products'] || children.featuredProducts || children.products || null;
            break;
          case "products":
            sectionContent = children.products || null;
            break;
          case "featuredProducts":
            sectionContent = children.featuredProducts || null;
            break;
          default:
            // custom 섹션이나 알 수 없는 섹션 처리
            sectionContent = children.custom?.[section.id] || children[section.id] || null;
        }

        return sectionContent ? (
          <div key={`section-${section.id}-${section.order}`} className="section-container">
            {sectionContent}
          </div>
        ) : null;
      })}
    </div>
  );
}

// React.memo로 성능 최적화
export const HomeSections = memo(HomeSectionsComponent);