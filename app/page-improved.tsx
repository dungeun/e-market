import { Suspense } from 'react';
import HomePageImproved from '@/components/HomePageImproved';
import { preloadHomePageData } from '@/lib/cache/preload-service';
import { cookies } from 'next/headers';

// ISR 설정 - 5분마다 재생성 (JSON 캐시 TTL과 동기화)
export const revalidate = 300;

// 정적 생성 우선
export const dynamic = 'force-static';
export const dynamicParams = true;

export default async function Page() {
  // 쿠키에서 초기 언어 설정 가져오기
  const cookieStore = cookies();
  const language = cookieStore.get('language')?.value || 'ko';
  const normalizedLang = language === 'ja' ? 'jp' : language;

  // 서버 사이드에서 데이터 프리로드
  const data = await preloadHomePageData();
  
  // JSON 캐시 프리페치 링크 헤더 추가
  const cacheUrls = [
    `/cache/products/products-${normalizedLang}-page-1.json`,
    `/cache/products/products-${normalizedLang}-page-2.json`,
    `/locales/ui-sections.json`
  ];

  return (
    <>
      {/* 캐시 프리페치 링크 */}
      {cacheUrls.map(url => (
        <link 
          key={url} 
          rel="prefetch" 
          href={url} 
          as="fetch"
          crossOrigin="anonymous"
        />
      ))}
      
      <Suspense 
        fallback={
          <div className="min-h-screen bg-white">
            <div className="max-w-[1450px] mx-auto px-6 py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-80 bg-gray-200 rounded-xl" />
                <div className="h-32 bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <HomePageImproved 
          initialLanguage={normalizedLang as 'ko' | 'en' | 'jp'} 
          preloadedData={data} 
        />
      </Suspense>
    </>
  );
}