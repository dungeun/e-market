'use client';

import React, { ReactNode, ReactElement } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

// 섹션 테마 타입
export type SectionTheme = 'light' | 'dark';

// 레이아웃 타입
export type LayoutType = 'grid' | 'carousel' | 'list';

// 그리드 컬럼 수
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;

// 헤더 설정
export interface SectionHeader {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  secondaryIcon?: LucideIcon;
  badge?: {
    text: string;
    color?: string;
  };
  centerAlign?: boolean;
}

// CTA 버튼 설정
export interface SectionCTA {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  external?: boolean;
}

// 로딩 스켈레톤 설정
export interface SkeletonConfig {
  count: number;
  height?: string;
  showHeader?: boolean;
}

// 빈 상태 설정
export interface EmptyState {
  message: string;
  description?: string;
  action?: SectionCTA;
}

// 메인 Props 인터페이스
export interface SectionLayoutProps {
  // 필수 Props
  children: ReactNode;
  
  // 레이아웃 설정
  layout?: LayoutType;
  columns?: GridColumns;
  gap?: number;
  theme?: SectionTheme;
  
  // 헤더 설정
  header?: SectionHeader;
  
  // CTA 버튼
  cta?: SectionCTA;
  
  // 상태 관리
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  
  // 스켈레톤/빈 상태
  skeleton?: SkeletonConfig;
  emptyState?: EmptyState;
  
  // 스타일링
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  
  // 반응형 설정
  responsive?: {
    mobile?: GridColumns;
    tablet?: GridColumns;
    desktop?: GridColumns;
  };
  
  // SEO 설정
  section?: {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
}

// 반응형 그리드 클래스 생성 (Tailwind Safe Classes)
const getGridClasses = (
  columns: GridColumns,
  responsive?: SectionLayoutProps['responsive']
): string => {
  const baseClass = `grid gap-6`;
  
  // Tailwind CSS safe classes mapping
  const gridColsMap: Record<GridColumns, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };
  
  const mdGridColsMap: Record<GridColumns, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3', 
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6'
  };
  
  const lgGridColsMap: Record<GridColumns, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4', 
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  };
  
  if (responsive) {
    const mobileClass = responsive.mobile ? gridColsMap[responsive.mobile] : 'grid-cols-1';
    const tabletClass = responsive.tablet ? mdGridColsMap[responsive.tablet] : mdGridColsMap[Math.min(columns, 3) as GridColumns];
    const desktopClass = responsive.desktop ? lgGridColsMap[responsive.desktop] : lgGridColsMap[columns];
    
    return `${baseClass} ${mobileClass} ${tabletClass} ${desktopClass}`;
  }
  
  // 기본 반응형 설정
  const defaultResponsive = {
    mobile: Math.min(columns, 2) as GridColumns,
    tablet: Math.min(columns, 3) as GridColumns,
    desktop: columns
  };
  
  return `${baseClass} ${gridColsMap[defaultResponsive.mobile]} ${mdGridColsMap[defaultResponsive.tablet]} ${lgGridColsMap[defaultResponsive.desktop]}`;
};

// 테마 클래스 가져오기
const getThemeClasses = (theme: SectionTheme) => {
  switch (theme) {
    case 'dark':
      return {
        section: 'bg-black text-white',
        title: 'text-white',
        subtitle: 'text-gray-300',
        description: 'text-gray-400',
        skeleton: 'bg-gray-800',
        empty: 'text-gray-400'
      };
    case 'light':
    default:
      return {
        section: 'bg-white text-gray-900',
        title: 'text-gray-900',
        subtitle: 'text-gray-600',
        description: 'text-gray-500',
        skeleton: 'bg-gray-200',
        empty: 'text-gray-500'
      };
  }
};

// CTA 버튼 스타일 가져오기
const getCTAClasses = (variant: SectionCTA['variant'] = 'primary', theme: SectionTheme) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors duration-200';
  
  if (theme === 'dark') {
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      case 'secondary':
        return `${baseClasses} bg-gray-700 text-white hover:bg-gray-600`;
      case 'outline':
        return `${baseClasses} border border-red-600 text-red-600 hover:bg-red-600 hover:text-white`;
      default:
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
    }
  } else {
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-black text-white hover:bg-gray-800`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`;
      case 'outline':
        return `${baseClasses} border border-red-600 text-red-600 hover:bg-red-600 hover:text-white`;
      default:
        return `${baseClasses} bg-black text-white hover:bg-gray-800`;
    }
  }
};

// 스켈레톤 컴포넌트
const SkeletonLoader: React.FC<{
  config: SkeletonConfig;
  columns: GridColumns;
  theme: SectionTheme;
  responsive?: SectionLayoutProps['responsive'];
}> = ({ config, columns, theme, responsive }) => {
  const themeClasses = getThemeClasses(theme);
  const gridClasses = getGridClasses(columns, responsive);

  return (
    <>
      {config.showHeader && (
        <div className="text-center mb-8">
          <div className="animate-pulse space-y-4">
            <div className={`h-8 ${themeClasses.skeleton} rounded w-64 mx-auto`} />
            <div className={`h-4 ${themeClasses.skeleton} rounded w-96 mx-auto`} />
          </div>
        </div>
      )}
      <div className={gridClasses}>
        {Array.from({ length: config.count }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div 
              className={`${themeClasses.skeleton} rounded-lg`}
              style={{ height: config.height || '300px' }}
            />
            <div className={`mt-3 h-4 ${themeClasses.skeleton} rounded w-3/4`} />
            <div className={`mt-2 h-4 ${themeClasses.skeleton} rounded w-1/2`} />
          </div>
        ))}
      </div>
    </>
  );
};

