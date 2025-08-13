# 🚀 Next.js 마이그레이션 가이드

## 📋 마이그레이션 진행 상황

### ✅ 완료된 작업
- [x] Next.js 14 프로젝트 초기 설정 (App Router)
- [x] 필수 패키지 설치 및 설정
- [x] 인증 시스템 구현 (NextAuth)
  - Google OAuth
  - 네이버 OAuth (커스텀)
  - 카카오 OAuth (커스텀)
  - 이메일/비밀번호 로그인
- [x] 토스페이먼츠 결제 시스템 통합
- [x] 카카오 알림톡 서비스 구현
- [x] Prisma 스키마 최적화

### 🔄 진행 중
- [ ] 기존 React 컴포넌트 마이그레이션
- [ ] API Routes 전환
- [ ] Socket.io 실시간 기능

### 📝 예정 작업
- [ ] 관리자 대시보드
- [ ] 성능 최적화
- [ ] 배포 설정

## 🛠️ 설치 및 실행

### 1. 환경 변수 설정
```bash
cp nextjs-migration/.env.example nextjs-migration/.env.local
```

`.env.local` 파일을 열어 필요한 값들을 설정:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/commerce"

# NextAuth
NEXTAUTH_SECRET="openssl rand -base64 32 명령으로 생성"

# OAuth - Google
GOOGLE_CLIENT_ID="Google Cloud Console에서 발급"
GOOGLE_CLIENT_SECRET="Google Cloud Console에서 발급"

# OAuth - Naver
NAVER_CLIENT_ID="네이버 개발자센터에서 발급"
NAVER_CLIENT_SECRET="네이버 개발자센터에서 발급"

# OAuth - Kakao
KAKAO_CLIENT_ID="카카오 개발자센터에서 발급"
KAKAO_CLIENT_SECRET="카카오 개발자센터에서 발급"

# Toss Payments
TOSS_CLIENT_KEY="토스페이먼츠 대시보드에서 발급"
TOSS_SECRET_KEY="토스페이먼츠 대시보드에서 발급"

# Kakao Alimtalk
KAKAO_ALIMTALK_API_KEY="알림톡 서비스 제공업체에서 발급"
KAKAO_ALIMTALK_SENDER_KEY="발신프로필 키"
KAKAO_ALIMTALK_PLUS_FRIEND_ID="카카오톡 채널 ID"
```

### 2. 데이터베이스 설정
```bash
cd nextjs-migration

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# 시드 데이터 (선택사항)
npx prisma db seed
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🔑 OAuth 설정 가이드

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "사용자 인증 정보"
4. OAuth 2.0 클라이언트 ID 생성
5. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

