# Next.js Commerce Project Structure

## 🎯 프로젝트 개요
Next.js 14 기반 현대적인 이커머스 플랫폼 (OAuth, 결제, 알림톡 통합)

## 📂 디렉토리 구조
```
commerce-nextjs/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js 인증
│   │   ├── cart/          # 장바구니 API
│   │   ├── payments/      # 토스페이먼츠 결제
│   │   ├── products/      # 상품 API
│   │   └── socket/        # Socket.io 연결
│   ├── auth/              # 인증 페이지
│   ├── checkout/          # 결제 페이지
│   ├── products/          # 상품 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── products/          # 상품 컴포넌트
│   └── ui/                # UI 컴포넌트
├── lib/                   # 유틸리티 및 서비스
│   ├── auth.ts            # NextAuth 설정
│   ├── prisma.ts          # Prisma 클라이언트
│   ├── toss-payment.ts    # 토스페이먼츠 서비스
│   └── kakao-alimtalk.ts  # 카카오 알림톡
├── prisma/                # 데이터베이스 스키마
│   └── schema.prisma      # Prisma 스키마
├── public/                # 정적 파일
├── stores/                # Zustand 상태 관리
│   ├── cart-store.ts      # 장바구니 상태
│   └── wishlist-store.ts  # 위시리스트 상태
├── hooks/                 # Custom React Hooks
│   └── useSocket.ts       # Socket.io 훅
└── backup/                # 백업 파일들
    ├── react-nodejs-version/  # React + Node.js 버전
    ├── nextjs-commerce/       # 이전 Next.js 프로젝트
    └── cms-template/          # CMS 템플릿
```

## 🚀 핵심 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **UI Components**: Custom + Radix UI

### Backend & Services
- **Auth**: NextAuth.js (OAuth 로그인)
  - 네이버 OAuth
  - 구글 OAuth
  - 카카오 OAuth
- **Database**: PostgreSQL + Prisma ORM
- **Payment**: 토스페이먼츠 SDK
- **Notification**: 카카오 알림톡
- **Real-time**: Socket.io
- **Deployment**: Docker

## 🛠 개발 명령어

### 의존성 설치
```bash
npm install
```

### 환경 변수 설정
`.env.local` 파일 생성:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."

# Toss Payments
TOSS_CLIENT_KEY="..."
TOSS_SECRET_KEY="..."

# Kakao Alimtalk
KAKAO_ALIMTALK_SENDER_KEY="..."
KAKAO_ALIMTALK_TEMPLATE_CODE="..."
```

### 데이터베이스 설정
```bash
# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 (선택사항)
npx prisma db seed
```

### 개발 서버 실행
```bash
npm run dev
# http://localhost:3000
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Docker 실행
```bash
# 이미지 빌드
docker build -t commerce-nextjs .

# 컨테이너 실행
docker-compose up -d
```

## 📍 주요 페이지 경로
- **홈**: `/`
- **상품 목록**: `/products`
- **상품 상세**: `/products/[slug]`
- **장바구니**: `/cart` (클라이언트 상태)
- **결제**: `/checkout`
- **로그인**: `/auth/signin`
- **회원가입**: `/auth/signup`

## 🔑 주요 API 엔드포인트
- `POST /api/auth/[...nextauth]` - NextAuth 인증
- `GET /api/products` - 상품 목록
- `GET/POST/DELETE /api/cart` - 장바구니 관리
- `POST /api/payments/toss/confirm` - 토스페이먼츠 결제 확인
- `POST /api/payments/toss/cancel` - 결제 취소
- `POST /api/socket` - Socket.io 연결

## ✅ 프로젝트 상태
- Next.js 14 메인 프로젝트 구성 완료
- OAuth 로그인 시스템 통합
- 토스페이먼츠 결제 시스템 통합
- 카카오 알림톡 연동
- Socket.io 실시간 기능
- Docker 배포 준비 완료

## 📝 백업 구조
```
backup/
├── react-nodejs-version/   # React + Node.js 이전 버전
│   ├── client/            # React/Vite 프론트엔드
│   └── src/               # Express 백엔드
├── nextjs-commerce/       # Next.js 15 버전
└── cms-template/          # CMS 템플릿 원본
```

## 🚦 다음 단계
1. 환경 변수 설정 완료
2. 데이터베이스 연결 및 마이그레이션
3. OAuth 제공자 설정
4. 토스페이먼츠 API 키 설정
5. 카카오 알림톡 템플릿 등록
6. 개발 서버 실행 및 테스트