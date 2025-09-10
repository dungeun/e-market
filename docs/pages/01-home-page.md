# 📖 페이지 백과사전: / (홈페이지)
*파일: /app/page.tsx*

## 🎯 페이지 메타데이터
```yaml
파일경로: /app/page.tsx
페이지경로: /
파일크기: 65줄
컴포넌트명: Page (default export)
렌더링모드: 'force-dynamic' (SSR)
ISR설정: revalidate = 300 (5분)
최종수정: 현재 버전
```

## 📦 Import 의존성

### React/Next.js 핵심
```typescript
import { Suspense } from 'react'              // React Suspense 바운더리
import { cookies } from 'next/headers'        // Next.js 쿠키 접근
```

### 내부 컴포넌트
```typescript
import HomePageImproved from '@/components/HomePageImproved'  // 메인 홈페이지 컴포넌트
```

### 내부 서비스
```typescript
import { preloadHomePageData } from '@/lib/cache/preload-service'  // 데이터 프리로드 서비스
```

## 🔧 Export 설정

### Next.js 렌더링 설정
```typescript
export const revalidate = 300         // ISR: 5분마다 재생성 (라인 7)
export const dynamic = 'force-dynamic'  // 동적 렌더링 강제 (라인 10)
export const dynamicParams = true       // 동적 파라미터 허용 (라인 11)
```

## 📌 하드코딩된 상수값

### 숫자 상수
```typescript
300    // 라인 7: ISR 재검증 시간 (초)
1450   // 라인 44: 최대 너비 (max-w-[1450px])
6      // 라인 44: 패딩 X (px-6)
8      // 라인 44: 패딩 Y (py-8)
80     // 라인 46: 스켈레톤 높이 (h-80)
32     // 라인 47: 스켈레톤 높이 (h-32)
64     // 라인 50: 스켈레톤 카드 높이 (h-64)
2      // 라인 48: 모바일 그리드 컬럼 (grid-cols-2)
4      // 라인 48: 데스크톱 그리드 컬럼 (md:grid-cols-4)
8      // 라인 49: 스켈레톤 카드 개수 ([...Array(8)])
```

### 문자열 상수
```typescript
'ko'       // 라인 16: 기본 언어
'ja'       // 라인 17: 일본어 코드 (변환 전)
'jp'       // 라인 17: 일본어 코드 (변환 후)
'language' // 라인 16: 쿠키 키 이름
```

### 캐시 URL 패턴
```typescript
`/cache/products/products-${normalizedLang}-page-1.json`  // 라인 24
`/cache/products/products-${normalizedLang}-page-2.json`  // 라인 25
```

## 🎨 CSS 클래스 (Tailwind)

### 컨테이너 클래스
```css
min-h-screen                     /* 최소 높이 전체 화면 */
bg-white dark:bg-gray-900       /* 라이트/다크 모드 배경 */
transition-colors                /* 색상 전환 애니메이션 */
max-w-[1450px]                  /* 최대 너비 1450px */
mx-auto                         /* 수평 중앙 정렬 */
px-6 py-8                       /* 패딩 */
```

### 스켈레톤 로딩 클래스
```css
animate-pulse                    /* 펄스 애니메이션 */
space-y-4                       /* 수직 간격 */
bg-gray-200 dark:bg-gray-700   /* 스켈레톤 배경색 */
rounded-xl                      /* 둥근 모서리 */
h-80, h-32, h-64               /* 높이 설정 */
grid grid-cols-2 md:grid-cols-4 /* 반응형 그리드 */
gap-4                           /* 그리드 간격 */
```

## 🔧 컴포넌트 로직

### 비동기 서버 컴포넌트
```typescript
export default async function Page() {
  // 비동기 RSC (React Server Component)
  // 서버에서 실행되어 HTML 생성
}
```

### 언어 설정 로직
```typescript
// 라인 14-17
const cookieStore = await cookies()                    // 쿠키 스토어 접근
const language = cookieStore.get('language')?.value || 'ko'  // 언어 쿠키 읽기
const normalizedLang = language === 'ja' ? 'jp' : language   // ja → jp 변환
```

### 데이터 프리로드
```typescript
// 라인 20
const data = await preloadHomePageData()  // 서버에서 데이터 미리 로드
```

