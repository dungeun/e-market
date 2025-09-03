# Next.js E-Commerce Migration

Node.js/Express + React/Vite 기반 이커머스 프로젝트를 Next.js 14로 마이그레이션한 프로젝트입니다.

## 주요 기능

### 인증
- ✅ 네이버 OAuth 로그인
- ✅ 구글 OAuth 로그인  
- ✅ 카카오 OAuth 로그인
- NextAuth.js 기반 세션 관리

### 결제
- ✅ 토스페이먼츠 통합
- 신용카드, 계좌이체, 가상계좌 지원
- 정기결제(빌링키) 지원

### 알림
- ✅ 카카오 알림톡 연동
- 주문 확인, 배송 알림 등 템플릿 지원

### 실시간 기능
- ✅ Socket.io 통합
- 실시간 재고 업데이트
- 실시간 주문 상태 알림

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Payment**: Toss Payments SDK
- **Real-time**: Socket.io
- **Deployment**: Docker

## 시작하기

### 1. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 생성하고 필요한 값을 입력하세요:

```bash
cp .env.example .env.local
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 실행 (Docker)
docker-compose up -d postgres

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 초기 데이터 시딩 (선택사항)
npx prisma db seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 배포

### Docker를 사용한 배포

```bash
# 이미지 빌드
docker build -t commerce-nextjs .

# 컨테이너 실행
docker-compose up -d
```

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 프로젝트 구조

```
nextjs-migration/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── products/          # 상품 페이지
│   └── checkout/          # 결제 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 서비스
│   ├── auth.ts           # NextAuth 설정
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── toss-payment.ts   # 토스페이먼츠 서비스
│   └── kakao-alimtalk.ts # 카카오 알림톡 서비스
├── prisma/               # Prisma 스키마 및 마이그레이션
├── public/               # 정적 파일
└── stores/               # Zustand 상태 관리
```

## API 엔드포인트

- `POST /api/auth/[...nextauth]` - NextAuth 인증
- `GET /api/products` - 상품 목록
- `GET /api/products/[id]` - 상품 상세
- `GET/POST/DELETE /api/cart` - 장바구니 관리
- `POST /api/orders` - 주문 생성
- `POST /api/payments/confirm` - 결제 확인
- `POST /api/socket` - Socket.io 연결

## 환경 변수

### 필수 환경 변수

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NEXTAUTH_URL`: NextAuth URL
- `NEXTAUTH_SECRET`: NextAuth 비밀키
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth 
- `NAVER_CLIENT_ID/SECRET`: 네이버 OAuth
- `KAKAO_CLIENT_ID/SECRET`: 카카오 OAuth
- `TOSS_CLIENT_KEY/SECRET_KEY`: 토스페이먼츠
- `KAKAO_ALIMTALK_*`: 카카오 알림톡

## 라이선스

MIT