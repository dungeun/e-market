# 📋 PRD: E-Commerce 통합 시스템 구현 계획
## Product Requirements Document

---

## 📌 Executive Summary

### 프로젝트 개요
- **프로젝트명**: E-Commerce 다국어 통합 시스템 구축
- **목적**: 분산된 언어 시스템 통합 및 섹션 관리 시스템 실시간 동기화
- **기간**: 5일 (2025-09-02 ~ 2025-09-06)
- **우선순위**: P0 (Critical)

### 핵심 목표
1. 언어팩 시스템 통합 (8개 → 3개 디렉토리)
2. 섹션 관리 실시간 동기화 (6개 → 24개 섹션)
3. 한국어 기본, 관리자 선택 언어 시스템
4. JSON 기반 고속 렌더링

---

## 🎯 Business Requirements

### BR-001: 언어 시스템 요구사항
| ID | 요구사항 | 우선순위 | 담당 |
|----|---------|----------|------|
| BR-001-1 | 한국어는 유일한 기본 언어 | P0 | Backend |
| BR-001-2 | 관리자가 최대 3개 추가 언어 선택 가능 | P0 | Backend |
| BR-001-3 | Google Translate API 자동 번역 | P1 | Backend |
| BR-001-4 | 언어별 JSON 파일 자동 생성 | P0 | Backend |
| BR-001-5 | 실시간 언어 전환 (<100ms) | P1 | Frontend |

### BR-002: 섹션 관리 요구사항
| ID | 요구사항 | 우선순위 | 담당 |
|----|---------|----------|------|
| BR-002-1 | 24개 전체 섹션 지원 | P0 | Frontend |
| BR-002-2 | 상품 중심 섹션 생성 | P0 | Frontend |
| BR-002-3 | 실시간 수정 → 메인 반영 | P0 | Full Stack |
| BR-002-4 | 드래그앤드롭 순서 변경 | P1 | Frontend |
| BR-002-5 | 섹션별 다국어 지원 | P0 | Full Stack |

### BR-003: 통합 요구사항
| ID | 요구사항 | 우선순위 | 담당 |
|----|---------|----------|------|
| BR-003-1 | 헤더/푸터 언어팩 연동 | P0 | Frontend |
| BR-003-2 | 카테고리 다국어 지원 | P1 | Backend |
| BR-003-3 | 상품명/설명 다국어 | P2 | Backend |
| BR-003-4 | 캐싱 시스템 (3단계) | P1 | Backend |
| BR-003-5 | Socket.io 실시간 동기화 | P0 | Full Stack |

---

## 🔧 Technical Requirements

### TR-001: 데이터베이스 스키마
```sql
-- Phase 1: 언어 설정 테이블
CREATE TABLE IF NOT EXISTS language_settings (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    google_code VARCHAR(10),
    direction VARCHAR(3) DEFAULT 'ltr',
    flag_emoji VARCHAR(10),
    enabled BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2: 언어팩 키 테이블
CREATE TABLE IF NOT EXISTS language_pack_keys (
    id SERIAL PRIMARY KEY,
    namespace VARCHAR(50) DEFAULT 'common',
    key VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    default_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(namespace, key)
);

-- Phase 3: 언어팩 번역 테이블
CREATE TABLE IF NOT EXISTS language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER REFERENCES language_pack_keys(id) ON DELETE CASCADE,
    language_code VARCHAR(10) REFERENCES language_settings(code),
    value TEXT,
    is_auto_translated BOOLEAN DEFAULT false,
    translated_at TIMESTAMP,
    verified_at TIMESTAMP,
    UNIQUE(key_id, language_code)
);

-- Phase 4: UI 섹션 개선
ALTER TABLE ui_sections ADD COLUMN IF NOT EXISTS 
    section_category VARCHAR(50),
    data_source JSONB,
    translations JSONB;
```

### TR-002: API 통합 구조
```
/app/api/admin/i18n/
├── settings/              # 언어 설정 관리
│   ├── route.ts          # GET, POST, PUT, DELETE
│   └── [lang]/route.ts   # 개별 언어 설정
├── content/              # 언어팩 콘텐츠
│   ├── route.ts         # CRUD
│   ├── [key]/route.ts   # 개별 키 관리
│   └── batch/route.ts   # 일괄 처리
└── translate/           # 번역 서비스
    ├── route.ts        # 자동 번역
    └── validate/route.ts # 번역 검증
```

