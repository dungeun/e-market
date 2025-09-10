# 🌍 전체 시스템 Google Translate API 통합 설계서

## 📅 작성일: 2025-09-02
## 🎯 목적: 섹션/언어/헤더/푸터/팝업알림 완전 통합 시스템 설계

---

## 1. 🏗️ 전체 시스템 구조

### 1.1 통합 범위
```
┌────────────────────────────────────────────────────┐
│             Google Translate API                    │
│               (단일 번역 엔진)                        │
└─────────────────┬──────────────────────────────────┘
                  │
    ┌─────────────┼─────────────────────┐
    │             │                     │
    ▼             ▼                     ▼
┌──────────┐ ┌──────────┐        ┌──────────┐
│언어팩 관리│ │자동 번역 │        │수동 편집 │
│/admin/   │ │  서비스  │        │  인터페이스│
│language- │ │          │        │          │
│packs     │ │          │        │          │
└────┬─────┘ └────┬─────┘        └────┬─────┘
     │            │                    │
     └────────────┴────────────────────┘
                  │
    ┌─────────────┼──────────────────────────┐
    ▼             ▼              ▼            ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│UI 섹션 │  │헤더/푸터│  │팝업 알림 │  │상품 관리 │
│관리    │  │설정     │  │         │  │         │
└────────┘  └─────────┘  └──────────┘  └──────────┘
```

### 1.2 핵심 원칙
- **단일 번역 엔진**: Google Translate API만 사용
- **3개 언어 지원**: 한국어(ko), 영어(en), 일본어(jp)
- **완전 자동화**: 한 언어 입력 시 나머지 자동 생성
- **수동 편집 가능**: 자동 번역 후 수동 수정 지원

---

## 2. 🔗 Google Translate API 통합

### 2.1 API 설정
```typescript
// lib/services/google-translate.service.ts
import { TranslationServiceClient } from '@google-cloud/translate';

export class GoogleTranslateService {
  private client: TranslationServiceClient;
  private projectId = process.env.GOOGLE_PROJECT_ID;
  private location = 'global';
  
  // 지원 언어 매핑
  private languageMap = {
    ko: 'ko',    // 한국어
    en: 'en',    // 영어
    jp: 'ja'     // 일본어 (Google은 'ja' 사용)
  };
  
  async translateText(text: string, targetLang: string, sourceLang?: string) {
    const request = {
      parent: `projects/${this.projectId}/locations/${this.location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLang || 'ko',
      targetLanguageCode: this.languageMap[targetLang]
    };
    
    const [response] = await this.client.translateText(request);
    return response.translations[0].translatedText;
  }
  
  // 일괄 번역 (성능 최적화)
  async translateBatch(texts: string[], targetLang: string, sourceLang?: string) {
    const request = {
      parent: `projects/${this.projectId}/locations/${this.location}`,
      contents: texts,
      mimeType: 'text/plain',
      sourceLanguageCode: sourceLang || 'ko',
      targetLanguageCode: this.languageMap[targetLang]
    };
    
    const [response] = await this.client.translateText(request);
    return response.translations.map(t => t.translatedText);
  }
}
```

### 2.2 자동 번역 플로우
```
사용자 입력 (어느 언어든)
    ↓
언어 감지
    ↓
다른 2개 언어로 자동 번역
    ↓
DB 저장 (3개 언어 모두)
    ↓
캐시 업데이트
    ↓
실시간 반영 (Socket.io)
```

---

## 3. 📦 섹션 관리 언어팩 통합

### 3.1 UI 섹션 다국어 구조
```typescript
// DB: ui_sections 테이블
interface UISection {
  id: string;
  key: string;
  type: string;
  order: number;
  isActive: boolean;
  config: {
    layout: 'grid' | 'list' | 'carousel' | 'table';
    itemsPerRow?: number;
    autoPlay?: boolean;
  };
  translations: {
    ko: {
      title: string;
      subtitle?: string;
      description?: string;
    };
    en: {
      title: string;
      subtitle?: string;
      description?: string;
    };
    jp: {
      title: string;
      subtitle?: string;
      description?: string;
    };
  };
}
```

### 3.2 섹션 추가/수정 플로우
```
/admin/ui-config?tab=sections
    ↓
