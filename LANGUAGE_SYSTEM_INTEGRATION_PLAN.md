# 🌐 언어팩 시스템 통합 계획
## Language Pack System Integration Plan

---

## 📌 현재 상황 분석

### 시스템 구조 문제점
프로젝트에 **2개의 독립적인 언어팩 시스템**이 혼재되어 충돌 발생

#### 1️⃣ 레거시 시스템 (language_packs 테이블)
```sql
-- 고정 컬럼 구조
CREATE TABLE language_packs (
    key VARCHAR(255) PRIMARY KEY,
    ko TEXT,
    en TEXT, 
    ja TEXT,
    zh TEXT,
    vi TEXT
);
```
- **문제점**: 언어 추가 시 테이블 구조 변경 필요
- **사용처**: 
  - `/lib/cache/language-packs.ts`
  - `/app/api/language-packs/route.ts`
  - 프론트엔드 LanguageContext

#### 2️⃣ 새로운 동적 시스템 (language_pack_keys + translations)
```sql
-- 동적 구조
CREATE TABLE language_pack_keys (
    id UUID PRIMARY KEY,
    key_name VARCHAR(255),
    component_type VARCHAR(50),
    component_id VARCHAR(100)
);

CREATE TABLE language_pack_translations (
    id UUID PRIMARY KEY,
    key_id UUID REFERENCES language_pack_keys(id),
    language_code VARCHAR(10),
    translation TEXT
);
```
- **장점**: 언어 무제한 추가 가능
- **사용처**:
  - `/app/api/admin/i18n/content/route.ts`
  - `/app/admin/language-packs/page.tsx`

### 핵심 문제점
1. **데이터 동기화 없음**: Admin에서 수정한 내용이 Frontend에 반영 안됨
2. **SQL 오류**: `namespace` 컬럼 참조 오류
3. **테이블명 불일치**: `Product` vs `products`
4. **이중 관리**: 같은 번역을 2곳에서 관리

---

## 🎯 통합 목표

### 비즈니스 요구사항
| ID | 요구사항 | 우선순위 |
|----|---------|----------|
| BR-001 | 한국어는 유일한 기본 언어 | P0 |
| BR-002 | 관리자가 최대 3개 추가 언어 선택 | P0 |
| BR-003 | Admin 수정 → Frontend 즉시 반영 | P0 |
| BR-004 | Google Translate API 자동 번역 | P1 |
| BR-005 | 언어별 JSON 파일 자동 생성 | P1 |

### 기술적 목표
- API 디렉토리: 8개 → 3개
- 서비스 파일: 12개 → 7개
- 중복 코드: 63개 → 0개
- 언어 전환 속도: < 100ms
- 캐싱: Memory → Redis → File (3단계)

---

## 🔧 기술 아키텍처

### 통합 데이터베이스 스키마
```sql
-- Phase 1: 언어 설정 테이블
CREATE TABLE IF NOT EXISTS language_settings (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    google_code VARCHAR(10),
    flag_emoji VARCHAR(10),
    enabled BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2: 통합 언어팩 시스템 (기존 활용)
-- language_pack_keys (이미 존재)
-- language_pack_translations (이미 존재)

-- Phase 3: 레거시 테이블 마이그레이션 후 제거
-- language_packs → language_pack_keys + translations
```

### API 구조 통합
```
/app/api/
├── admin/
│   └── i18n/
│       ├── settings/       # 언어 설정 관리
│       ├── content/        # 언어팩 콘텐츠 (기존)
│       └── translate/      # 번역 서비스
└── public/
    └── language-packs/     # 공개 API (캐시 적용)
```

### 서비스 레이어 구조
```
/lib/i18n/
├── core/
│   ├── LanguageManager.ts     # 언어 설정 관리
│   ├── ContentManager.ts      # 콘텐츠 관리
│   └── TranslationEngine.ts   # 번역 엔진
├── cache/
│   ├── MemoryCache.ts        # 1차 캐시
│   ├── RedisCache.ts         # 2차 캐시
│   └── FileCache.ts          # 3차 캐시
└── migration/
    └── LegacyMigrator.ts      # 레거시 데이터 이전
```

---

## 📅 구현 단계

### Phase 1: 즉시 수정 (긴급)
#### 레거시 시스템 오류 수정
```typescript
// /lib/cache/language-packs.ts
// AS-IS (오류)
const sql = `SELECT namespace, key FROM language_packs`

// TO-BE (수정)
const sql = `SELECT key, ko, en, ja FROM language_packs`
```

```typescript
// /lib/cache/preload-service.ts
// AS-IS (오류)
const sql = `SELECT * FROM Product`

// TO-BE (수정)
const sql = `SELECT * FROM products`
```

### Phase 2: API 통합 (1일차)
#### 2.1 새로운 통합 API 생성
```typescript
// /app/api/public/language-packs/route.ts
export async function GET() {
  // 1. language_pack_keys + translations 조회
  // 2. 캐시 확인 (Memory → Redis → DB)
  // 3. 레거시 포맷으로 변환
  // 4. 응답
}
```

