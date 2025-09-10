# 🌐 언어팩 구조 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 언어팩 시스템 개요
```yaml
언어팩 시스템: 3단계 캐싱 + 관리자 제어 동적 언어 지원
지원 언어: 관리자가 선택한 언어 (최대 3개)
캐시 구조: 메모리 → Redis → 데이터베이스
렌더링: SSR/ISR 지원
특화: 해외 노동자 대상 다국어 UI
```

## 🏗️ 시스템 아키텍처

### 1. 데이터베이스 계층 (PostgreSQL)

#### 동적 언어 관리 시스템

**핵심 특징**: 관리자가 언어를 선택하고 관리하는 동적 시스템
- 언어 개수: 관리자가 설정 (권장 3개)
- 언어 코드: ISO 639-1 표준 코드 사용
- 기본 언어: 관리자가 지정

#### language_pack_keys 테이블
```sql
CREATE TABLE language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    component_id VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**컴포넌트 타입**:
- `menu` - 네비게이션 메뉴
- `page` - 페이지 컨텐츠  
- `form` - 폼 라벨/메시지
- `error` - 에러 메시지
- `common` - 공통 텍스트
- `product` - 상품 관련
- `auth` - 인증 관련

#### language_pack_translations 테이블
```sql
CREATE TABLE language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);
```

**동적 언어 코드 시스템**:
- `language_code` 필드에 관리자가 선택한 언어 코드 저장
- ISO 639-1 표준 (예: ko, en, ja, zh, de, fr 등)
- 관리자 패널에서 실시간 언어 추가/제거 가능
- 각 키마다 관리자가 선택한 언어로만 번역 데이터 생성

### 2. 캐시 계층 (3단계 시스템)

#### 메모리 캐시 (Level 1)
```typescript
// lib/cache/language-cache.ts
const memoryCache = new Map<string, CacheData>();
const MEMORY_TTL = 5 * 60 * 1000; // 5분

interface CacheData {
  data: LanguagePackData[];
  timestamp: number;
}
```

**특징**:
- 응답시간: < 1ms
- 용량 제한: 100개 키
- 자동 만료: 5분
- LRU 정책 적용

#### Redis 캐시 (Level 2)
```typescript
const REDIS_TTL = 30 * 60; // 30분
const REDIS_KEY_PREFIX = 'language:packs:';

// 키 패턴
'language:packs:all' - 전체 언어팩
'language:packs:category:menu' - 메뉴 카테고리
'language:packs:category:common' - 공통 카테고리
```

**특징**:
- 응답시간: < 10ms
- TTL: 30분
- 자동 무효화 지원
- 배치 작업 최적화

#### 데이터베이스 (Level 3)
```typescript
// lib/cache/language-packs.ts - 실제 구현
const sql = `
  SELECT 
    lpk.key_name as key,
    lpk.key_name as full_key,
    lpt.language_code,
    lpt.translation as value,
    lpk.component_type as category,
    lpk.description
  FROM language_pack_keys lpk
  JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
  WHERE lpk.is_active = true
`;
```

**특징**:
- 응답시간: < 50ms (타임아웃 3초)
- 완전 동적 언어 지원
- 관리자 제어 언어 시스템
- 실시간 번역 업데이트

### 3. 서비스 계층

#### getCachedLanguagePacks 서비스
```typescript
// lib/cache/language-packs.ts - 실제 구현
export async function getCachedLanguagePacks(): Promise<
  Record<string, LanguagePack>