섹션 추가 클릭
    ↓
한국어로 제목 입력
    ↓
[자동 번역] 버튼 클릭
    ↓
Google API로 en, jp 자동 생성
    ↓
수동 편집 가능 (선택사항)
    ↓
저장 → DB + JSON 파일 생성
```

---

## 4. 🎨 헤더/푸터 언어팩 통합

### 4.1 헤더 메뉴 다국어 구조
```typescript
// DB: ui_configs 테이블의 config JSONB
{
  "header": {
    "menus": [
      {
        "id": "menu-home",
        "href": "/",
        "order": 1,
        "visible": true,
        "translations": {
          "ko": "홈",
          "en": "Home",
          "jp": "ホーム"
        }
      },
      {
        "id": "menu-products",
        "href": "/products",
        "order": 2,
        "visible": true,
        "translations": {
          "ko": "상품",
          "en": "Products",
          "jp": "製品"
        }
      }
    ]
  }
}
```

### 4.2 카테고리 대분류 자동 연동
```
/admin/categories 에서 대분류 관리
    ↓
카테고리 이름 입력 (한국어)
    ↓
Google API로 자동 번역
    ↓
헤더 메뉴에 자동 추가 옵션
    ↓
/admin/ui-config?tab=header 에서 확인/편집
```

### 4.3 푸터 컬럼 다국어 구조
```typescript
{
  "footer": {
    "columns": [
      {
        "id": "col-company",
        "order": 1,
        "translations": {
          "ko": { "title": "회사 정보" },
          "en": { "title": "Company" },
          "jp": { "title": "会社情報" }
        },
        "links": [
          {
            "id": "link-about",
            "href": "/about",
            "translations": {
              "ko": "회사 소개",
              "en": "About Us",
              "jp": "会社紹介"
            }
          }
        ]
      }
    ],
    "copyright": {
      "translations": {
        "ko": "© 2025 회사명. 모든 권리 보유.",
        "en": "© 2025 Company. All rights reserved.",
        "jp": "© 2025 会社名. 全著作権所有."
      }
    }
  }
}
```

---

## 5. 🔔 팝업 알림 언어팩 통합

### 5.1 현재 구조 (이미 다국어 지원)
```typescript
// /admin/popup-alerts
interface PopupAlert {
  id: string;
  message_ko: string;  // 한국어 메시지
  message_en: string;  // 영어 메시지
  message_jp: string;  // 일본어 메시지
  isActive: boolean;
  template: string;
  // ... 기타 설정
}
```

### 5.2 Google API 연동 개선
```
팝업 메시지 작성 (탭 선택)
    ↓
한국어 탭에서 메시지 입력
    ↓
[다른 언어 자동 생성] 버튼
    ↓
Google API로 en, jp 탭 자동 채움
    ↓
각 탭에서 수동 편집 가능
    ↓
