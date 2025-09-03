# 메인페이지 섹션 및 언어 시스템 문제 분석 리포트

## 작성일: 2024-12-29
## 작성자: System Analysis Team
## 목적: 현재 시스템 문제점 분석 및 해결 방안 제시

---

## 1. 현재 시스템 구조

### 1.1 섹션 시스템
- **총 7개 핵심 섹션 운영**
  - hero (히어로 배너)
  - category (카테고리 메뉴)
  - promo (프로모션)
  - quicklinks (퀵링크)
  - ranking (랭킹)
  - recommended (추천상품)
  - 기타 동적 섹션

### 1.2 언어 시스템 구조
- **3단계 번역 체계**
  1. **상품 데이터**: 등록 시 Google API로 3개국어 자동 번역 + 수정 가능
  2. **섹션/메뉴**: 실시간 수정 가능, Google API 번역
  3. **UI 텍스트**: `/admin/language-packs`에서 통합 관리 (로그인, 버튼 등)

### 1.3 Google 번역 API
- **설정 위치**: `/admin/language-packs`에 API 키 저장됨
- **엔드포인트**: `/api/admin/translate/google`
- **지원 언어**: 한국어, 영어, 일본어, 프랑스어 등 동적 지원

---

## 2. 현재 발생한 문제점

### 2.1 섹션 표시 문제
**증상**: category, promo, quicklinks, ranking 섹션이 메인페이지에 표시되지 않음

**원인 분석**:
```javascript
// 문제 1: DB 저장 시 type 필드 누락
// admin 페이지: /api/admin/ui-sections/category
INSERT INTO ui_sections (key, title, ...) // type 필드 없음

// 메인페이지 조회: /api/ui-sections
SELECT * FROM ui_sections WHERE type = 'category' // 조회 실패
```

**영향받는 파일**:
- `/app/api/admin/ui-sections/category/route.ts`
- `/app/api/admin/ui-sections/promo/route.ts`
- `/app/api/admin/ui-sections/quicklinks/route.ts`
- `/app/api/admin/ui-sections/ranking/route.ts`

### 2.2 언어 변경 미작동
**증상**: Hero 섹션은 표시되지만 언어 변경 시 콘텐츠가 바뀌지 않음

**원인 분석**:
```javascript
// 문제 2: useEffect 의존성 배열에 currentLanguage 누락
useEffect(() => {
  loadHeroData();
}, [data, sectionId]); // ❌ currentLanguage 없음

// 문제 3: API 호출 시 언어 정보 미전달
fetch(`/api/ui-sections/${sectionId}`); // ❌ 언어 헤더 없음
```

**영향받는 파일**:
- `/components/sections/HeroSection.tsx`
- `/components/sections/CategorySection.tsx`
- 모든 섹션 컴포넌트

### 2.3 번역 시스템 이중화
**증상**: 번역 데이터가 두 곳에 분산 저장되어 관리 복잡

**현재 구조**:
```
1. ui_sections.data.translations (섹션별 자체 번역)
2. language_pack_* 테이블 (UI 텍스트 번역)
```

**개선 필요**:
- 섹션 콘텐츠: Google API 실시간 번역으로 통합
- UI 텍스트: language_pack 유지

---

## 3. 해결 방안

### 3.1 Phase 1: 긴급 수정 (섹션 표시 문제)

#### Step 1: DB 직접 수정
```sql
-- type 필드 보정
UPDATE ui_sections SET type = key WHERE type IS NULL OR type = '';
```

#### Step 2: API 수정
```typescript
// 각 섹션 API의 PUT/POST 메서드 수정
const insertResult = await query(`
  INSERT INTO ui_sections (key, type, title, "order", "isActive", data)
  VALUES ($1, $1, $2, $3, $4, $5)  -- key와 type 동일
`, [sectionKey, title, order, visible, dataJson]);
```

### 3.2 Phase 2: 언어 시스템 개선

#### Step 1: 섹션 컴포넌트 수정
```typescript
// currentLanguage 의존성 추가
useEffect(() => {
  loadSectionData();
}, [sectionId, currentLanguage]); // ✅ 언어 변경 감지

// API 호출 시 언어 정보 전달
const response = await fetch(`/api/ui-sections/${sectionId}`, {
  headers: { 'Accept-Language': currentLanguage }
});
```

#### Step 2: Google 번역 통합
```typescript
// 섹션 데이터 번역 처리
const { translateDynamic } = useLanguage();

const translateContent = async (content) => {
  if (currentLanguage === 'ko') return content;
  
  return {
    ...content,
    title: await translateDynamic(content.title),
    subtitle: await translateDynamic(content.subtitle)
  };
};
```

