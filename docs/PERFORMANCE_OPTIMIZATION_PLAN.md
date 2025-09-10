# 메인페이지 성능 최적화 계획서

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [성능 문제 진단](#성능-문제-진단)
3. [JSON 캐시화 최적화 방안](#json-캐시화-최적화-방안)
4. [구현 로드맵](#구현-로드맵)
5. [예상 성능 향상](#예상-성능-향상)

---

## 🔍 현재 구조 분석

### 메인페이지 데이터 로딩 플로우

```
📱 page.tsx (Server Component)
    ├── 🔄 preloadHomePageData() [서버사이드 직접 DB 쿼리]
    │   ├── 🗃️ getProducts() → products + product_images JOIN (20개)
    │   ├── 📁 getCategories() → categories 테이블
    │   ├── 🎨 getSections() → ui_sections 테이블 (동적 순서)
    │   └── 🌐 getLanguagePacks() → language_pack_* 테이블들
    │
    ├── 🧩 HomePageImproved (Client Component)
    │   └── 🔄 DynamicSectionRenderer
    │       ├── 📡 /api/ui-sections (실시간 섹션 업데이트)
    │       └── 🎭 24개 섹션 컴포넌트 (Lazy Loading)
    │
    └── 🚀 JSON 캐시 프리페치 링크 (현재 미사용)
        ├── /cache/products/products-ko-page-1.json
        └── /cache/products/products-ko-page-2.json
```

### 언어팩 시스템 구조

```
🌐 Language Pack System
├── 📊 Database Tables:
│   ├── language_settings (선택된 언어: ["ko", "en", "fr"])
│   ├── language_metadata (언어 메타데이터)
│   ├── language_pack_keys (키 정의)
│   └── language_pack_translations (실제 번역)
│
├── 🔄 API Layer:
│   ├── /api/admin/i18n/settings (언어 설정)
│   └── getCachedLanguagePacks() (10분 메모리 캐시)
│
└── 🎯 Usage:
    ├── Static UI Text (menu.home, menu.products...)
    ├── Section Titles/Subtitles (hero, promo, category...)
    └── Dynamic Content (admin 설정 번역)
```

### UI 섹션 동적 관리 시스템

```
🎨 UI Section Management
├── 📊 Database: ui_sections 테이블
│   ├── key (섹션 식별자)
│   ├── type (섹션 타입: hero, category, promo...)
│   ├── order (정렬 순서: 1, 2, 3...)
│   ├── isActive (활성 상태)
│   ├── data (섹션 설정 JSON)
│   └── translations (다국어 번역 JSON)
│
├── 🔄 API Layer:
│   ├── /api/ui-sections (CRUD + 실시간 업데이트)
│   └── /api/admin/ui-config/sections (관리자 설정)
│
├── 📡 Real-time Updates:
│   ├── Server-Sent Events (SSE)
│   ├── broadcastUIUpdate()
│   └── useRealTimeUpdates() hook
│
└── 🎭 Frontend Rendering:
    ├── DynamicSectionRenderer (24개 섹션 지원)
    ├── Lazy Loading + Suspense
    └── 실시간 순서 변경/추가/삭제
```

### 어드민 - 섹션 동적 연동

```
👨‍💼 Admin Integration
├── 🏠 /admin/ui-config
│   ├── 헤더 설정 (HeaderConfigDB)
│   ├── 푸터 설정 (FooterConfigDB)
│   ├── 섹션 관리 (SectionsConfigTab)
│   └── 카테고리 설정 (CategoryConfigTab)
│
├── 🎛️ Section Management:
│   ├── 드래그 앤 드롭 순서 변경
│   ├── 실시간 활성/비활성 토글
│   ├── 다국어 번역 설정
│   └── 섹션별 상세 설정 페이지
│
└── 📡 실시간 동기화:
    ├── 관리자 변경 → SSE 브로드캐스트
    ├── 프론트엔드 자동 업데이트
    └── 캐시 무효화 자동 처리
```

---

## ⚡ 성능 문제 진단

### 🐌 현재 성능 병목점

1. **🗄️ 매번 4개 DB 쿼리 실행**
   - 상품 (products + images JOIN)
   - 카테고리 (categories)
   - UI 섹션 (ui_sections)  
   - 언어팩 (language_pack_* JOIN)

2. **🔄 서버사이드 렌더링 지연**
   - 각 요청마다 DB 연결 및 쿼리 실행
   - JOIN 쿼리로 인한 추가 지연

3. **📱 클라이언트 중복 요청**
   - 서버에서 로드 + 클라이언트에서 재요청
   - `/api/ui-sections` 중복 호출

4. **🌐 언어팩 복잡한 JOIN 쿼리**
   - `language_pack_keys` + `language_pack_translations` JOIN
   - 매번 전체 언어팩 데이터 로드

---

## 🚀 JSON 캐시화 최적화 방안

### 📋 Phase 1: 언어팩 JSON 캐시화 ⭐ **최우선**

```
📁 /public/cache/language-packs/
├── ko.json          // 한국어 전체 언어팩
├── en.json          // 영어 전체 언어팩
├── fr.json          // 프랑스어 전체 언어팩
└── manifest.json    // 캐시 메타데이터 (버전, 업데이트 시간)
```

**ko.json 구조:**
```json
{
  "menu.home": "홈",
  "menu.products": "상품",
  "menu.categories": "카테고리",
  "hero.title": "메인 배너 제목",
  "section.category.title": "카테고리",
  "section.promo.title": "프로모션",
  // ... 모든 언어팩 키-값
}
```

### 📋 Phase 2: UI 섹션 JSON 캐시화 🎯 **우선 구현 요청**

```
📁 /public/cache/ui-sections/
├── sections-ko.json  // 한국어 UI 섹션 설정
├── sections-en.json  // 영어 UI 섹션 설정
├── sections-fr.json  // 프랑스어 UI 섹션 설정
└── manifest.json     // 섹션 메타데이터
```

**sections-ko.json 구조:**
```json
{
  "sections": [
    {
      "id": "hero",
      "key": "hero",
      "type": "hero", 
      "title": "메인 배너",
      "order": 1,
      "isActive": true,
      "data": {
        "slides": [...],
        "autoplay": true
      },
      "translations": {
        "title": "메인 배너",
        "subtitle": "특별 할인 이벤트"
      }
    },
    {
      "id": "category",
      "key": "category",
      "type": "category",
      "title": "카테고리",
      "order": 2,
      "isActive": true,
      "data": {
        "categories": [...]
      },
      "translations": {
        "title": "카테고리별 쇼핑"
      }
    }
    // ... 모든 활성 섹션
  ],
  "metadata": {
    "totalSections": 8,
    "activeSections": 6,
    "lastUpdated": "2025-01-09T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### 📋 Phase 3: 상품/카테고리 JSON 캐시화

```
📁 /public/cache/products/
├── products-ko-page-1.json   // 한국어 상품 1페이지
├── products-en-page-1.json   // 영어 상품 1페이지
├── products-fr-page-1.json   // 프랑스어 상품 1페이지
├── categories-ko.json        // 한국어 카테고리
├── categories-en.json        // 영어 카테고리
├── categories-fr.json        // 프랑스어 카테고리
└── manifest.json             // 상품 메타데이터
```

---

## 🔧 구현 로드맵

### 🥇 Phase 1: 언어팩 JSON 캐시화 (1-2일)

**구현 항목:**
1. `scripts/generate-language-cache.ts` 생성 스크립트
2. `lib/cache/language-packs.ts` → JSON 파일 읽기로 변경
3. 관리자에서 언어팩 수정 시 자동 재생성
4. 캐시 무효화 및 버전 관리

### 🥈 Phase 2: UI 섹션 JSON 캐시화 (2-3일)

**구현 항목:**
1. `scripts/generate-ui-sections-cache.ts` 생성 스크립트
2. `lib/cache/preload-service.ts` → JSON 파일 읽기로 변경
3. 관리자에서 섹션 변경 시 자동 재생성
4. SSE 연동으로 실시간 캐시 업데이트

### 🥉 Phase 3: 상품/카테고리 JSON 캐시화 (3-4일)

**구현 항목:**
1. `scripts/generate-products-cache.ts` 생성 스크립트  
2. `preloadHomePageData()` → JSON 파일 읽기로 변경
3. 상품/카테고리 변경 시 자동 재생성
4. 페이지네이션 캐시 지원

### 🏆 Phase 4: 전체 통합 최적화 (1-2일)

**구현 항목:**
1. 통합 캐시 관리 시스템
2. 캐시 버전 관리 및 무효화
3. 성능 모니터링 및 벤치마크
4. CDN 연동 준비

---

## 📊 예상 성능 향상

| 우선순위 | 항목 | 현재 시간 | 예상 시간 | 향상률 | 구현 난이도 |
|---------|------|----------|----------|--------|-----------|
| 1️⃣ | 언어팩 JSON 캐시 | 200ms | 60ms | **70%** | 🟢 쉬움 |
| 2️⃣ | UI 섹션 JSON 캐시 | 150ms | 30ms | **80%** | 🟡 보통 |  
| 3️⃣ | 상품 JSON 캐시 | 300ms | 50ms | **83%** | 🟡 보통 |
| 4️⃣ | 전체 통합 최적화 | 800ms | 100ms | **87%** | 🔴 어려움 |

**총 예상 성능 향상: 800ms → 100ms (87% 향상)**

---

## 📝 다음 단계

1. ✅ **분석 완료**: 전체 구조 파악 및 문서화
2. 🎯 **우선 구현**: UI 섹션 JSON 캐시화 (요청사항)
3. 🔍 **헤더 메뉴 문제 해결**: 언어팩 연동 문제 조사
4. 📈 **성능 테스트**: 벤치마크 및 모니터링 구축

---

## 🚨 주요 이슈

### 헤더 메뉴 문제
- **현상**: http://localhost:3003/admin/ui-config?tab=header에서 메뉴 추가 시 오류
- **원인**: 언어팩 연동 문제로 추정
- **해결방안**: 헤더 메뉴 시스템과 언어팩 연동 구조 재점검 필요

---

*📅 작성일: 2025-01-09*  
*👤 작성자: 시스템 분석 및 최적화 팀*  
*🔄 업데이트: 구조 분석 완료, 최적화 계획 수립*