### TR-003: 서비스 레이어 구조
```
/lib/i18n/
├── core/
│   ├── LanguageManager.ts    # 언어 설정 관리
│   ├── TranslationEngine.ts  # 번역 엔진
│   └── ContentManager.ts     # 콘텐츠 관리
├── providers/
│   ├── GoogleTranslate.ts    # Google API
│   └── Manual.ts             # 수동 번역
├── cache/
│   ├── CacheManager.ts       # 통합 캐시
│   └── FileCache.ts          # 파일 캐시
└── generators/
    ├── JSONGenerator.ts       # JSON 생성
    └── StaticGenerator.ts     # 정적 파일
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Day 1)
#### 1.1 백업 및 정리
- [ ] **TASK-001**: 전체 시스템 백업
  - 기한: 2025-09-02 10:00
  - 담당: DevOps
  - 체크포인트: backup/2025-09-02-prd 생성 확인

- [ ] **TASK-002**: 중복 파일 이동
  - 기한: 2025-09-02 11:00
  - 담당: Backend
  - 대상 파일:
    ```
    - components/admin/ui-config/SectionManagerTab.tsx → backup
    - components/admin/ui-config/SectionOrderTab.tsx → backup
    - lib/translation.service.ts → backup
    - lib/google-translate.service.ts → backup
    ```

- [ ] **TASK-003**: 새 폴더 구조 생성
  - 기한: 2025-09-02 12:00
  - 담당: Backend
  - 생성 디렉토리:
    ```
    mkdir -p app/api/admin/i18n/{settings,content,translate}
    mkdir -p lib/i18n/{core,providers,cache,generators}
    mkdir -p contexts/i18n/hooks
    ```

### Phase 2: Database (Day 2)
#### 2.1 스키마 구현
- [ ] **TASK-004**: language_settings 테이블 생성
  - 기한: 2025-09-03 10:00
  - 담당: Backend
  - 검증: 한국어 기본 설정 확인

- [ ] **TASK-005**: 언어팩 테이블 생성
  - 기한: 2025-09-03 11:00
  - 담당: Backend
  - 검증: 외래키 제약 확인

- [ ] **TASK-006**: 초기 데이터 마이그레이션
  - 기한: 2025-09-03 14:00
  - 담당: Backend
  - 데이터:
    ```sql
    INSERT INTO language_settings (code, name, native_name, enabled, is_default)
    VALUES ('ko', '한국어', '한국어', true, true);
    ```

#### 2.2 섹션 테이블 개선
- [ ] **TASK-007**: ui_sections 테이블 개선
  - 기한: 2025-09-03 15:00
  - 담당: Backend
  - 추가 컬럼: section_category, data_source, translations

### Phase 3: API Integration (Day 3)
#### 3.1 API 통합
- [ ] **TASK-008**: 언어 설정 API 이동
  - 기한: 2025-09-04 10:00
  - 담당: Backend
  - 이동: languages/settings/* → i18n/settings/*

- [ ] **TASK-009**: 언어팩 API 통합
  - 기한: 2025-09-04 11:00
  - 담당: Backend
  - 통합: language-packs/* → i18n/content/*

- [ ] **TASK-010**: 번역 API 통합
  - 기한: 2025-09-04 14:00
  - 담당: Backend
  - 통합: translations/*, translate-settings/* → i18n/translate/*

- [ ] **TASK-011**: 리디렉션 설정
  - 기한: 2025-09-04 15:00
  - 담당: Backend
  - 목적: 하위 호환성 유지

#### 3.2 서비스 레이어
- [ ] **TASK-012**: LanguageManager 이동
  - 기한: 2025-09-04 16:00
  - 담당: Backend
  - 이동: lib/services/language-manager.ts → lib/i18n/core/LanguageManager.ts

- [ ] **TASK-013**: 중복 서비스 제거
  - 기한: 2025-09-04 17:00
  - 담당: Backend
  - 제거: lib/translation.service.ts, lib/google-translate.service.ts

### Phase 4: Frontend Integration (Day 4)
#### 4.1 섹션 관리 개선
- [ ] **TASK-014**: DynamicSectionRenderer 확장
  - 기한: 2025-09-05 10:00
  - 담당: Frontend
  - 추가 섹션 (18개):
    ```typescript
    const sectionComponents = {
      // 기존 6개
      hero, category, quicklinks, promo, ranking, recommended,
      // 추가 18개
      'best-sellers': BestSellers,
      'new-arrivals': NewArrivals,
      'flash-sale': FlashSale,
      'trending': TrendingProducts,
      'special-offers': SpecialOffers,
      'recently-viewed': RecentlyViewed,
      'seasonal': SeasonalCollection,
      'testimonials': Testimonials,
      'brand-spotlight': BrandSpotlight,
      'category-showcase': CategoryShowcase,
      'featured': FeaturedProducts,
      'instagram': InstagramFeed,
      'newsletter': Newsletter,
      'video': VideoShowcase,
      'banner-grid': BannerGrid
    };
    ```

- [ ] **TASK-015**: 'new' 섹션 페이지 개선
  - 기한: 2025-09-05 11:00
  - 담당: Frontend
  - 변경: 일반 섹션 → 상품 중심 섹션

- [ ] **TASK-016**: 실시간 동기화 구현
  - 기한: 2025-09-05 14:00
  - 담당: Full Stack
  - 구현: Socket.io 이벤트 연동

#### 4.2 언어 설정 UI
- [ ] **TASK-017**: LanguageSettingsTab 구현
  - 기한: 2025-09-05 15:00
  - 담당: Frontend
  - 기능: 언어 선택 UI (최대 3개)

- [ ] **TASK-018**: 헤더/푸터 언어팩 연동
  - 기한: 2025-09-05 16:00
  - 담당: Frontend
  - 대상: Header.tsx, Footer.tsx

- [ ] **TASK-019**: 섹션별 언어팩 연동
  - 기한: 2025-09-05 17:00
  - 담당: Frontend
  - 대상: 모든 섹션 컴포넌트

### Phase 5: Testing & Optimization (Day 5)
#### 5.1 JSON 생성 및 캐싱
- [ ] **TASK-020**: JSON 자동 생성 스크립트
  - 기한: 2025-09-06 10:00
  - 담당: Backend
  - 스크립트: scripts/generate-language-json.js

- [ ] **TASK-021**: 3단계 캐싱 구현
  - 기한: 2025-09-06 11:00
  - 담당: Backend
  - 단계: Memory → Redis → File

#### 5.2 테스트
- [ ] **TASK-022**: API 통합 테스트
  - 기한: 2025-09-06 14:00
  - 담당: QA
  - 범위: 모든 i18n API 엔드포인트

- [ ] **TASK-023**: 언어 전환 테스트
  - 기한: 2025-09-06 15:00
  - 담당: QA
  - 목표: <100ms 전환 시간

- [ ] **TASK-024**: 섹션 실시간 동기화 테스트
  - 기한: 2025-09-06 16:00
  - 담당: QA
  - 검증: 수정 → 메인페이지 즉시 반영

- [ ] **TASK-025**: 성능 최적화
  - 기한: 2025-09-06 17:00
  - 담당: Full Stack
  - 목표: 50% 응답 속도 향상

---

## 📊 Success Metrics

### 정량적 지표
| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| API 디렉토리 수 | 8개 | 3개 | 디렉토리 카운트 |
| 서비스 파일 수 | 12개 | 7개 | 파일 카운트 |
| 지원 섹션 수 | 6개 | 24개 | 컴포넌트 매핑 |
| 언어 전환 속도 | - | <100ms | Performance API |
| 섹션 수정 반영 | 수동 | 실시간 | Socket.io 이벤트 |
| 중복 코드 | 63개 | 0개 | 코드 분석 |

### 정성적 지표
- 관리자 만족도: 언어 추가 시간 3시간 → 10분
- 개발자 경험: 새 기능 추가 시간 70% 단축
- 시스템 안정성: 버그 발생률 60% 감소

---

## 🚨 Risk Management

### Risk Matrix
| 위험 | 영향도 | 발생확률 | 대응 방안 |
|------|--------|----------|-----------|
| API 호환성 문제 | High | Medium | 리디렉션 구현, 점진적 마이그레이션 |
| 데이터 손실 | Critical | Low | 3단계 백업, 트랜잭션 처리 |
| 성능 저하 | Medium | Medium | 캐싱 전략, 레이지 로딩 |
| 언어 전환 오류 | High | Low | 폴백 언어 설정, 에러 핸들링 |
| Socket.io 연결 실패 | Medium | Low | 폴링 폴백, 재연결 로직 |

---

## 📝 Acceptance Criteria

### AC-001: 언어 시스템
- ✅ 한국어가 유일한 기본 언어로 설정됨
- ✅ 관리자가 최대 3개 언어 선택 가능
- ✅ 선택된 언어별 JSON 파일 생성됨
- ✅ 언어 전환 시 100ms 이내 완료

### AC-002: 섹션 관리
- ✅ 24개 모든 섹션이 렌더링됨
- ✅ 상품 중심 섹션 생성 가능
- ✅ 수정 시 메인페이지 실시간 반영
- ✅ 드래그앤드롭으로 순서 변경 가능

### AC-003: 통합
- ✅ 헤더/푸터가 언어팩과 연동됨
- ✅ 모든 섹션이 다국어 지원
- ✅ 3단계 캐싱이 정상 작동
- ✅ Socket.io 실시간 동기화 작동

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