### 3.3 Phase 3: 캐싱 전략

#### 상품 데이터 캐싱
```typescript
// 상품 등록/수정 시
1. 3개국어 자동 번역 (Google API)
2. DB에 영구 저장
3. 수정 가능한 형태로 관리
```

#### 섹션/메뉴 캐싱
```typescript
// 실시간 번역 + 짧은 캐싱
1. 메모리 캐시: 5분
2. 언어 변경 시 캐시 무효화
3. 관리자 수정 시 즉시 반영
```

#### UI 텍스트 캐싱
```typescript
// language_pack 테이블 기반
1. 서버 시작 시 로드
2. 수정 시 실시간 반영 (Socket.io)
3. 클라이언트 localStorage 캐싱
```

---

## 4. 구현 우선순위

### 🔴 긴급 (오늘 완료)
1. [ ] DB type 필드 수정 (SQL 직접 실행)
2. [ ] 4개 섹션 API route.ts 파일 수정
3. [ ] 섹션 표시 테스트

### 🟡 단기 (1-2일)
1. [ ] 섹션 컴포넌트 currentLanguage 의존성 추가
2. [ ] API 호출 시 언어 헤더 추가
3. [ ] Google 번역 API 연동 테스트

### 🟢 중기 (3-5일)
1. [ ] 캐싱 전략 구현
2. [ ] 관리자 페이지 UI 개선
3. [ ] 성능 최적화

---

## 5. 파일별 수정 내역

### 수정 필요 파일 목록
```
/app/api/admin/ui-sections/
├── category/route.ts      [type 필드 추가]
├── promo/route.ts         [type 필드 추가]
├── quicklinks/route.ts    [type 필드 추가]
├── ranking/route.ts       [type 필드 추가]
└── hero/route.ts          [참고용]

/components/sections/
├── HeroSection.tsx        [언어 의존성 추가]
├── CategorySection.tsx    [언어 의존성 추가]
├── PromoSection.tsx       [언어 의존성 추가]
├── QuickLinksSection.tsx  [언어 의존성 추가]
└── RankingSection.tsx     [언어 의존성 추가]

/components/
└── DynamicSectionRenderer.tsx [언어 전달 로직]
```

---

## 6. 테스트 체크리스트

### 섹션 표시 테스트
- [ ] Category 섹션 표시 확인
- [ ] Promo 섹션 표시 확인
- [ ] QuickLinks 섹션 표시 확인
- [ ] Ranking 섹션 표시 확인

### 언어 변경 테스트
- [ ] 한국어 → 영어 전환
- [ ] 영어 → 일본어 전환
- [ ] 일본어 → 프랑스어 전환
- [ ] 새로고침 후 언어 유지

### 관리자 기능 테스트
- [ ] 섹션 콘텐츠 수정
- [ ] 순서 변경
- [ ] 활성화/비활성화
- [ ] 번역 수정

---

## 7. 예상 결과

### 수정 전
- 섹션 5개 중 1개만 표시 (Hero만)
- 언어 변경 미작동
- 번역 시스템 혼재

### 수정 후
- 모든 섹션 정상 표시
- 언어 변경 즉시 반영
- Google API 기반 통합 번역
- 관리 효율성 향상

---

## 8. 리스크 및 대응

### 리스크 1: DB 수정 실패
- **대응**: 백업 후 진행, 롤백 스크립트 준비

### 리스크 2: Google API 한도 초과
- **대응**: 캐싱 강화, 필요시 유료 플랜 전환

### 리스크 3: 성능 저하
- **대응**: 번역 결과 캐싱, 비동기 처리

---

## 9. 완료 후 비교 기준

### 정량적 지표
- 섹션 표시율: 20% → 100%
- 언어 전환 성공률: 0% → 100%
- API 호출 횟수: 감소 예상 (캐싱)

### 정성적 지표
- 관리자 편의성 향상
- 유지보수 용이성 증가
- 시스템 일관성 확보

---

## 10. 다음 단계

1. **즉시 실행**: DB type 필드 수정
2. **코드 수정**: 각 API 및 컴포넌트
3. **테스트**: 체크리스트 기반 검증
4. **모니터링**: 24시간 관찰
5. **최종 보고**: 결과 문서화

---

**작성 완료: 2024-12-29**
**다음 리뷰: 수정 완료 후**