> {
  // 캐시 확인 (10분 TTL)
  if (cachedLanguagePacks && now - cacheTimestamp < CACHE_TTL) {
    return cachedLanguagePacks;
  }

  // 데이터베이스에서 동적으로 언어팩 조회
  const result = await query(sql);
  const packs = result.rows;

  // 키-값 형태로 변환 - 언어별로 그룹화
  const languagePacks = packs.reduce(
    (acc, pack) => {
      const fullKey = pack.key;
      const langCode = pack.language_code;
      
      if (!acc[fullKey]) {
        acc[fullKey] = {
          id: fullKey,
          key: fullKey,
          ko: '', en: '', ja: '', // 동적으로 확장 가능
          category: pack.category || 'general',
          description: pack.description || undefined,
        };
      }
      
      // 관리자가 설정한 언어에 따라 동적 할당
      acc[fullKey][langCode] = pack.value || '';
      
      return acc;
    },
    {} as Record<string, LanguagePack>
  );

  return languagePacks;
}
```

#### Language Manager (통합 관리)
```typescript
// lib/services/language-manager.ts
export class LanguageManager {
  async getLanguagePack(category?: string): Promise<LanguagePackData[]>
  async createLanguagePackKey(key: LanguagePackKey): Promise<void>
  async updateTranslation(keyId: number, languageCode: string, translation: string): Promise<void>
  async syncAllLanguages(): Promise<SyncResult>
}
```

### 4. 프리로딩 시스템

#### PreloadService (홈페이지 최적화)
```typescript
// lib/cache/preload-service.ts - 실제 구현
async function getLanguagePacks(): Promise<Record<string, Record<string, string>>> {
  try {
    // 캐시된 언어팩 가져오기
    const cachedPacks = await getCachedLanguagePacks();
    
    // 언어별로 그룹화 (관리자가 선택한 언어에 따라 동적)
    const grouped: Record<string, Record<string, string>> = {};
    
    // 모든 언어 코드를 동적으로 수집
    const allLanguageCodes = new Set<string>();
    Object.values(cachedPacks).forEach(pack => {
      Object.keys(pack).forEach(key => {
        if (key !== 'id' && key !== 'key' && key !== 'category' && key !== 'description') {
          allLanguageCodes.add(key);
        }
      });
    });
    
    // 동적 언어 그룹 생성
    allLanguageCodes.forEach(langCode => {
      grouped[langCode] = {};
    });
    
    // 캐시된 언어팩을 언어별로 변환
    for (const [key, pack] of Object.entries(cachedPacks)) {
      allLanguageCodes.forEach(langCode => {
        if (pack[langCode]) {
          grouped[langCode][key] = pack[langCode];
        }
      });
    }
    
    return grouped;
  } catch (error) {
    // 오류 시 빈 객체 반환
    return {};
  }
}
```

**프리로딩 전략**:
1. 동적 언어팩 우선 로드 (관리자 설정 기반)
2. UI 섹션 설정 로드
3. 상품/카테고리 데이터 로드
4. 메모리 캐시 저장 (5분 TTL)

## 🔄 언어 감지 및 설정

### 동적 언어 감지 시스템

```typescript
// 관리자가 설정한 언어 목록을 기반으로 동적 감지
export function detectLanguage(request: NextRequest, availableLanguages: string[]): string {
  // 1. URL 파라미터 체크 (?lang=selected_language)
  // 2. Accept-Language 헤더 체크
  // 3. Cookie 체크 (language=selected_language)
  // 4. 기본값: 관리자가 설정한 기본 언어
  
  // 사용자 요청 언어가 관리자 설정 언어 목록에 있는지 확인
  const requestedLanguage = getRequestedLanguage(request);
  return availableLanguages.includes(requestedLanguage) 
    ? requestedLanguage 
    : getDefaultLanguage();
}
```

**동적 매핑 시스템**:
- 관리자가 설정한 언어만 지원
- ISO 639-1 표준 코드 기반
- 런타임에 언어 목록 동적 조회

### 동적 번역 데이터 구조
```typescript
interface LanguagePack {
  id: string;
  key: string;
  ko: string;
  en: string;
  ja: string;
  // 동적으로 확장 가능 - 관리자가 추가한 언어에 따라
  [dynamicLanguageCode: string]: string;
  category: string;
  description?: string;
}

// 실제 사용 시 동적 언어 접근
const getTranslation = (pack: LanguagePack, langCode: string): string => {
  return pack[langCode] || pack[getDefaultLanguage()] || pack.key;
};
```

## 📁 파일 시스템 구조

### 정적 UI 텍스트 파일 구조
```
public/
└── cache/
    └── ui-texts.json (정적 UI 텍스트용 - 기본값)