// 빈 상태 컴포넌트
const EmptyStateComponent: React.FC<{
  config: EmptyState;
  theme: SectionTheme;
}> = ({ config, theme }) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="text-center py-12">
      <p className={`text-lg ${themeClasses.empty} mb-2`}>
        {config.message}
      </p>
      {config.description && (
        <p className={`text-sm ${themeClasses.description} mb-4`}>
          {config.description}
        </p>
      )}
      {config.action && (
        <Link
          href={config.action.href}
          className={getCTAClasses(config.action.variant, theme)}
        >
          {config.action.text}
        </Link>
      )}
    </div>
  );
};

// 헤더 컴포넌트
const SectionHeaderComponent: React.FC<{
  header: SectionHeader;
  theme: SectionTheme;
}> = ({ header, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const alignment = header.centerAlign !== false ? 'text-center' : 'text-left';

  return (
    <div className={`mb-8 ${alignment}`}>
      {/* 제목과 아이콘 */}
      <div className="flex items-center justify-center gap-3 mb-2">
        {header.icon && (
          <header.icon 
            className="w-8 h-8 text-red-500" 
            aria-hidden="true"
          />
        )}
        {header.title && (
          <h2 className={`text-3xl font-bold ${themeClasses.title}`}>
            {header.title}
          </h2>
        )}
        {header.secondaryIcon && (
          <header.secondaryIcon 
            className="w-8 h-8 text-red-500" 
            aria-hidden="true"
          />
        )}
      </div>

      {/* 부제목 */}
      {header.subtitle && (
        <p className={`text-lg ${themeClasses.subtitle} mb-2`}>
          {header.subtitle}
        </p>
      )}

      {/* 설명 */}
      {header.description && (
        <p className={`${themeClasses.description}`}>
          {header.description}
        </p>
      )}

      {/* 뱃지 */}
      {header.badge && (
        <div className="mt-3">
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: header.badge.color || '#ef4444' }}
          >
            {header.badge.text}
          </span>
        </div>
      )}
    </div>
  );
};

// 메인 SectionLayout 컴포넌트
const SectionLayout: React.FC<SectionLayoutProps> = ({
  children,
  layout = 'grid',
  columns = 4,
  gap = 6,
  theme = 'light',
  header,
  cta,
  loading = false,
  error = null,
  empty = false,
  skeleton,
  emptyState,
  className = '',
  containerClassName = '',
  contentClassName = '',
  responsive,
  section,
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // 기본 스켈레톤 설정
  const defaultSkeleton: SkeletonConfig = {
    count: columns,
    height: '300px',
    showHeader: !!header,
    ...skeleton
  };

  // 기본 빈 상태 설정
  const defaultEmptyState: EmptyState = {
    message: '표시할 내용이 없습니다.',
    description: '나중에 다시 시도해주세요.',
    ...emptyState
  };

  // 그리드 클래스 생성
  const gridClasses = layout === 'grid' ? getGridClasses(columns, responsive) : '';

  return (
    <section 
      className={`py-12 px-4 ${themeClasses.section} ${className}`}
      {...section}
    >
      <div className={`max-w-7xl mx-auto ${containerClassName}`}>
        {/* 헤더 */}
        {header && !loading && (
          <SectionHeaderComponent 
            header={header} 
            theme={theme} 
          />
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">오류가 발생했습니다</p>
            <p className={themeClasses.description}>{error}</p>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && !error && (
          <SkeletonLoader 
            config={defaultSkeleton}
            columns={columns}
            theme={theme}
            responsive={responsive}
          />
        )}

        {/* 빈 상태 */}
        {empty && !loading && !error && (
          <EmptyStateComponent 
            config={defaultEmptyState}
            theme={theme}
          />
        )}

        {/* 실제 콘텐츠 */}
        {!loading && !error && !empty && (
          <div className={`${contentClassName}`}>
            {layout === 'grid' && (
              <div className={gridClasses} style={{ gap: `${gap * 0.25}rem` }}>
                {children}
              </div>
            )}
            {layout === 'carousel' && (
              <div className="relative">
                <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                  {React.Children.map(children, (child, index) => (
                    <div key={index} className="flex-none w-72 snap-start">
                      {child}
                    </div>
                  ))}
                </div>
                {/* 스크롤 힌트 - 테마별 */}
                <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l pointer-events-none ${
                  theme === 'dark' 
                    ? 'from-black via-black/80 to-transparent' 
                    : 'from-white via-white/80 to-transparent'
                }`} />
              </div>
            )}
            {layout === 'list' && (
              <div className="space-y-6">
                {children}
              </div>
            )}
          </div>
        )}

        {/* CTA 버튼 */}
        {cta && !loading && !error && (
          <div className="text-center mt-8">
            <Link
              href={cta.href}
              className={getCTAClasses(cta.variant, theme)}
              {...(cta.external && { 
                target: '_blank', 
                rel: 'noopener noreferrer' 
              })}
            >
              {cta.text}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default SectionLayout;