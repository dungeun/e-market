# 📋 PRD: E-Market Korea 통합 언어팩 시스템 구현 계획
## Product Requirements Document - 전체 시스템 언어팩 통합

---

## 📌 Executive Summary

### 프로젝트 개요
- **프로젝트명**: E-Market Korea 전체 시스템 언어팩 통합
- **목적**: 상품등록부터 커뮤니티, 관리자 패널까지 모든 영역 언어팩 적용
- **기간**: 4주 (2025-09-04 ~ 2025-10-02)
- **우선순위**: P0 (Critical)
- **대상 사용자**: 해외 노동자 커뮤니티

### 핵심 비전
**"관리자 제어 완전 동적 다국어 커머스 플랫폼"**
- 모든 UI 요소의 실시간 다국어 지원
- 상품등록, 커뮤니티 게시, 관리자 패널 모든 영역 적용
- 관리자가 선택한 언어(최대 3개)로 전체 시스템 운영

---

## 🎯 Business Requirements

### BR-001: 전체 시스템 언어팩 통합
| ID | 요구사항 | 우선순위 | 적용 영역 |
|----|---------|----------|----------|
| BR-001-1 | 관리자 제어 동적 언어 시스템 (하드코딩 제거) | P0 | 전체 시스템 |
| BR-001-2 | 상품등록 폼 완전 다국어 지원 | P0 | 상품 관리 |
| BR-001-3 | 커뮤니티 게시판/댓글 다국어 지원 | P0 | 커뮤니티 |
| BR-001-4 | 관리자 패널 모든 메뉴/버튼 다국어 | P0 | 관리자 |
| BR-001-5 | UI 섹션 편집기 다국어 지원 | P0 | 관리자 |

### BR-002: 상품등록 시스템 언어팩 통합
| ID | 요구사항 | 우선순위 | 세부사항 |
|----|---------|----------|----------|
| BR-002-1 | 상품등록 폼 라벨 동적 언어팩 | P0 | 제목, 설명, 가격, 카테고리, 상태 |
| BR-002-2 | 상품 상태(S/A/B/C) 다국어 | P0 | 조건별 상태 표시 |
| BR-002-3 | 유효성 검사 메시지 다국어 | P0 | 에러/성공 메시지 |
| BR-002-4 | 상품 카테고리 동적 다국어 | P0 | 계층 구조 카테고리 |
| BR-002-5 | 파일업로드 인터페이스 다국어 | P1 | 드래그앤드롭, 버튼 |

### BR-003: 커뮤니티 시스템 언어팩 통합  
| ID | 요구사항 | 우선순위 | 세부사항 |
|----|---------|----------|----------|
| BR-003-1 | 게시판 카테고리 동적 다국어 | P0 | 자유게시판, 거래정보, 구인구직 등 |
| BR-003-2 | 게시글 작성 폼 다국어 | P0 | 제목, 내용, 태그, 카테고리 |
| BR-003-3 | 댓글 시스템 다국어 | P0 | 작성, 수정, 삭제, 답글 |
| BR-003-4 | 게시글 상태/액션 다국어 | P0 | 좋아요, 공유, 신고, 수정 |
| BR-003-5 | 검색/필터 인터페이스 다국어 | P1 | 검색창, 정렬 옵션, 필터 |

### BR-004: 관리자 패널 언어팩 통합
| ID | 요구사항 | 우선순위 | 세부사항 |
|----|---------|----------|----------|
| BR-004-1 | 관리자 사이드바 메뉴 다국어 | P0 | 대시보드, 사용자 관리, 상품 관리 등 |
| BR-004-2 | UI 섹션 편집기 다국어 | P0 | 섹션 추가/수정/삭제, 순서변경 |
| BR-004-3 | 사용자 관리 인터페이스 다국어 | P0 | 목록, 상태, 권한, 필터 |
| BR-004-4 | 통계/리포트 화면 다국어 | P1 | 차트 범례, 지표명, 기간 |
| BR-004-5 | 언어 관리 패널 다국어 | P0 | 언어 설정, 번역 관리 |

