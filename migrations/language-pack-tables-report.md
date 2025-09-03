# ✅ Language Pack 테이블 구조 개선 완료
## Phase 2-2: 언어팩 테이블 구조 개선

### 📅 실행 일시: 2025-09-02 01:02

### 🗄️ 생성된 테이블 구조

#### 1. language_pack_keys 테이블 (마스터 키)
```sql
CREATE TABLE language_pack_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,  -- 'hero.title', 'common.add_to_cart'
    component_type VARCHAR(50) NOT NULL,    -- 'section', 'header', 'footer', 'common'
    component_id VARCHAR(100),              -- 'hero', 'quicklinks', 'promo'
    description TEXT,                       -- 키 설명
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### 2. language_pack_translations 테이블 (번역)
```sql
CREATE TABLE language_pack_translations (
    id SERIAL PRIMARY KEY,
    key_id INTEGER REFERENCES language_pack_keys(id),
    language_code VARCHAR(10) REFERENCES language_settings(code),
    translation TEXT NOT NULL,
    is_auto_translated BOOLEAN DEFAULT false,
    translator_notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(key_id, language_code)
);
```

#### 3. 추가 테이블
- **translation_cache**: Google Translate API 캐싱
- **ui_config**: UI 설정 저장 (header, footer, general)

### 📊 설치된 데이터 현황

#### 언어팩 키 분포 (총 38개)
| Component Type | Count | 용도 |
|---------------|-------|------|
| **section** | 20 | 각 섹션별 타이틀, 서브타이틀, 버튼 텍스트 |
| **common** | 8 | 공통 UI 요소 (장바구니, 가격, 재고 등) |
| **header** | 5 | 헤더 요소 (검색, 로그인, 장바구니) |
| **footer** | 5 | 푸터 링크 및 저작권 |

#### 섹션별 키 목록
**Hero Section (4개)**
- hero.title → "특별한 쇼핑 경험"
- hero.subtitle → "최고의 상품을 최저가로 만나보세요"
- hero.cta_primary → "쇼핑 시작하기"
- hero.cta_secondary → "더 알아보기"

**Product Sections (11개)**
- bestsellers.* (베스트셀러)
- newarrivals.* (신상품)
- flashsale.* (플래시 세일)
- recommended.* (추천 상품)
- ranking.* (실시간 랭킹)

**Navigation Sections (5개)**
- category.* (카테고리)
- quicklinks.* (바로가기)
- promo.* (프로모션)

### ✅ 외래키 제약 관계
```
language_settings (code) 
    ↓
language_pack_translations (language_code)
    ↑
language_pack_keys (id) → (key_id)
```

### 🔍 검증 결과
1. **테이블 생성**: ✅ 4개 테이블 모두 생성 완료
2. **인덱스**: ✅ 4개 인덱스 생성 (성능 최적화)
3. **외래키**: ✅ 정상 연결 확인
4. **한국어 번역**: ✅ 38개 모두 입력 완료
5. **데이터 무결성**: ✅ UNIQUE 제약으로 중복 방지

### 📝 사용 예시

```sql
-- 특정 섹션의 모든 번역 조회
SELECT 
    lpk.key_name,
    lpt.translation
FROM language_pack_keys lpk
JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
WHERE lpk.component_id = 'hero' 
    AND lpt.language_code = 'ko';

-- 영어 번역 추가 (관리자)
INSERT INTO language_pack_translations (key_id, language_code, translation)
SELECT id, 'en', 'Special Shopping Experience'
FROM language_pack_keys
WHERE key_name = 'hero.title';

-- JSON 생성용 쿼리
SELECT 
    lpk.key_name,
    json_object_agg(lpt.language_code, lpt.translation) as translations
FROM language_pack_keys lpk
JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
GROUP BY lpk.key_name;
```

### 🎯 달성 효과
- **정규화**: 키-값 구조로 중복 제거
- **확장성**: 새 언어 추가 시 translations 테이블에만 추가
- **성능**: 인덱스로 빠른 조회
- **유지보수**: 컴포넌트별 관리 용이
- **캐싱**: translation_cache로 API 호출 최소화

### ✨ 다음 단계
Phase 3-1: DynamicSectionRenderer 확장 (6개→24개 섹션) 진행 가능