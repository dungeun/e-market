# 📚 E-Market Korea 프로젝트 문서
*중고 상품 커머스 플랫폼 - 완전한 시스템 문서*

## 🌟 프로젝트 개요

**E-Market Korea**는 해외 노동자를 위한 특화된 중고 상품 거래 플랫폼입니다. 한국어, 영어, 일본어를 지원하는 다국어 커머스 시스템으로, 안전한 중고 거래와 사용자 친화적인 인터페이스를 제공합니다.

### 🎯 핵심 특징
- **중고 거래 특화**: S/A/B/C 등급 시스템, 직거래 중심
- **다국어 지원**: 한국어/영어/일본어 (3-tier 캐싱 시스템)
- **관리자 시스템**: 포괄적인 백오피스 관리 기능
- **반응형 디자인**: 모바일 우선 설계
- **성능 최적화**: Redis 캐싱, ISR, CDN 활용

### 🛠️ 기술 스택
```yaml
Frontend: Next.js 15, React 18, TypeScript
UI Library: shadcn/ui, Tailwind CSS
Backend: Next.js API Routes, Prisma ORM
Database: PostgreSQL, Redis
Authentication: NextAuth.js
Deployment: Vercel, Docker
Monitoring: Vercel Analytics, Custom Monitoring
```

## 📖 문서 구조

이 문서는 프로젝트의 모든 측면을 다루는 포괄적인 가이드입니다.

### 🏗️ 시스템 아키텍처 (`/docs/system/`)

#### 1. [📊 데이터베이스 스키마](./system/DATABASE_SCHEMA.md)
- 완전한 PostgreSQL 스키마 (17개 테이블)
- 인덱스 전략 및 성능 최적화
- 마이그레이션 히스토리
- 관계 매핑 및 제약 조건

#### 2. [🏛️ 프로젝트 아키텍처](./system/PROJECT_ARCHITECTURE.md)
- Next.js 15 App Router 아키텍처
- 3-layer 캐싱 전략 (Memory → Redis → Database)
- 마이크로서비스 준비 구조
- 스케일링 전략 및 성능 최적화

#### 3. [🔌 API 구조](./system/API_STRUCTURE.md)
- RESTful API + GraphQL 하이브리드
- 80+ API 엔드포인트 완전 문서화
- 인증/인가 시스템
- 에러 처리 및 응답 형식

#### 4. [🚀 배포 및 설정](./system/DEPLOYMENT_CONFIGURATION.md)
- Vercel 배포 설정
- Docker 컨테이너 구성
- CI/CD 파이프라인
- 환경별 설정 관리

### 🧩 구조 문서 (`/docs/structure/`)

#### 1. [🌐 언어팩 구조](./structure/LANGUAGE_PACK_STRUCTURE.md)
- 3-tier 언어 캐싱 시스템
- 자동 번역 워크플로우
- 문화적 현지화 전략
- 성능 최적화 (5분 메모리 캐시)

#### 2. [👑 관리자 구조](./structure/ADMIN_STRUCTURE.md)
- 역할 기반 접근 제어 (RBAC)
- 동적 사이드바 네비게이션
- 17개 관리 페이지 완전 문서화
- 실시간 데이터 동기화

#### 3. [🎨 UI 섹션 구조](./structure/UI_SECTIONS_STRUCTURE.md)
- 데이터베이스 기반 동적 UI 관리
- 드래그앤드롭 섹션 순서 변경
- 다국어 UI 섹션 지원
- 실시간 미리보기 시스템

#### 4. [🧩 컴포넌트 구조](./structure/COMPONENT_STRUCTURE.md)
- 100+ 컴포넌트 완전 분류
- shadcn/ui 기반 디자인 시스템
- Compound Component Pattern
- 성능 최적화 전략

### 📱 사용자 경험 (`/docs/flows/`)

#### 1. [👤 사용자 플로우](./flows/USER_FLOW_STRUCTURE.md)
- 해외 노동자 타겟 사용자 여정
- 온보딩부터 구매까지 완전한 플로우
- 중고 거래 특화 기능
- 다국어 사용자 경험

### 📄 페이지 문서 (`/docs/pages/`)

#### 1. [📄 페이지 구조](./pages/PAGE_DOCUMENTATION.md)
- 46개 페이지 완전 문서화
- 사용자 페이지 + 관리자 페이지
- SEO 최적화 전략
- 성능 메트릭스

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd commerce-nextjs

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집 필요
```

### 2. 데이터베이스 설정
```bash
# Prisma 설정
npx prisma generate
npx prisma db push