### BR-005: 사용자 인터페이스 언어팩 통합
| ID | 요구사항 | 우선순위 | 세부사항 |
|----|---------|----------|----------|
| BR-005-1 | 네비게이션/헤더/푸터 다국어 | P0 | 메뉴, 버튼, 링크, 저작권 |
| BR-005-2 | 회원가입/로그인 폼 다국어 | P0 | 라벨, 플레이스홀더, 버튼, 메시지 |
| BR-005-3 | 마이페이지 인터페이스 다국어 | P0 | 메뉴, 설정, 주문내역 |
| BR-005-4 | 장바구니/결제 시스템 다국어 | P1 | 상품정보, 결제버튼, 배송정보 |
| BR-005-5 | 알림/메시지 시스템 다국어 | P1 | Toast, 모달, 확인창 |

---

## 🔧 Technical Requirements

### TR-001: 통합 언어팩 데이터베이스 설계
```sql
-- 관리자가 설정한 언어 관리
CREATE TABLE admin_language_settings (
    id SERIAL PRIMARY KEY,
    enabled_languages TEXT[] DEFAULT '{}', -- ['ko', 'en', 'ja'] 등 관리자 선택
    default_language VARCHAR(10) DEFAULT 'ko',
    auto_translate_enabled BOOLEAN DEFAULT false,
    fallback_strategy VARCHAR(20) DEFAULT 'key',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 언어팩 키 관리 (컨텍스트별 분류)
CREATE TABLE language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL, -- 'product.form.title'
    component_type VARCHAR(50) NOT NULL,   -- 'product', 'community', 'admin'
    context VARCHAR(100),                  -- 'registration', 'edit', 'list'
    category VARCHAR(50),                  -- 'form', 'button', 'message'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 동적 언어 번역 데이터
CREATE TABLE language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,   -- 관리자가 설정한 언어 코드
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    translator_id INTEGER,               -- 번역자 정보
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, language_code)
);

-- 컨텍스트별 언어팩 그룹 관리
CREATE TABLE language_pack_contexts (
    id SERIAL PRIMARY KEY,
    context_name VARCHAR(100) UNIQUE NOT NULL, -- 'product_registration'
    display_name VARCHAR(255),
    description TEXT,
    keys_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00, -- 번역 완성도 %
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 다국어 지원
ALTER TABLE categories ADD COLUMN IF NOT EXISTS 
    name_translations JSONB DEFAULT '{}',
    description_translations JSONB DEFAULT '{}';

-- UI 섹션 다국어 지원 확장
ALTER TABLE ui_sections ADD COLUMN IF NOT EXISTS 
    title_translations JSONB DEFAULT '{}',
    content_translations JSONB DEFAULT '{}';
```

### TR-002: 통합 언어팩 API 구조
```
/app/api/
├── admin/
│   ├── language-packs/           # 언어팩 관리 API
│   │   ├── route.ts             # 전체 언어팩 CRUD
│   │   ├── [context]/route.ts   # 컨텍스트별 언어팩
│   │   ├── keys/route.ts        # 언어팩 키 관리
│   │   └── bulk/route.ts        # 대량 번역 처리
│   ├── language-settings/        # 관리자 언어 설정
│   │   ├── route.ts             # 언어 목록 관리
│   │   └── [code]/route.ts      # 개별 언어 설정
│   └── ui-sections/             # UI 섹션 다국어 지원
│       ├── route.ts             # 섹션 관리
│       └── [id]/translations/route.ts # 섹션별 번역
├── products/
│   ├── route.ts                 # 상품 등록/수정 (다국어 지원)
│   ├── categories/route.ts      # 카테고리 다국어
│   └── [id]/translations/route.ts # 상품별 번역
├── community/
│   ├── posts/route.ts           # 게시글 다국어 지원
│   ├── categories/route.ts      # 게시판 카테고리 다국어
│   └── comments/route.ts        # 댓글 다국어
└── i18n/
    ├── route.ts                 # 클라이언트 언어팩 조회
    ├── [context]/route.ts       # 컨텍스트별 번역
    └── preload/route.ts         # 프리로딩용 번역 데이터
```

