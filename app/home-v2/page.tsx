import { Suspense } from 'react';
import HomePage from '@/components/HomePage';
import { preloadHomePageData } from '@/lib/cache/preload-service';

// ISR 설정 - 1분마다 재생성
export const revalidate = 60;

// 동적 컴포넌트 로딩을 위한 설정
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function HomeV2Page() {
  // 서버 사이드에서 데이터 프리로드
  const data = await preloadHomePageData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage preloadedData={data} />
    </Suspense>
  );
}