### 캐시 URL 생성
```typescript
// 라인 23-26
const cacheUrls = [
  `/cache/products/products-${normalizedLang}-page-1.json`,
  `/cache/products/products-${normalizedLang}-page-2.json`
]
```

## 🎯 함수 및 메소드

### Page 컴포넌트 (메인 함수)
```typescript
async function Page(): Promise<JSX.Element>
// 역할: 홈페이지 렌더링
// 비동기: 서버 사이드 데이터 페칭
// 반환: JSX 엘리먼트
```

### 외부 함수 호출
```typescript
cookies()                 // Next.js 쿠키 접근 함수
preloadHomePageData()     // 데이터 프리로드 함수
```

## 🏗️ JSX 구조

### 최상위 Fragment
```jsx
<>
  {/* 프리페치 링크들 */}
  {/* Suspense 래퍼 */}
</>
```

### 프리페치 링크 생성
```jsx
{cacheUrls.map(url => (
  <link 
    key={url}                    // React 키
    rel="prefetch"               // 프리페치 관계
    href={url}                   // 캐시 URL
    as="fetch"                   // 페치 리소스로
    crossOrigin="anonymous"      // CORS 설정
  />
))}
```

### Suspense 바운더리
```jsx
<Suspense 
  fallback={/* 로딩 UI */}
>
  <HomePageImproved 
    initialLanguage={normalizedLang as 'ko' | 'en' | 'jp'} 
    preloadedData={data} 
  />
</Suspense>
```

### 로딩 스켈레톤 UI
```jsx
<div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
  <div className="max-w-[1450px] mx-auto px-6 py-8">
    <div className="animate-pulse space-y-4">
      <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
</div>
```

## 📊 Props 전달

### HomePageImproved Props
```typescript
initialLanguage: 'ko' | 'en' | 'jp'  // 타입 캐스팅된 언어 코드
preloadedData: data                   // 프리로드된 데이터
```

## 🔄 데이터 흐름

```
1. 쿠키에서 언어 설정 읽기
   ↓
2. 언어 정규화 (ja → jp)
   ↓
3. preloadHomePageData() 호출
   ↓
4. 캐시 URL 생성
   ↓
5. 프리페치 링크 렌더링
   ↓
6. Suspense 바운더리 설정
   ↓
7. HomePageImproved 컴포넌트 렌더링
```

## ⚙️ Next.js 특수 기능

### ISR (Incremental Static Regeneration)
- `revalidate = 300`: 5분마다 페이지 재생성
- 주석: "JSON 캐시 TTL과 동기화"

### 동적 렌더링
- `dynamic = 'force-dynamic'`: 강제 SSR
- 주석: "임시로 동적 렌더링으로 변경하여 빌드 에러 방지"

### 리소스 프리페치
- `<link rel="prefetch">`: 브라우저 캐시 프리로드
- 캐시 파일 미리 다운로드

## 🛡️ 타입 안전성

### 타입 캐스팅
```typescript
normalizedLang as 'ko' | 'en' | 'jp'  // 명시적 타입 지정
```

### 옵셔널 체이닝
```typescript
cookieStore.get('language')?.value || 'ko'  // 안전한 접근
```

## 📝 주석 분석

```typescript
// ISR 설정 - 5분마다 재생성 (JSON 캐시 TTL과 동기화)  // 라인 6
// 임시로 동적 렌더링으로 변경하여 빌드 에러 방지      // 라인 9
// 쿠키에서 초기 언어 설정 가져오기                   // 라인 14
// 서버 사이드에서 데이터 프리로드                    // 라인 19
// JSON 캐시 프리페치 링크 헤더 추가                 // 라인 22
/* 캐시 프리페치 링크 */                           // 라인 30
```

## 🔍 특이사항 및 주의점

1. **빌드 에러 회피**: force-dynamic 설정으로 빌드 문제 임시 해결
2. **언어 코드 변환**: ja → jp 변환 로직 존재
3. **캐시 전략**: 클라이언트/서버 캐시 동기화
4. **하드코딩된 페이지**: page-1, page-2만 프리페치

## 🔄 의존성 관계

```
page.tsx
  ↓
HomePageImproved (컴포넌트)
  ↓
preloadHomePageData (서비스)
  ↓
캐시 JSON 파일들
```

---

*이 문서는 홈페이지(/)의 완전한 역설계 매뉴얼입니다.*