### 네이버 OAuth
1. [네이버 개발자센터](https://developers.naver.com) 접속
2. 애플리케이션 등록
3. 사용 API: "네이버 로그인"
4. 서비스 URL: `http://localhost:3000`
5. Callback URL: `http://localhost:3000/api/auth/callback/naver`

### 카카오 OAuth
1. [카카오 개발자센터](https://developers.kakao.com) 접속
2. 애플리케이션 추가
3. 카카오 로그인 활성화
4. Redirect URI 등록:
   - `http://localhost:3000/api/auth/callback/kakao`
5. 동의항목 설정 (이메일, 프로필 정보)

## 💳 토스페이먼츠 설정

### 1. 토스페이먼츠 가입 및 설정
1. [토스페이먼츠](https://www.tosspayments.com) 가입
2. 대시보드에서 API 키 발급
3. 테스트/운영 키 구분하여 사용

### 2. 결제 플로우
```typescript
// 1. 클라이언트: 결제 요청
const response = await fetch('/api/payments/toss/request', {
  method: 'POST',
  body: JSON.stringify({
    amount: 10000,
    orderName: '상품명',
    // ...
  })
})

// 2. 토스 결제창 호출
const tossPayments = await loadTossPayments(clientKey)
await tossPayments.requestPayment('카드', paymentData)

// 3. 서버: 결제 승인
// /api/payments/toss/confirm 에서 자동 처리
```

## 📱 카카오 알림톡 설정

### 1. 카카오톡 채널 생성
1. [카카오톡 채널 관리자센터](https://center-pf.kakao.com) 접속
2. 채널 생성 및 검수 신청
3. 비즈니스 인증

### 2. 알림톡 템플릿 등록
알림톡 서비스 제공업체를 통해 템플릿 등록:
- 주문 확인 (ORDER_CONFIRM_001)
- 배송 시작 (SHIPPING_START_001)
- 결제 완료 (PAYMENT_COMPLETE_001)
- 회원가입 환영 (WELCOME_001)

### 3. 사용 예시
```typescript
import { kakaoAlimtalk } from '@/lib/kakao-alimtalk'

// 주문 확인 알림 발송
await kakaoAlimtalk.sendOrderConfirmation(
  '010-1234-5678',
  'ORD-20240101-0001',
  '상품명',
  50000
)
```

## 📁 프로젝트 구조

```
nextjs-migration/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # 인증 관련
│   │   ├── payments/     # 결제 관련
│   │   └── ...
│   ├── (shop)/           # 쇼핑몰 페이지
│   ├── admin/            # 관리자 페이지
│   └── auth/             # 인증 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts           # NextAuth 설정
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── toss-payment.ts   # 토스페이먼츠
│   └── kakao-alimtalk.ts # 카카오 알림톡
├── prisma/               # 데이터베이스
│   └── schema.prisma    # 스키마 정의
└── public/              # 정적 파일
```

## 🔄 마이그레이션 체크리스트

### Phase 1: 기본 설정 ✅
- [x] Next.js 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] Prisma 설정
- [x] NextAuth 설정

### Phase 2: 인증 시스템 ✅
- [x] Google OAuth
- [x] 네이버 OAuth
- [x] 카카오 OAuth
- [x] 세션 관리

### Phase 3: 결제 시스템 ✅
- [x] 토스페이먼츠 통합
- [x] 결제 승인 API
- [x] 결제 취소 API
- [x] 웹훅 처리

### Phase 4: 알림 시스템 ✅
- [x] 카카오 알림톡 설정
- [x] 템플릿 관리
- [x] 발송 API

### Phase 5: 컴포넌트 마이그레이션 🔄
- [ ] 상품 목록/상세
- [ ] 장바구니
- [ ] 결제 페이지
- [ ] 마이페이지
- [ ] 관리자 대시보드

### Phase 6: API 마이그레이션 🔄
- [ ] 상품 API
- [ ] 주문 API
- [ ] 사용자 API
- [ ] 관리자 API

### Phase 7: 최적화 📝
- [ ] ISR 설정
- [ ] 이미지 최적화
- [ ] 캐싱 전략
- [ ] SEO 최적화

### Phase 8: 배포 📝
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] 모니터링 설정

## 🚀 배포 가이드

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... 기타 환경 변수
```

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Prisma 문서](https://www.prisma.io/docs)
- [토스페이먼츠 개발자 문서](https://docs.tosspayments.com)
- [카카오 개발자 문서](https://developers.kakao.com)
- [네이버 개발자 문서](https://developers.naver.com)

## 🆘 문제 해결

### 데이터베이스 연결 오류
```bash
# PostgreSQL 서비스 확인
brew services list | grep postgresql

# 서비스 시작
brew services start postgresql
```

### Prisma 마이그레이션 오류
```bash
# 데이터베이스 초기화
npx prisma migrate reset

# 다시 마이그레이션
npx prisma migrate dev
```

### OAuth 리다이렉트 오류
- Callback URL이 정확히 등록되어 있는지 확인
- NEXTAUTH_URL 환경 변수 확인
- 개발/운영 환경 구분

## 📞 지원

문제가 발생하면 다음 채널로 문의:
- GitHub Issues
- 개발팀 Slack
- 기술 지원 이메일