### TR-003: 통합 서비스 레이어 구조
```
/lib/
├── cache/
│   ├── language-packs.ts        # 기존 언어팩 캐싱 (확장)
│   ├── context-cache.ts         # 컨텍스트별 캐시
│   └── preload-service.ts       # 프리로딩 서비스 (다국어 확장)
├── services/
│   ├── language-pack.service.ts # 통합 언어팩 서비스
│   ├── translation.service.ts   # 번역 관리 서비스
│   └── context-manager.service.ts # 컨텍스트 관리
├── hooks/
│   ├── useLanguagePack.ts       # 언어팩 훅
│   ├── useTranslation.ts        # 번역 훅
│   └── useContextLanguage.ts    # 컨텍스트별 언어 훅
└── utils/
    ├── language-utils.ts        # 언어 유틸리티
    ├── translation-utils.ts     # 번역 유틸리티
    └── context-resolver.ts      # 컨텍스트 해석기
```

### TR-004: 컨텍스트별 언어팩 키 구조
```typescript
// 상품등록 컨텍스트
export const PRODUCT_REGISTRATION_KEYS = {
  // 폼 라벨
  'product.form.title': '상품 제목',
  'product.form.description': '상품 설명',
  'product.form.price': '가격',
  'product.form.category': '카테고리',
  'product.form.condition': '상품 상태',
  
  // 상품 상태
  'product.condition.s': 'S급 (새상품)',
  'product.condition.a': 'A급 (깨끗함)',
  'product.condition.b': 'B급 (사용감 있음)',
  'product.condition.c': 'C급 (많이 사용함)',
  
  // 버튼 및 액션
  'product.button.register': '상품 등록',
  'product.button.save_draft': '임시 저장',
  'product.button.preview': '미리보기',
  
  // 검증 메시지
  'product.validation.title_required': '상품 제목을 입력해주세요',
  'product.validation.price_invalid': '올바른 가격을 입력해주세요',
};

// 커뮤니티 컨텍스트
export const COMMUNITY_KEYS = {
  // 게시판 카테고리
  'community.category.general': '자유게시판',
  'community.category.trade': '거래정보',
  'community.category.job': '구인구직',
  'community.category.housing': '부동산',
  
  // 게시글 작성
  'community.post.title': '제목',
  'community.post.content': '내용',
  'community.post.tags': '태그',
  
  // 액션 버튼
  'community.button.write': '글쓰기',
  'community.button.edit': '수정',
  'community.button.delete': '삭제',
  'community.button.reply': '댓글',
};

// 관리자 패널 컨텍스트
export const ADMIN_KEYS = {
  // 사이드바 메뉴
  'admin.menu.dashboard': '대시보드',
  'admin.menu.users': '사용자 관리',
  'admin.menu.products': '상품 관리',
  'admin.menu.community': '커뮤니티 관리',
  'admin.menu.ui_sections': 'UI 섹션 관리',
  'admin.menu.language_settings': '언어 설정',
  
  // UI 섹션 관리
  'admin.section.add': '섹션 추가',
  'admin.section.edit': '섹션 수정',
  'admin.section.delete': '섹션 삭제',
  'admin.section.title': '제목',
  'admin.section.subtitle': '부제목',
  'admin.section.description': '설명',
};
```

---

## 📅 Implementation Phases

### Week 1: 기반 시스템 구축 (2025-09-04 ~ 2025-09-11)

#### Phase 1.1: 데이터베이스 및 API 기반 (Day 1-2)
- [ ] **TASK-001**: 통합 언어팩 데이터베이스 스키마 구축
  - 기한: 2025-09-05 17:00
  - 담당: Backend
  - 내용:
    ```sql
    CREATE TABLE admin_language_settings;
    CREATE TABLE language_pack_keys;
    CREATE TABLE language_pack_translations;
    CREATE TABLE language_pack_contexts;
    ALTER TABLE categories ADD COLUMN name_translations;
    ALTER TABLE ui_sections ADD COLUMN title_translations;
    ```

- [ ] **TASK-002**: 기존 언어팩 데이터 마이그레이션
  - 기한: 2025-09-06 17:00
  - 담당: Backend
  - 내용: 기존 `language-packs.ts` 데이터를 새 테이블 구조로 이전

- [ ] **TASK-003**: 통합 언어팩 API 개발
  - 기한: 2025-09-06 17:00
  - 담당: Backend
  - 경로: `/app/api/admin/language-packs/`, `/app/api/i18n/`

#### Phase 1.2: 핵심 서비스 및 캐싱 (Day 3-5)
- [ ] **TASK-004**: 기존 `language-packs.ts` 서비스 확장
  - 기한: 2025-09-08 17:00
  - 담당: Backend
  - 내용: 컨텍스트별 캐싱, 동적 언어 지원 확장