저장 → 실시간 팝업 표시
```

---

## 6. 📄 언어팩 중앙 관리

### 6.1 통합 언어팩 구조
```typescript
// /admin/language-packs
interface LanguagePack {
  key: string;  // 유니크 키
  category: 'ui' | 'section' | 'header' | 'footer' | 'popup' | 'product' | 'common';
  translations: {
    ko: string;
    en: string;
    jp: string;
  };
  autoTranslated: boolean;  // 자동 번역 여부
  lastModified: Date;
  modifiedBy: string;  // 수정한 관리자
}
```

### 6.2 언어팩 카테고리별 관리
```
┌──────────────────────────────────────┐
│         언어팩 중앙 관리 대시보드        │
├──────────────────────────────────────┤
│ ✓ UI 텍스트 (325개)                   │
│ ✓ 섹션 제목 (24개)                    │
│ ✓ 헤더 메뉴 (8개)                     │
│ ✓ 푸터 링크 (15개)                    │
│ ✓ 팝업 메시지 (5개)                   │
│ ✓ 상품 정보 (1,234개)                 │
│ ✓ 공통 텍스트 (89개)                  │
└──────────────────────────────────────┘
```

---

## 7. 🔄 자동 동기화 시스템

### 7.1 실시간 동기화 플로우
```typescript
// 모든 관리 페이지에서 공통 사용
const useAutoTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  
  const autoTranslate = async (text: string, sourceLang: string = 'ko') => {
    setIsTranslating(true);
    
    try {
      // Google API 호출
      const translations = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text, sourceLang })
      });
      
      const result = await translations.json();
      
      // 결과 반환
      return {
        ko: sourceLang === 'ko' ? text : result.ko,
        en: sourceLang === 'en' ? text : result.en,
        jp: sourceLang === 'jp' ? text : result.jp
      };
    } finally {
      setIsTranslating(false);
    }
  };
  
  return { autoTranslate, isTranslating };
};
```

### 7.2 Socket.io 실시간 업데이트
```typescript
// 언어 변경 시 모든 연결된 클라이언트 업데이트
io.on('language:update', async (data) => {
  const { type, id, translations } = data;
  
  switch(type) {
    case 'section':
      io.emit('section:translated', { id, translations });
      break;
    case 'header':
      io.emit('header:translated', { id, translations });
      break;
    case 'footer':
      io.emit('footer:translated', { id, translations });
      break;
    case 'popup':
      io.emit('popup:translated', { id, translations });
      break;
  }
  
  // 캐시 무효화
  await invalidateCache(type, id);
});
```

---

## 8. 📊 JSON 생성 및 캐싱

### 8.1 통합 JSON 구조
```json
// /public/i18n/ko/integrated.json
{
  "generated": "2025-01-01T00:00:00Z",
  "language": "ko",
  "sections": {
    "hero": {
      "title": "환영합니다",
      "subtitle": "최고의 쇼핑 경험"
    }
  },
  "header": {
    "menus": [
      { "id": "home", "label": "홈", "href": "/" }
    ]
  },
  "footer": {
    "columns": [
      {
        "title": "회사 정보",
        "links": [
          { "label": "회사 소개", "href": "/about" }
        ]
      }
    ]
  },
  "popups": [
    {
      "id": "welcome",
      "message": "첫 구매 10% 할인!"
    }
  ],
  "common": {
    "addToCart": "장바구니 담기",
    "checkout": "결제하기",
    "search": "검색"
  }
}
```

### 8.2 캐시 전략
```
메모리 캐시 (5분 TTL)
    ↓ Miss
파일 캐시 (/public/cache)
    ↓ Miss
DB 조회 + Google API
    ↓
캐시 업데이트 (모든 레벨)
```

---

## 9. 🎯 통합 관리 대시보드

### 9.1 중앙 대시보드 구성
```
/admin/translations (새로운 통합 페이지)

┌─────────────────────────────────────────┐
│       번역 관리 대시보드                   │
├─────────────────────────────────────────┤
│ [섹션] [헤더] [푸터] [팝업] [상품] [공통]   │
├─────────────────────────────────────────┤
│ 검색: [_______________] [🔍]             │
│                                         │
│ ┌─────┬────────┬────────┬────────┐     │
│ │ 키  │ 한국어  │ 영어   │ 일본어  │     │
│ ├─────┼────────┼────────┼────────┤     │
│ │hero.│환영합니다│Welcome │ようこそ │ [✏️] │
│ │title│        │        │        │     │
│ └─────┴────────┴────────┴────────┘     │
│                                         │
│ [일괄 자동 번역] [JSON 내보내기] [가져오기] │
└─────────────────────────────────────────┘
```

### 9.2 일괄 작업 기능
```typescript
// 일괄 자동 번역
const batchTranslate = async () => {
  const untranslatedItems = await getUntranslatedItems();
  
  for (const batch of chunk(untranslatedItems, 100)) {
    const texts = batch.map(item => item.ko);
    const enTranslations = await googleAPI.translateBatch(texts, 'en');
    const jpTranslations = await googleAPI.translateBatch(texts, 'jp');
    
    await saveBatchTranslations(batch, enTranslations, jpTranslations);
  }
};

// CSV 내보내기/가져오기
const exportToCSV = () => {
  // 모든 번역 데이터를 CSV로 내보내기
};