#### 2.2 Frontend 연결 변경
```typescript
// /contexts/LanguageContext.tsx
const loadLanguagePacks = async () => {
  // AS-IS
  const response = await fetch('/api/language-packs')
  
  // TO-BE  
  const response = await fetch('/api/public/language-packs')
}
```

### Phase 3: 데이터 마이그레이션 (2일차)
#### 3.1 마이그레이션 스크립트
```javascript
// scripts/migrate-language-packs.js
async function migrate() {
  // 1. language_packs 데이터 읽기
  const legacyPacks = await query('SELECT * FROM language_packs')
  
  // 2. language_pack_keys 생성
  for (const pack of legacyPacks) {
    const keyId = await createKey(pack.key)
    
    // 3. 각 언어별 translation 생성
    await createTranslation(keyId, 'ko', pack.ko)
    await createTranslation(keyId, 'en', pack.en)
    await createTranslation(keyId, 'ja', pack.ja)
  }
}
```

### Phase 4: 캐싱 구현 (3일차)
#### 4.1 3단계 캐싱 시스템
```typescript
// /lib/i18n/cache/CacheManager.ts
class CacheManager {
  async get(key: string) {
    // 1차: Memory Cache (< 1ms)
    const memoryResult = this.memory.get(key)
    if (memoryResult) return memoryResult
    
    // 2차: Redis Cache (< 10ms)
    const redisResult = await this.redis.get(key)
    if (redisResult) {
      this.memory.set(key, redisResult)
      return redisResult
    }
    
    // 3차: Database (< 50ms)
    const dbResult = await this.fetchFromDB(key)
    await this.redis.set(key, dbResult)
    this.memory.set(key, dbResult)
    return dbResult
  }
}
```

### Phase 5: 실시간 동기화 (4일차)
#### 5.1 Socket.io 이벤트
```typescript
// Admin 수정 시
socket.emit('language:updated', {
  key: 'header.home',
  translations: { ko: '홈', en: 'Home' }
})

// Frontend 수신
socket.on('language:updated', (data) => {
  // 캐시 무효화
  queryClient.invalidateQueries(['language-packs'])
  // UI 업데이트
  updateUI(data)
})
```

### Phase 6: 레거시 제거 (5일차)
#### 6.1 레거시 테이블 백업 후 제거
```bash
# 백업
pg_dump -t language_packs > backup/language_packs_backup.sql

# 제거 (확인 후)
DROP TABLE language_packs;
```

---

## ✅ 검증 체크리스트

### 기능 검증
- [ ] Admin에서 언어팩 수정 시 Frontend 즉시 반영
- [ ] 언어 전환 시 100ms 이내 완료
- [ ] 새 언어 추가 시 시스템 전체 적용
- [ ] Google Translate API 자동 번역 작동

### 성능 검증
- [ ] 메모리 캐시 적중률 > 80%
- [ ] Redis 캐시 적중률 > 95%
- [ ] API 응답 시간 < 50ms
- [ ] 언어 전환 시간 < 100ms

### 데이터 검증
- [ ] 모든 레거시 데이터 정상 마이그레이션
- [ ] 번역 누락 없음
- [ ] 언어별 JSON 파일 생성

---

## 🚨 리스크 관리

### 위험 요소 및 대응
| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| 마이그레이션 중 데이터 손실 | Critical | 3단계 백업, 트랜잭션 처리 |
| API 호환성 문제 | High | 리디렉션, 점진적 전환 |
| 캐시 불일치 | Medium | TTL 설정, 강제 갱신 API |
| 성능 저하 | Medium | 캐싱 최적화, CDN 활용 |

### 롤백 계획
```bash
#!/bin/bash
# rollback.sh

# 1. 백업 데이터 복원
psql -d commerce_nextjs < backup/language_packs_backup.sql

# 2. API 리디렉션 복원
cp backup/api-routes/* app/api/

# 3. Frontend 원복
git checkout HEAD~1 contexts/LanguageContext.tsx

# 4. 캐시 초기화
redis-cli FLUSHALL
```

---

## 📊 성공 지표

### 정량적 지표
| 지표 | 현재 | 목표 |
|------|------|------|
| API 디렉토리 수 | 8개 | 3개 |
| 중복 코드 | 63개 | 0개 |
| 언어 전환 속도 | - | < 100ms |
| 캐시 적중률 | 0% | > 90% |

### 정성적 지표
- 관리자 만족도: 언어 관리 시간 90% 단축
- 개발자 경험: 새 기능 추가 시간 70% 단축
- 시스템 안정성: 버그 발생률 60% 감소

---

## 📎 관련 문서

### 참조 문서
- `/docs/PRD-통합시스템구현계획.md`
- `/docs/언어팩-폴더구조-분석보고서.md`
- `/app/api/admin/i18n/content/route.ts`
- `/contexts/LanguageContext.tsx`

### 기술 문서
- [Next.js 15 Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Socket.io Documentation](https://socket.io/docs/v4/)

---

**작성일**: 2025-01-12  
**작성자**: System Architect  
**버전**: 1.0.0  
**상태**: READY FOR IMPLEMENTATION