- [ ] **TASK-005**: 통합 언어팩 훅 개발
  - 기한: 2025-09-09 17:00
  - 담당: Frontend
  - 파일: `hooks/useLanguagePack.ts`, `hooks/useContextLanguage.ts`

- [ ] **TASK-006**: 관리자 언어 설정 패널 구축
  - 기한: 2025-09-10 17:00
  - 담당: Frontend
  - 위치: `/app/admin/language-settings/`

- [ ] **TASK-007**: 언어팩 키 정의 (1000개+)
  - 기한: 2025-09-11 17:00
  - 담당: Full Stack
  - 범위: 상품, 커뮤니티, 관리자 모든 영역

### Week 2: 상품 시스템 언어팩 통합 (2025-09-12 ~ 2025-09-18)

#### Phase 2.1: 상품 등록 시스템 (Day 8-10)
- [ ] **TASK-008**: 상품 등록 폼 언어팩 통합
  - 기한: 2025-09-13 17:00
  - 담당: Frontend
  - 범위: 제목, 설명, 가격, 카테고리, 상품상태 입력 필드

- [ ] **TASK-009**: 상품 상태(S/A/B/C) 다국어 지원
  - 기한: 2025-09-13 17:00
  - 담당: Backend + Frontend
  - 내용: 상품 등급 시스템 완전 다국어화

- [ ] **TASK-010**: 상품 카테고리 다국어 시스템
  - 기한: 2025-09-14 17:00
  - 담당: Backend
  - 구조: `categories.name_translations` JSONB 활용

- [ ] **TASK-011**: 상품 검색/필터 언어팩 적용
  - 기한: 2025-09-15 17:00
  - 담당: Frontend
  - 범위: 검색창, 필터 옵션, 정렬 기준

#### Phase 2.2: 상품 관리 시스템 (Day 11-12)
- [ ] **TASK-012**: 상품 목록/상세 페이지 언어팩
  - 기한: 2025-09-16 17:00
  - 담당: Frontend
  - 범위: 상품 카드, 상세 정보, 액션 버튼

- [ ] **TASK-013**: 상품 수정/삭제 인터페이스 언어팩
  - 기한: 2025-09-17 17:00
  - 담당: Frontend
  - 범위: 수정 폼, 삭제 확인, 상태 변경

- [ ] **TASK-014**: 파일 업로드 시스템 언어팩
  - 기한: 2025-09-18 17:00
  - 담당: Frontend
  - 범위: 드래그앤드롭, 진행률, 에러 메시지

### Week 3: 커뮤니티 시스템 언어팩 통합 (2025-09-19 ~ 2025-09-25)

#### Phase 3.1: 커뮤니티 게시판 시스템 (Day 15-17)
- [ ] **TASK-015**: 게시판 카테고리 다국어 시스템
  - 기한: 2025-09-20 17:00
  - 담당: Backend + Frontend
  - 범위: 자유게시판, 거래정보, 구인구직, 부동산, 질문답변

- [ ] **TASK-016**: 게시글 작성/편집 폼 언어팩
  - 기한: 2025-09-21 17:00
  - 담당: Frontend
  - 범위: 제목, 내용, 카테고리, 태그, 첨부파일

- [ ] **TASK-017**: 게시글 목록/상세 페이지 언어팩
  - 기한: 2025-09-22 17:00
  - 담당: Frontend
  - 범위: 게시글 카드, 상세 정보, 조회수, 작성일

#### Phase 3.2: 댓글 및 상호작용 시스템 (Day 18-19)
- [ ] **TASK-018**: 댓글 시스템 언어팩 통합
  - 기한: 2025-09-23 17:00
  - 담당: Frontend
  - 범위: 댓글 작성, 수정, 삭제, 답글, 좋아요

- [ ] **TASK-019**: 커뮤니티 검색/필터 언어팩
  - 기한: 2025-09-24 17:00
  - 담당: Frontend
  - 범위: 검색창, 카테고리 필터, 정렬 옵션

- [ ] **TASK-020**: 커뮤니티 알림 시스템 언어팩
  - 기한: 2025-09-25 17:00
  - 담당: Backend + Frontend
  - 범위: 알림 메시지, 이메일 템플릿, 푸시 알림

