# Vercel 배포 가이드

## 배포 준비 완료 ✅

프로젝트가 Vercel 배포를 위해 준비되었습니다.

## Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 추가해주세요:

### 필수 데이터베이스 설정
```
DATABASE_URL=postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_POOLER_URL=postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
POSTGRES_URL_NON_POOLING=postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### Supabase 스토리지 설정
```
NEXT_PUBLIC_SUPABASE_URL=https://qfcrfhvszddvdznmdqxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmY3JmaHZzemRkdmR6bm1kcXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0ODg5MjIsImV4cCI6MjA1MDA2NDkyMn0.ZLk-bPnJN8Wr7Rx9rXbozJWVPIA_Y4R7qKhI_VFpDxs
```

### JWT 및 보안 설정
```
JWT_SECRET=LinkPickPlatform2024!SuperSecretJWTKey#RevuPlatformProduction$
JWT_REFRESH_SECRET=LinkPickPlatform2024RefreshToken!SuperSecret#Production$
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### Redis 설정 (선택사항)
```
REDIS_URL=redis://default:mYOnQFZCyXRh2xYS8Y5JLZN1WcSjIdRy@redis-15395.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15395
```

### 애플리케이션 설정
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=[your-vercel-domain]
CORS_ORIGIN=[your-vercel-domain],https://*.vercel.app
```

## 배포 단계

1. **Vercel에 로그인**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "New Project" 클릭
   - GitHub 저장소 선택: `dungeun/e-market`
   - Import 클릭

3. **환경 변수 설정**
   - Settings → Environment Variables
   - 위의 모든 환경 변수 추가
   - Production, Preview, Development 모두 체크

4. **배포**
   - Deploy 버튼 클릭
   - 빌드 진행 상황 모니터링

## 빌드 상태

✅ 빌드 성공 확인됨
- 모든 페이지 정상 생성
- TypeScript 타입 체크 통과
- 린트 검사 통과

## 배포 후 확인사항

1. 데이터베이스 연결 확인
2. 이미지 업로드/표시 확인
3. 인증 기능 확인
4. API 엔드포인트 동작 확인

## 문제 해결

### 데이터베이스 연결 오류
- Supabase 대시보드에서 Connection Pooling 활성화 확인
- 환경 변수가 올바르게 설정되었는지 확인

### 빌드 오류
- Node.js 버전 확인 (18.x 이상)
- 모든 의존성이 설치되었는지 확인

## GitHub Repository
https://github.com/dungeun/e-market

최신 변경사항이 main 브랜치에 푸시되었습니다.