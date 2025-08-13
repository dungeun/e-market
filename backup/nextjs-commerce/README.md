# Next.js Commerce Platform

Next.js 15로 구축된 현대적인 전자상거래 플랫폼입니다.

## 주요 기능

- ✅ **최신 기술**: Next.js 15, React 19, TypeScript
- ✅ **풀스택**: API Routes, Server Components, Client Components
- ✅ **데이터베이스**: Prisma ORM + PostgreSQL
- ✅ **인증**: JWT 기반 인증 시스템
- ✅ **상태 관리**: Zustand (클라이언트), React Query (서버)
- ✅ **UI/UX**: Tailwind CSS, Radix UI, 반응형 디자인
- ✅ **관리자 대시보드**: 상품, 주문, 고객 관리
- ✅ **장바구니**: 실시간 동기화, 게스트 지원
- ✅ **결제**: 다중 결제 방식 지원
- ✅ **보안**: 미들웨어 기반 보안, 입력 검증

## 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod
- **File Upload**: (설정 가능)

## 프로젝트 구조

```
nextjs-commerce/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # 관리자 페이지
│   ├── products/          # 상품 페이지
│   ├── cart/              # 장바구니
│   ├── checkout/          # 결제
│   └── login/             # 인증
├── components/            # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── products/         # 상품 관련 컴포넌트
│   ├── cart/             # 장바구니 컴포넌트
│   ├── checkout/         # 결제 컴포넌트
│   └── admin/            # 관리자 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── stores/           # Zustand 스토어
│   ├── utils.ts          # 유틸리티 함수
│   └── prisma.ts         # Prisma 클라이언트
├── prisma/               # 데이터베이스 스키마
└── middleware.ts         # Next.js 미들웨어
```

## 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

### 2. 환경 변수 설정

`.env` 파일에 다음 값들을 설정하세요:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/commerce_nextjs?schema=public"

# JWT
JWT_SECRET="your-jwt-secret-here"

# NextAuth (선택사항)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션
npm run prisma:migrate

# Prisma 클라이언트 생성
npm run prisma:generate

# 시드 데이터 (선택사항)
npm run prisma:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 주요 페이지

- **홈페이지**: `/`
- **상품 목록**: `/products`
- **상품 상세**: `/products/[slug]`
- **장바구니**: `/cart`
- **결제**: `/checkout`
- **로그인**: `/login`
- **회원가입**: `/signup`
- **관리자**: `/admin`

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 상품
- `GET /api/products` - 상품 목록
- `GET /api/products/[id]` - 상품 상세
- `POST /api/products` - 상품 생성 (관리자)

### 장바구니
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart` - 장바구니 추가

### 주문
- `GET /api/orders` - 주문 목록
- `POST /api/orders` - 주문 생성

## 컴포넌트 구조

### UI 컴포넌트
- `Button` - 다양한 스타일의 버튼
- `Card` - 카드 레이아웃
- `Input` - 입력 필드
- `Badge` - 상태 표시
- `Label` - 라벨

### 비즈니스 컴포넌트
- `ProductCard` - 상품 카드
- `ProductDetail` - 상품 상세 정보
- `CartItem` - 장바구니 아이템
- `CheckoutForm` - 결제 폼

## 상태 관리

### Zustand 스토어
- `useCartStore` - 장바구니 상태
- `useAuthStore` - 인증 상태

### React Query
- 서버 상태 관리
- 캐싱 및 동기화
- 백그라운드 업데이트

## 보안

- JWT 기반 인증
- 미들웨어 기반 라우트 보호
- Zod를 사용한 입력 검증
- XSS, CSRF 보호 헤더

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t nextjs-commerce .

# 컨테이너 실행
docker run -p 3000:3000 nextjs-commerce
```

## 개발 가이드

### 새 컴포넌트 추가
1. `components/` 디렉토리에 컴포넌트 생성
2. TypeScript 인터페이스 정의
3. Tailwind CSS로 스타일링
4. 필요시 스토리북 스토리 추가

### 새 API 라우트 추가
1. `app/api/` 디렉토리에 라우트 생성
2. Zod 스키마로 입력 검증
3. Prisma로 데이터베이스 조작
4. 적절한 HTTP 상태 코드 반환

### 데이터베이스 스키마 변경
1. `prisma/schema.prisma` 수정
2. 마이그레이션 생성: `npx prisma migrate dev`
3. 클라이언트 재생성: `npx prisma generate`

## 라이센스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request