### Week 4: 관리자 패널 & 최종 통합 (2025-09-26 ~ 2025-10-02)

#### Phase 4.1: 관리자 패널 언어팩 통합 (Day 22-24)
- [ ] **TASK-021**: 관리자 사이드바 메뉴 언어팩
  - 기한: 2025-09-27 17:00
  - 담당: Frontend
  - 범위: 대시보드, 사용자 관리, 상품 관리, 커뮤니티 관리

- [ ] **TASK-022**: UI 섹션 편집기 언어팩 통합
  - 기한: 2025-09-28 17:00
  - 담당: Frontend
  - 범위: 섹션 추가/수정/삭제, 순서변경, 다국어 설정

- [ ] **TASK-023**: 사용자 관리 인터페이스 언어팩
  - 기한: 2025-09-29 17:00
  - 담당: Frontend
  - 범위: 사용자 목록, 권한 관리, 상태 변경, 필터

#### Phase 4.2: 사용자 인터페이스 언어팩 완성 (Day 25-26)
- [ ] **TASK-024**: 네비게이션/헤더/푸터 언어팩
  - 기한: 2025-09-30 17:00
  - 담당: Frontend
  - 범위: 메뉴, 버튼, 링크, 저작권, 언어 전환 버튼

- [ ] **TASK-025**: 회원가입/로그인 시스템 언어팩
  - 기한: 2025-09-30 17:00
  - 담당: Frontend
  - 범위: 폼 라벨, 버튼, 검증 메시지, OAuth 버튼

- [ ] **TASK-026**: 마이페이지 및 설정 언어팩
  - 기한: 2025-10-01 17:00
  - 담당: Frontend
  - 범위: 프로필 설정, 주문내역, 알림 설정

#### Phase 4.3: 성능 최적화 및 테스팅 (Day 27-28)
- [ ] **TASK-027**: 언어팩 캐싱 최적화
  - 기한: 2025-10-01 17:00
  - 담당: Backend
  - 내용: 메모리 캐시 효율화, 프리로딩 개선

- [ ] **TASK-028**: 전체 시스템 언어팩 테스트
  - 기한: 2025-10-02 17:00
  - 담당: QA
  - 범위: 모든 페이지, 모든 언어, 모든 사용자 시나리오

- [ ] **TASK-029**: 성능 벤치마킹 및 최적화
  - 기한: 2025-10-02 17:00
  - 담당: Full Stack
  - 목표: <200ms 언어 전환, <100ms 페이지 로딩

---

## 📊 Success Metrics

### 정량적 지표
| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 언어팩 적용 페이지 | 홈페이지만 | 전체 시스템 | 페이지 카운트 |
| 하드코딩 텍스트 | 많음 | 0개 | 코드 스캔 |
| 언어팩 키 개수 | ~100개 | 1000+개 | 데이터베이스 카운트 |
| 언어 전환 속도 | - | <200ms | Performance API |
| 관리자 언어 관리 시간 | 3시간 | 10분 | 시간 측정 |
| 번역 완성도 | 한국어만 | 95%+ | 완성률 계산 |

### 적용 범위별 지표
| 영역 | 현재 상태 | 목표 | 완성 기준 |
|------|----------|------|----------|
| 상품 등록 시스템 | 하드코딩 | 완전 다국어 | 모든 폼 요소 언어팩 적용 |
| 커뮤니티 시스템 | 하드코딩 | 완전 다국어 | 모든 게시판/댓글 언어팩 적용 |
| 관리자 패널 | 하드코딩 | 완전 다국어 | 모든 메뉴/버튼 언어팩 적용 |
| 사용자 인터페이스 | 부분 적용 | 완전 다국어 | 모든 UI 요소 언어팩 적용 |

### 사용자 경험 지표
- **해외 노동자 만족도**: 언어 장벽 해소율 90% 이상
- **관리자 운영 효율성**: 다국어 콘텐츠 관리 시간 80% 단축  
- **개발자 생산성**: 새 기능 추가 시 언어팩 통합 자동화
- **시스템 성능**: 다국어 적용으로 인한 성능 저하 5% 미만

---

## 🚨 Risk Management

