# 언어팩 시스템 아키텍처 문서

## 📌 개요
이 프로젝트는 **동적 다국어 지원 시스템**을 사용합니다. 관리자가 Admin 패널에서 언어를 설정하면, 그 설정이 API를 통해 전체 애플리케이션에 적용되는 구조입니다.

## 🏗️ 시스템 구조

### 1. 데이터베이스 구조

#### 1.1 레거시 테이블 (language_packs)
```sql
-- 고정 컬럼 방식 (deprecated, 하위 호환성 유지)
CREATE TABLE language_packs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,  -- 예: 'header.home'
  ko TEXT,                            -- 한국어
  en TEXT,                            -- 영어
  ja TEXT,                            -- 일본어 (사용 안함)
  zh TEXT,                            -- 중국어 (사용 안함)
  vi TEXT                             -- 베트남어 (사용 안함)
);
```

#### 1.2 새로운 동적 시스템 테이블

##### language_pack_keys (키 정의)
```sql
CREATE TABLE language_pack_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,     -- 예: 'header.home'
  component_type VARCHAR(50),                -- 예: 'header', 'footer', 'common'
  component_id VARCHAR(100),                 -- 특정 컴포넌트 ID (선택)
  description TEXT,                           -- 키 설명
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

##### language_pack_translations (번역 데이터)
```sql
CREATE TABLE language_pack_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_id UUID NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,        -- 예: 'ko', 'en', 'fr'
  translation TEXT NOT NULL,                 -- 번역된 텍스트
  is_auto_translated BOOLEAN DEFAULT false,  -- 자동번역 여부
  translator_notes TEXT,                      -- 번역자 노트
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(key_id, language_code)
);
```

##### language_settings (언어 설정)
```sql
CREATE TABLE language_settings (
  id SERIAL PRIMARY KEY,
  selected_languages TEXT[],                 -- ['ko', 'en', 'fr']
  default_language VARCHAR(10),              -- 'ko'
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API 구조

#### 2.1 공개 API (인증 불필요)
```
GET /api/public/language-packs
  - 통합 언어팩 데이터 제공
  - 동적 시스템 + 레거시 시스템 병합
  - 3단계 캐싱 적용
  - Query params:
    - category: 특정 카테고리만 필터링
```

#### 2.2 관리자 API (인증 필요)
```
GET /api/admin/i18n/settings
  - 언어 설정 조회
  - 활성화된 언어 목록 반환

POST /api/admin/i18n/settings
  - 언어 설정 업데이트
  - 언어 추가/제거

GET /api/admin/i18n/language-packs
  - 관리자용 언어팩 조회

POST /api/admin/i18n/language-packs
  - 언어팩 생성/수정

DELETE /api/admin/i18n/language-packs/:id
  - 언어팩 삭제

POST /api/admin/translate/google
  - Google Translate API 프록시
  - 동적 번역 지원
```

### 3. 캐싱 시스템 (3단계)

#### 3.1 캐싱 레이어
```typescript
// /lib/cache/language-cache.ts

1. 메모리 캐시 (Level 1)
   - TTL: 5분
   - 응답 시간: <1ms
   - Map 객체 사용
   - 최대 100개 키 제한

2. Redis 캐시 (Level 2)  
   - TTL: 30분
   - 응답 시간: <10ms
   - Redis 서버 (포트: 6381)
   - 키 프리픽스: 'language:packs:'

3. 데이터베이스 (Level 3)
   - 영구 저장
   - 응답 시간: <50ms
   - PostgreSQL (포트: 5432)
```

#### 3.2 캐시 플로우
```
요청 → 메모리 확인 → Redis 확인 → DB 조회
  ↓        ↓            ↓            ↓
응답 ← 메모리 저장 ← Redis 저장 ← 결과 반환
```

### 4. 파일 구조

```
commerce-nextjs/
├── app/
│   ├── api/
│   │   ├── public/
│   │   │   └── language-packs/
│   │   │       └── route.ts              # 공개 API (통합 엔드포인트)
│   │   ├── admin/
│   │   │   ├── i18n/
│   │   │   │   ├── settings/
│   │   │   │   │   └── route.ts          # 언어 설정 API
│   │   │   │   └── language-packs/
│   │   │   │       ├── route.ts          # 언어팩 CRUD
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts      # 개별 언어팩 수정/삭제
│   │   │   └── translate/
│   │   │       └── google/
│   │   │           └── route.ts          # Google 번역 API
│   │   └── language-packs/
│   │       └── route.ts                  # 레거시 API (호환성)
│   └── admin/
│       └── language-packs/
│           ├── page.tsx                   # 언어팩 관리 페이지
│           └── settings/
│               └── page.tsx               # 언어 설정 페이지
├── lib/
│   ├── cache/
│   │   ├── language-cache.ts             # 3단계 캐싱 시스템
│   │   ├── language-packs.ts             # 레거시 캐싱 (deprecated)
│   │   └── preload-service.ts            # 프리로드 서비스
│   └── db/
│       ├── index.ts                       # DB 연결
│       └── redis.ts                       # Redis 연결
├── contexts/
│   └── LanguageContext.tsx               # React Context (클라이언트)
├── scripts/
│   └── migrate-language-packs.js         # 마이그레이션 스크립트
└── documents/
    └── LANGUAGE_SYSTEM_ARCHITECTURE.md   # 이 문서
```

## 🔄 데이터 플로우

### 1. 언어팩 로딩 프로세스
```
1. 클라이언트 요청 (LanguageContext)
   ↓
2. GET /api/public/language-packs
   ↓
3. getLanguagePacks() 호출 (language-cache.ts)
   ↓
4. 캐시 체크 (메모리 → Redis → DB)
   ↓
5. 동적 시스템 조회
   - language_settings에서 활성 언어 확인
   - language_pack_keys + language_pack_translations JOIN
   ↓
6. 레거시 시스템 조회 (호환성)
   - language_packs 테이블 조회
   ↓
7. 데이터 병합 및 중복 제거
   ↓
8. 캐시 저장 (모든 레벨)
   ↓
9. 클라이언트 응답
```

### 2. 언어 설정 변경 프로세스
```
1. Admin 패널에서 언어 선택
   ↓
2. POST /api/admin/i18n/settings
   ↓
3. language_settings 테이블 업데이트
   ↓
4. 캐시 무효화 (invalidateLanguageCache)
   - 메모리 캐시 클리어
   - Redis 캐시 삭제
   ↓
5. Socket.io 이벤트 발생 (실시간 업데이트)
   ↓
6. 모든 클라이언트 자동 리로드
```

## ⚠️ 주의사항

### 1. 언어 코드 매핑
- 일본어: 'ja' (DB) ↔ 'jp' (클라이언트) - **현재 미사용**
- 프랑스어: 'fr' - **현재 활성**
- 한국어: 'ko' - **기본 언어**
- 영어: 'en' - **활성**

### 2. 하드코딩 금지
```typescript
// ❌ 잘못된 예
const languages = ['ko', 'en', 'jp'];

// ✅ 올바른 예
const selectedLanguages = await getLanguageSettings();
// language_settings 테이블에서 동적으로 가져옴
```

### 3. 캐시 무효화 시점
- 언어팩 수정 시
- 언어 설정 변경 시
- 수동 캐시 클리어 요청 시

### 4. 폴백 처리
```typescript
// API 실패 시 폴백 데이터
const fallbackData = [
  { key: 'header.home', ko: '홈', en: 'Home', fr: 'Accueil' },
  // ... 기본 필수 언어팩
];
```

## 🔧 유지보수 가이드

### 1. 새 언어 추가 방법
```sql
-- 1. language_settings 업데이트
UPDATE language_settings 
SET selected_languages = array_append(selected_languages, 'de')
WHERE id = 1;

-- 2. 번역 데이터 추가
INSERT INTO language_pack_translations (key_id, language_code, translation)
SELECT id, 'de', '독일어 번역'
FROM language_pack_keys;
```

### 2. 캐시 수동 클리어
```bash
# Redis 캐시 클리어
redis-cli -p 6381 DEL "language:packs:*"

# API로 캐시 무효화
curl -X POST http://localhost:3001/api/public/language-packs \
  -H "Content-Type: application/json" \
  -d '{"action": "invalidate"}'
```

### 3. 마이그레이션 실행
```bash
node scripts/migrate-language-packs.js
```

## 📊 성능 메트릭

- 메모리 캐시 히트율: ~70%
- Redis 캐시 히트율: ~25%
- 평균 응답 시간: <5ms (캐시 히트)
- 최대 응답 시간: <50ms (DB 조회)
- 동시 처리: 100+ req/sec

## 🐛 트러블슈팅

### 문제 1: 언어팩이 업데이트되지 않음
- 원인: 캐시가 무효화되지 않음
- 해결: `invalidateLanguageCache()` 호출 확인

### 문제 2: 일본어가 표시되지 않음
- 원인: 하드코딩된 'jp' 사용
- 해결: language_settings에서 동적으로 언어 가져오기

### 문제 3: Redis 연결 실패
- 원인: Redis 서버 다운
- 해결: 폴백으로 DB 직접 조회 (성능 저하 감수)