# 시드 데이터 삽입
npm run db:seed
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# Vercel 배포
npm run deploy
```

## 📊 주요 메트릭스

### 성능 목표
- **홈페이지**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **상품 목록**: 초기 로딩 < 3s, 무한스크롤 < 500ms
- **관리자 페이지**: 초기 로딩 < 5s, 데이터 조작 < 1s

### 기술 지표
- **데이터베이스**: 17개 테이블, 50+ 인덱스
- **API**: 80+ 엔드포인트
- **컴포넌트**: 100+ 재사용 가능 컴포넌트
- **언어 지원**: 3개 언어 (KO/EN/JP)

### 비즈니스 메트릭스
- **사용자 타겟**: 해외 노동자 커뮤니티
- **거래 방식**: 직거래 중심 중고 상품
- **특화 기능**: 상품 상태 등급제 (S/A/B/C)

## 🛡️ 보안 및 규정 준수

### 보안 기능
- NextAuth.js 기반 인증
- RBAC (역할 기반 접근 제어)
- HTTPS 강제 적용
- 보안 헤더 설정
- 입력 검증 및 새니테이션

### 규정 준수
- GDPR 개인정보보호
- 전자상거래법 준수
- 웹 접근성 (WCAG 2.1 AA)

## 🔧 개발 가이드라인

### 코드 스타일
- TypeScript 엄격 모드
- ESLint + Prettier 설정
- Husky Git hooks
- 컨벤셔널 커밋 메시지

### 테스트 전략
- Jest + React Testing Library (단위 테스트)
- Playwright (E2E 테스트)
- Storybook (컴포넌트 문서화)
- 80%+ 테스트 커버리지 목표

### CI/CD 파이프라인
- GitHub Actions 자동화
- Vercel 배포 연동
- 자동 테스트 실행
- 배포 후 헬스체크

## 🤝 기여 가이드

### 개발 프로세스
1. Feature 브랜치 생성
2. 코드 작성 및 테스트
3. Pull Request 생성
4. 코드 리뷰
5. 메인 브랜치 병합

### 코드 리뷰 체크리스트
- [ ] 타입 안정성 확인
- [ ] 테스트 케이스 작성
- [ ] 성능 영향 평가
- [ ] 접근성 고려사항
- [ ] 보안 취약점 검토

## 📞 지원 및 연락처

### 기술 지원
- **문서 이슈**: GitHub Issues 활용
- **개발 문의**: 개발팀 Slack 채널
- **배포 이슈**: DevOps 팀 연락

### 리소스 링크
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔄 업데이트 히스토리

### 최근 업데이트
- **v1.0.0**: 초기 릴리즈 (기본 커머스 기능)
- **v1.1.0**: 다국어 지원 추가
- **v1.2.0**: 관리자 시스템 개선
- **v1.3.0**: UI 섹션 관리 시스템

### 향후 로드맵
- **v2.0.0**: 모바일 앱 개발
- **v2.1.0**: AI 추천 시스템
- **v2.2.0**: 실시간 채팅 시스템

---

## 📚 문서 네비게이션

### 빠른 접근
- 🏗️ **시스템**: [아키텍처](./system/PROJECT_ARCHITECTURE.md) | [데이터베이스](./system/DATABASE_SCHEMA.md) | [API](./system/API_STRUCTURE.md) | [배포](./system/DEPLOYMENT_CONFIGURATION.md)
- 🧩 **구조**: [언어팩](./structure/LANGUAGE_PACK_STRUCTURE.md) | [관리자](./structure/ADMIN_STRUCTURE.md) | [UI 섹션](./structure/UI_SECTIONS_STRUCTURE.md) | [컴포넌트](./structure/COMPONENT_STRUCTURE.md)
- 📱 **플로우**: [사용자 여정](./flows/USER_FLOW_STRUCTURE.md)
- 📄 **페이지**: [페이지 구조](./pages/PAGE_DOCUMENTATION.md)

### 역할별 추천 문서
- **개발자**: [프로젝트 아키텍처](./system/PROJECT_ARCHITECTURE.md) → [컴포넌트 구조](./structure/COMPONENT_STRUCTURE.md) → [API 구조](./system/API_STRUCTURE.md)
- **기획자**: [사용자 플로우](./flows/USER_FLOW_STRUCTURE.md) → [페이지 구조](./pages/PAGE_DOCUMENTATION.md) → [UI 섹션](./structure/UI_SECTIONS_STRUCTURE.md)
- **운영진**: [관리자 구조](./structure/ADMIN_STRUCTURE.md) → [언어팩 구조](./structure/LANGUAGE_PACK_STRUCTURE.md)
- **DevOps**: [배포 설정](./system/DEPLOYMENT_CONFIGURATION.md) → [데이터베이스 스키마](./system/DATABASE_SCHEMA.md)

---

*이 문서는 E-Market Korea 프로젝트의 완전한 시스템 가이드입니다. 지속적으로 업데이트되며, 프로젝트의 모든 측면을 다룹니다.*

**📧 문의사항이나 개선 제안은 언제든 환영합니다.**