### Risk Matrix
| 위험 | 영향도 | 발생확률 | 대응 방안 |
|------|--------|----------|-----------|
| 대규모 언어팩 데이터 성능 저하 | High | Medium | 컨텍스트별 분할 로딩, 캐싱 최적화 |
| 번역 품질 문제 | Medium | High | 수동 검토 프로세스, 전문 번역가 협업 |
| 기존 시스템과의 호환성 | High | Medium | 점진적 마이그레이션, 하위 호환성 유지 |
| 관리자 패널 복잡도 증가 | Medium | High | 직관적 UI 설계, 단계별 안내 |
| 다국어 검색 인덱싱 문제 | Medium | Low | 언어별 검색 엔진 최적화 |
| 캐시 동기화 오류 | High | Low | 캐시 무효화 전략, 실시간 동기화 |

---

## 📝 Acceptance Criteria

### AC-001: 전체 시스템 언어팩 통합
- ✅ 모든 페이지에 언어팩 적용 (하드코딩 0%)
- ✅ 관리자 제어 동적 언어 시스템 구현
- ✅ 상품등록부터 커뮤니티까지 모든 영역 지원
- ✅ 실시간 언어팩 업데이트 반영

### AC-002: 상품 시스템 언어팩 통합
- ✅ 상품 등록/수정 폼 모든 요소 다국어 지원
- ✅ 상품 카테고리 동적 다국어 시스템
- ✅ 상품 상태(S/A/B/C) 완전 다국어 지원
- ✅ 검색/필터 인터페이스 다국어 적용

### AC-003: 커뮤니티 시스템 언어팩 통합
- ✅ 게시판 카테고리 동적 다국어 관리
- ✅ 게시글 작성/편집 인터페이스 다국어 지원
- ✅ 댓글 시스템 완전 다국어 지원
- ✅ 커뮤니티 검색/필터 다국어 적용

### AC-004: 관리자 패널 언어팩 통합
- ✅ 모든 관리자 메뉴/버튼 다국어 지원
- ✅ UI 섹션 편집기 다국어 기능
- ✅ 사용자 관리 인터페이스 다국어 지원
- ✅ 언어 관리 패널 완전 구현

### AC-005: 성능 및 사용자 경험
- ✅ 언어 전환 속도 200ms 이내
- ✅ 관리자 언어 설정 10분 이내 완료
- ✅ 번역 완성도 95% 이상
- ✅ 전체 시스템 성능 저하 5% 미만

---

## 🎯 Rollback Plan

### 롤백 시나리오
1. **Phase 1 실패**: 백업 복원
2. **Phase 2 실패**: 데이터베이스 롤백
3. **Phase 3 실패**: API 리디렉션 유지
4. **Phase 4 실패**: 기존 UI 유지
5. **Phase 5 실패**: 캐싱 비활성화

### 롤백 스크립트
```bash
#!/bin/bash
# rollback.sh
BACKUP_DIR="backup/2025-09-02-prd"

# API 롤백
cp -r $BACKUP_DIR/language* app/api/admin/
cp -r $BACKUP_DIR/translat* app/api/admin/

# 컴포넌트 롤백
cp -r $BACKUP_DIR/ui-config components/admin/
cp -r $BACKUP_DIR/sections components/

# 데이터베이스 롤백
psql -h localhost -p 5434 -U postgres -d commerce_nextjs < $BACKUP_DIR/db-backup.sql

echo "Rollback completed"
```

---

## 📌 Sign-off

### 승인자
- [ ] Product Owner: _____________
- [ ] Tech Lead: _____________
- [ ] QA Lead: _____________
- [ ] DevOps Lead: _____________

### 문서 버전
- Version: 1.0.0
- Date: 2025-09-02
- Author: System Architect
- Status: **READY FOR IMPLEMENTATION**

---

## 📎 Appendix

### A. 관련 문서
1. `/최종-통합-시스템-정리-및-구현계획.md`
2. `/언어팩-폴더구조-분석보고서.md`
3. `/섹션관리시스템-현황분석보고서.md`
4. `/언어시스템-통합-실행계획.md`

### B. 참조 링크
- [Google Translate API](https://cloud.google.com/translate)
- [Socket.io Documentation](https://socket.io/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)

### C. 연락처
- Backend Team: backend@company.com
- Frontend Team: frontend@company.com
- DevOps Team: devops@company.com
- QA Team: qa@company.com

---

**END OF DOCUMENT**