```

**주의**: 주요 언어팩 데이터는 데이터베이스에서 동적으로 관리됨
- `language_pack_keys` 테이블: 번역 키 관리
- `language_pack_translations` 테이블: 실제 번역 데이터
- 파일 시스템은 fallback 정적 텍스트만 보관

### 서비스 파일 구조
```
lib/
├── cache/
│   ├── language-packs.ts (주요 언어팩 캐싱 서비스)
│   └── preload-service.ts (홈페이지 프리로딩)
├── db.ts (데이터베이스 연결)
└── logger.ts (로깅)
```

**핵심 파일**:
- `language-packs.ts`: 데이터베이스 기반 동적 언어팩 관리
- `preload-service.ts`: 언어팩 포함 홈페이지 데이터 프리로딩

## 🎯 사용 패턴

### 1. 서버 사이드 렌더링 (SSR)
```typescript
// 페이지 컴포넌트에서
export default async function HomePage() {
  const preloadedData = await preloadHomePageData();
  const { languagePacks, sections } = preloadedData;
  
  return <DynamicHomepage 
    languagePacks={languagePacks}
    sections={sections}
  />;
}
```

### 2. 동적 클라이언트 사이드 사용
```typescript
// 컴포넌트에서 동적 번역 사용
function ProductCard({ product, languagePacks, availableLanguages, defaultLanguage }) {
  const t = (key: string, lang?: string) => {
    const targetLang = lang || getCurrentLanguage();
    
    // 관리자가 설정한 언어 중에서만 번역 제공
    if (!availableLanguages.includes(targetLang)) {
      return languagePacks[defaultLanguage]?.[key] || key;
    }
    
    return languagePacks[targetLang]?.[key] || 
           languagePacks[defaultLanguage]?.[key] || 
           key;
  };
  
  return (
    <div>
      <h3>{t('product.name')}</h3>
      <p>{t('product.price')}</p>
    </div>
  );
}
```

### 3. 캠페인 번역 패턴
```typescript
// 캠페인 데이터 번역
export function getTranslatedCampaignData(
  campaign: unknown,
  language: SupportedLanguage
) {
  if (campaign.campaignTranslations?.length > 0) {
    const translation = campaign.campaignTranslations.find(
      (t: unknown) => t.language === language
    );
    
    return {
      ...campaign,
      title: translation?.title || campaign.title,
      description: translation?.description || campaign.description
    };
  }
  
  return campaign;
}
```

## ⚙️ 관리자 제어 언어 시스템

### 관리자 언어팩 관리 워크플로우

1. **언어 설정**: 관리자가 지원할 언어 선택 (예: ko, en, fr)
2. **키 생성**: `language_pack_keys` 테이블에 번역 키 추가
3. **번역 추가**: 선택된 각 언어에 대해 `language_pack_translations`에 번역 데이터 추가
4. **실시간 반영**: 캐시 무효화 후 즉시 웹사이트에 반영

### 동적 번역 키 생성
```typescript
// 관리자가 선택한 언어에만 번역 생성
const selectedLanguages = await getSelectedLanguages(); // ['ko', 'en', 'fr']

await createLanguagePackKey({
  keyName: 'product.add_to_cart',
  componentType: 'common',
  description: '장바구니 추가 버튼'
});

// 관리자가 선택한 각 언어에 번역 추가
for (const langCode of selectedLanguages) {
  await addTranslation(keyId, langCode, getTranslationForLanguage(langCode));
}
```

### 동적 번역 업데이트
```typescript
// 특정 언어의 번역 수정
await updateTranslation(keyId, languageCode, newTranslation);

// 새로운 언어 추가 시
await addLanguageToSystem(newLanguageCode);
await addTranslationsForNewLanguage(newLanguageCode);
```

### 캐시 관리
```typescript
// lib/cache/language-packs.ts - 실제 구현
export function invalidateLanguagePacksCache(): void {
  cachedLanguagePacks = null;
  cacheTimestamp = 0;
  logger.info('Language packs cache invalidated');
}

