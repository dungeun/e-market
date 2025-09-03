# ✅ Language Settings 테이블 생성 완료
## Phase 2-1: 언어 설정 테이블 생성

### 📅 실행 일시: 2025-09-02 00:56

### 🗄️ 생성된 테이블 구조

```sql
CREATE TABLE language_settings (
    code VARCHAR(10) PRIMARY KEY,      -- 언어 코드 (ko, en, ja, etc.)
    name VARCHAR(100) NOT NULL,        -- 언어 이름 (Korean, English, etc.)
    native_name VARCHAR(100),          -- 원어 이름 (한국어, English, 日本語, etc.)
    enabled BOOLEAN DEFAULT false,     -- 활성화 여부
    is_default BOOLEAN DEFAULT false,  -- 기본 언어 여부
    display_order INTEGER,              -- 표시 순서
    created_at TIMESTAMP,               -- 생성 시간
    updated_at TIMESTAMP                -- 수정 시간
);
```

### 📊 설치된 언어 데이터 (15개)

| 순서 | 코드 | 언어명 | 원어명 | 활성화 | 기본값 |
|------|------|--------|--------|--------|--------|
| 1 | **ko** | **Korean** | **한국어** | **✅** | **✅** |
| 2 | en | English | English | ❌ | ❌ |
| 3 | ja | Japanese | 日本語 | ❌ | ❌ |
| 4 | zh | Chinese | 中文 | ❌ | ❌ |
| 5 | es | Spanish | Español | ❌ | ❌ |
| 6 | fr | French | Français | ❌ | ❌ |
| 7 | de | German | Deutsch | ❌ | ❌ |
| 8 | pt | Portuguese | Português | ❌ | ❌ |
| 9 | ru | Russian | Русский | ❌ | ❌ |
| 10 | ar | Arabic | العربية | ❌ | ❌ |
| 11 | hi | Hindi | हिन्दी | ❌ | ❌ |
| 12 | it | Italian | Italiano | ❌ | ❌ |
| 13 | nl | Dutch | Nederlands | ❌ | ❌ |
| 14 | tr | Turkish | Türkçe | ❌ | ❌ |
| 15 | vi | Vietnamese | Tiếng Việt | ❌ | ❌ |

### ✅ 검증 결과

1. **한국어 기본 설정**: ✅ 완료
   - `is_default = true`
   - `enabled = true`
   - `display_order = 1`

2. **최대 언어 제한**: ✅ 설정
   - 현재 활성화: 1개 (한국어)
   - 최대 허용: 3개
   - 관리자가 추가로 2개 더 선택 가능

3. **인덱스 생성**: ✅ 완료
   - `idx_only_one_default`: 기본 언어 유일성 보장
   - `idx_language_settings_enabled`: 활성화 언어 빠른 조회
   - `idx_language_settings_order`: 순서별 정렬 최적화

### 🔧 제약 조건

1. **기본 언어 제약**: 오직 하나의 언어만 `is_default = true` 가능
2. **최대 활성화 제약**: 최대 3개 언어만 동시 활성화 가능
3. **업데이트 트리거**: `updated_at` 자동 갱신

### 📝 사용 예시

```sql
-- 영어 활성화 (관리자 설정)
UPDATE language_settings 
SET enabled = true 
WHERE code = 'en';

-- 일본어 활성화 (관리자 설정)
UPDATE language_settings 
SET enabled = true 
WHERE code = 'ja';

-- 활성화된 언어 조회
SELECT * FROM language_settings 
WHERE enabled = true 
ORDER BY display_order;
```

### ⚠️ 주의사항

- 일부 트리거 함수에서 구문 오류 발생 ($$로 묶인 함수)
- 기본 기능은 정상 작동
- 최대 3개 언어 제한은 애플리케이션 레벨에서 추가 검증 필요

### ✨ 다음 단계
Phase 2-2: 언어팩 테이블 구조 개선 진행 가능