const importFromCSV = (file) => {
  // CSV 파일에서 번역 데이터 가져오기
};
```

---

## 10. 📱 사용자 언어 전환

### 10.1 언어 선택 UI
```typescript
// components/LanguageSelector.tsx
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="ko">🇰🇷 한국어</option>
      <option value="en">🇺🇸 English</option>
      <option value="jp">🇯🇵 日本語</option>
    </select>
  );
};
```

### 10.2 언어별 데이터 로딩
```typescript
// 현재 언어에 맞는 데이터 자동 로딩
const useTranslatedData = (key: string) => {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 언어별 캐시된 데이터 로드
    loadTranslatedData(key, language).then(setData);
  }, [key, language]);
  
  return data;
};
```

---

## 11. 🚀 구현 우선순위

### Phase 1: Google API 설정 (1일)
- [ ] Google Cloud 프로젝트 설정
- [ ] Translation API 활성화
- [ ] 서비스 계정 키 생성
- [ ] 환경 변수 설정

### Phase 2: 자동 번역 서비스 (2일)
- [ ] GoogleTranslateService 클래스 구현
- [ ] 일괄 번역 기능
- [ ] 언어 감지 기능
- [ ] 에러 처리 및 재시도 로직

### Phase 3: 관리자 UI 통합 (3일)
- [ ] 섹션 관리 자동 번역 버튼
- [ ] 헤더/푸터 자동 번역
- [ ] 팝업 알림 자동 번역
- [ ] 통합 번역 대시보드

### Phase 4: 실시간 동기화 (2일)
- [ ] Socket.io 이벤트 구현
- [ ] 캐시 무효화 로직
- [ ] JSON 파일 자동 생성

### Phase 5: 테스트 및 최적화 (2일)
- [ ] 번역 품질 검증
- [ ] 성능 테스트
- [ ] 사용자 언어 전환 테스트
- [ ] 백업 및 롤백 시스템

---

## 12. 💰 비용 최적화

### 12.1 Google Translate API 요금
```
- 처음 500,000자/월: 무료
- 500,001 ~ 10억자: $20/백만자
- 10억자 이상: 협의
```

### 12.2 비용 절감 전략
1. **캐싱 적극 활용**: 한 번 번역한 내용은 캐시
2. **일괄 번역**: 개별 API 호출 대신 배치 처리
3. **변경된 부분만 번역**: 전체가 아닌 델타만 처리
4. **수동 편집 우선**: 자주 사용되는 텍스트는 수동 번역

---

## 13. ⚠️ 주의사항

### 13.1 번역 품질
- 자동 번역 후 반드시 검수 필요
- 브랜드명, 고유명사는 번역 제외 설정
- 문맥에 따른 의미 차이 확인

### 13.2 성능 고려사항
- API 호출 제한 (초당 100회)
- 타임아웃 설정 (30초)
- 실패 시 폴백 처리

### 13.3 보안
- API 키 환경 변수로 관리
- 민감 정보 번역 제외
- 로그에 번역 내용 미포함

---

## 14. ✅ 체크리스트

### 필수 구현
- [ ] Google Translate API 연동
- [ ] 3개 언어 (ko, en, jp) 완벽 지원
- [ ] 섹션 관리 자동 번역
- [ ] 헤더/푸터 자동 번역
- [ ] 팝업 알림 자동 번역
- [ ] 언어팩 중앙 관리
- [ ] 실시간 동기화
- [ ] 캐시 시스템

### 선택 구현
- [ ] 번역 품질 평가 시스템
- [ ] 번역 히스토리 관리
- [ ] A/B 테스트 지원
- [ ] 번역 통계 대시보드

---

## 💡 결론

이 설계는 Google Translate API를 활용하여 모든 시스템 구성 요소를 완벽하게 통합하는 방안입니다.

**핵심 특징:**
1. **완전 자동화**: 한 언어만 입력하면 나머지 자동 생성
2. **통합 관리**: 섹션, 헤더, 푸터, 팝업 모두 한 곳에서 관리
3. **실시간 동기화**: 변경사항 즉시 반영
4. **비용 효율적**: 캐싱과 일괄 처리로 API 비용 최소화

**예상 효과:**
- 번역 작업 시간 90% 감소
- 일관된 번역 품질 유지
- 관리자 편의성 극대화
- 사용자 경험 개선

이 시스템으로 완벽한 다국어 e-commerce 플랫폼을 구축할 수 있습니다.