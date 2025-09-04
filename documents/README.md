# 📚 Commerce Next.js 프로젝트 문서

## 개요
이 폴더는 프로젝트의 핵심 시스템들에 대한 **상세한 기술 문서**를 포함합니다.  
각 문서는 시스템의 구조, 데이터 플로우, API, 파일 구조 등을 자세히 설명합니다.

## 📖 문서 목록

### 1. [언어팩 시스템](./LANGUAGE_SYSTEM_ARCHITECTURE.md)
- **동적 다국어 지원 시스템**
- Admin에서 설정한 언어가 API를 통해 전체 앱에 적용
- 3단계 캐싱 시스템 (메모리 → Redis → DB)
- 레거시 시스템과 새 동적 시스템 통합

**주요 컴포넌트:**
- `/api/public/language-packs` - 통합 언어팩 API
- `/lib/cache/language-cache.ts` - 3단계 캐싱
- `LanguageContext.tsx` - React Context

### 2. [UI 섹션 시스템](./UI_SECTIONS_ARCHITECTURE.md)
- **홈페이지 UI 구성요소 동적 관리**
- 섹션 추가/수정/삭제 및 순서 변경
- 베스트 상품 자동/수동 선택 시스템
- 언어별 이미지 지원

**주요 컴포넌트:**
- `/api/admin/ui-config/sections` - 섹션 CRUD API
- `/admin/ui-config/sections/[id]` - 섹션 편집 페이지
- `ui_sections` 테이블 - JSONB content 필드

### 3. [메인 페이지 시스템](./MAIN_PAGE_ARCHITECTURE.md)
- **완전 동적 홈페이지 구성**
- 서버 사이드 렌더링 (SSR)
- 섹션별 데이터 로딩 전략
- 성능 최적화 및 캐싱

**주요 컴포넌트:**
- `app/(shop)/page.tsx` - 메인 페이지
- `components/sections/` - 섹션별 컴포넌트
- 하이브리드 캐싱 전략

## 🔑 핵심 원칙

### 1. 동적 구성 (No Hardcoding)
```typescript
// ❌ 잘못된 예
const languages = ['ko', 'en', 'jp'];

// ✅ 올바른 예
const languages = await getLanguageSettings();
```

### 2. 캐싱 우선
- 모든 정적 데이터는 캐싱
- 3단계 캐싱: 메모리 → Redis → DB
- 캐시 무효화 전략 명확히

### 3. 타입 안정성
```typescript
// 항상 타입 체크
const content = typeof section.content === 'string' 
  ? JSON.parse(section.content) 
  : section.content || {};
```

## 🏗️ 전체 아키텍처

```
┌─────────────────┐
│   Admin Panel   │
└────────┬────────┘
         │ 설정
         ▼
┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │◄────│     Redis       │
│   (Primary DB)  │     │   (Cache Layer) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────┬───────────────┘
                 │ 데이터
                 ▼
┌─────────────────────────────────────┐
│            API Layer                │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ Public APIs │  │  Admin APIs  │ │
│  └─────────────┘  └──────────────┘ │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         Next.js Application         │
│  ┌─────────────┐  ┌──────────────┐ │
│  │   SSR Pages │  │  Client Side │ │
│  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
```

## 📁 프로젝트 구조

```
commerce-nextjs/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API Routes
│   │   ├── public/        # 공개 API (인증 불필요)
│   │   └── admin/         # 관리자 API (인증 필요)
│   ├── (shop)/            # 쇼핑몰 페이지
│   └── admin/             # 관리자 페이지
├── components/            # React 컴포넌트
│   ├── sections/          # 섹션 컴포넌트
│   └── admin/             # 관리자 컴포넌트
├── lib/                   # 유틸리티 및 헬퍼
│   ├── cache/             # 캐싱 로직
│   └── db/                # 데이터베이스 연결
├── contexts/              # React Contexts
├── hooks/                 # Custom Hooks
├── scripts/               # 유틸리티 스크립트
└── documents/             # 프로젝트 문서 (이 폴더)
```

## 🚀 시작하기

### 1. 환경 설정
```bash
# 환경 변수 설정
cp .env.example .env.local

# 의존성 설치
npm install

# DB 마이그레이션
npm run migrate

# 개발 서버 시작
npm run dev
```

### 2. 주요 포트
- **3001**: Next.js 개발 서버
- **5432**: PostgreSQL (Podman)
- **6381**: Redis (Podman)

### 3. 관리자 패널
- URL: `http://localhost:3001/admin`
- 언어팩 관리: `/admin/language-packs`
- UI 섹션 관리: `/admin/ui-config`

## 🔧 유지보수

### 캐시 클리어
```bash
# Redis 캐시 전체 삭제
redis-cli -p 6381 FLUSHDB

# 언어팩 캐시만 삭제
redis-cli -p 6381 DEL "language:packs:*"
```

### 데이터베이스 백업
```bash
# 전체 백업
pg_dump -h localhost -p 5432 -U postgres commerce_nextjs > backup.sql

# 특정 테이블만 백업
pg_dump -t ui_sections -t language_pack_keys > sections_backup.sql
```

### 로그 확인
```bash
# PM2 로그
pm2 logs

# 애플리케이션 로그
tail -f logs/app.log
```

## 📝 업데이트 시 주의사항

1. **언어팩 수정 시**
   - 캐시 무효화 필요
   - Socket.io 이벤트 발생 확인
   - 폴백 데이터 업데이트

2. **UI 섹션 추가 시**
   - 섹션 타입 정의
   - 컴포넌트 생성
   - 렌더러 업데이트

3. **API 변경 시**
   - 하위 호환성 유지
   - 버전 관리
   - 문서 업데이트

## 🆘 문제 해결

문제 발생 시 확인 순서:
1. 브라우저 콘솔 에러
2. Next.js 서버 로그
3. PostgreSQL 연결 상태
4. Redis 연결 상태
5. 네트워크 탭 확인

## 📞 연락처

프로젝트 관련 문의:
- GitHub Issues
- 프로젝트 위키
- 개발팀 Slack

---

*이 문서는 지속적으로 업데이트됩니다. 최신 버전은 항상 이 폴더를 확인하세요.*