// 관리자가 번역을 업데이트할 때마다 호출
// 10분 TTL로 자동 캐시 갱신
```

## 🔍 성능 최적화

### 캐시 통계
```typescript
export function getCacheStats() {
  return {
    memoryCacheSize: memoryCache.size,
    memoryCacheKeys: Array.from(memoryCache.keys()),
    memoryTTL: MEMORY_TTL,
    redisTTL: REDIS_TTL
  };
}
```

### 배치 로딩
```typescript
// 다중 카테고리 병렬 로딩
const categories = ['header', 'common', 'footer', 'auth', 'products'];
await Promise.all(categories.map(cat => getLanguagePacks(cat)));
```

### 응답시간 목표
- **메모리 캐시**: < 1ms (10분 TTL)
- **데이터베이스**: < 3초 (타임아웃 처리)
- **전체 프리로딩**: < 200ms
- **캐시 미스 시**: < 50ms

## 🚨 에러 처리 및 대체

### 언어팩 로딩 실패
```typescript
// lib/cache/language-packs.ts - 실제 에러 처리
catch (error) {
  logger.error('Failed to load language packs:', error);

  // DB 실패 시 빈 객체 반환
  const fallbackPacks: Record<string, LanguagePack> = {};

  // 실패한 경우에도 캐시하여 반복 요청 방지 (2분간)
  if (!cachedLanguagePacks) {
    cachedLanguagePacks = fallbackPacks;
    cacheTimestamp = now - CACHE_TTL + 120000; // 2분 후 다시 시도
  }

  return cachedLanguagePacks;
}
```

### 번역 키 누락
```typescript
// lib/cache/language-packs.ts - 실제 구현
export async function getTranslation(key: string, lang: 'ko' | 'en' | 'ja' = 'ko'): Promise<string> {
  const pack = await getLanguagePack(key);
  if (!pack) return key; // Return key as fallback
  return pack[lang] || pack.ko || key;
}
```

### 언어 감지 실패
```typescript
// 관리자가 설정하지 않은 언어 요청 시 기본 언어로 대체
const supportedLanguages = await getSupportedLanguages();
return supportedLanguages.includes(requestedLang) 
  ? requestedLang 
  : getDefaultLanguage();
```

## 📈 확장성 및 미래 계획

### 언어 추가 지원
1. 관리자 패널에서 새 언어 선택
2. `language_pack_translations`에 새 언어 코드로 번역 데이터 추가
3. 캐시 무효화 및 자동 갱신
4. 실시간 웹사이트 반영

**완전 동적 시스템**: 코드 변경 없이 관리자 패널에서 언어 추가/제거

### 자동 번역 시스템
- `is_auto_translated` 플래그 활용
- 번역 API 연동 준비
- 수동 검수 워크플로우

### 성능 모니터링
- 캐시 히트율 추적
- 언어별 사용량 분석
- 응답시간 메트릭

---

## 📋 시스템 요약

**E-Market Korea 언어팩 시스템 핵심 특징:**

✅ **관리자 제어 동적 언어 시스템**
- 하드코딩된 언어 없음
- 관리자가 패널에서 언어 선택/관리
- 실시간 언어 추가/제거 가능

✅ **데이터베이스 기반 아키텍처**
- `language_pack_keys`: 번역 키 관리
- `language_pack_translations`: 실제 번역 데이터
- `language_code` 필드로 완전 동적 지원

✅ **3단계 캐싱 시스템**
- 메모리 캐시 (10분 TTL)
- 데이터베이스 직접 조회 (3초 타임아웃)
- 실패 시 graceful fallback

✅ **실제 구현 기반**
- `lib/cache/language-packs.ts`: 핵심 캐싱 서비스
- `lib/cache/preload-service.ts`: 홈페이지 프리로딩
- 에러 처리 및 대체 시스템 완비

---

*이 문서는 실제 구현 코드를 기반으로 작성된 E-Market Korea 프로젝트의 정확한 언어팩 시스템 매뉴얼입니다.*