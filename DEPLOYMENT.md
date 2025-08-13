# 🚀 Deployment Guide - E-Market Commerce Platform

## 📋 배포 개요

본 가이드는 E-Market Commerce Platform을 Vercel에 배포하고 Supabase 데이터베이스와 연동하는 방법을 설명합니다.

## 🔧 사전 준비사항

### 1. 계정 준비
- [Vercel](https://vercel.com) 계정
- [Supabase](https://supabase.com) 계정
- [GitHub](https://github.com) 계정

### 2. 로컬 환경 설정 확인
```bash
# Node.js 버전 확인 (18+ 필요)
node --version

# 의존성 설치 확인
npm install

# 로컬 빌드 테스트
npm run build
```

## 🗄️ Supabase 데이터베이스 설정

### 1. Supabase 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. "New project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `e-market-commerce`
   - **Database Password**: 강력한 패스워드 설정
   - **Region**: `Northeast Asia (Seoul)` 권장

### 2. 데이터베이스 연결 정보 확인
1. Supabase 프로젝트 → Settings → Database
2. **Connection string** 복사 (Direct connection 사용)
3. 형식: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`

### 3. Prisma 스키마 배포
```bash
# 환경변수에 Supabase URL 설정
export DATABASE_URL="your_supabase_connection_string"

# 스키마 배포
npx prisma db push

# 초기 데이터 시딩
npx ts-node prisma/seed-ui-sections.ts
```

## 🚀 Vercel 배포

### 1. GitHub 리포지토리 준비
```bash
# 모든 변경사항 커밋
git add .
git commit -m "🚀 준비: Vercel 배포를 위한 설정 완료

- Supabase 데이터베이스 연동 준비
- 환경변수 예제 파일 추가 (.env.example)
- main_page UI 완전 통합
- 마이페이지/비즈니스 대시보드 추가
- 헤더 로그인 링크 수정
- 모든 API 엔드포인트 정상 작동 확인

🎯 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHub에 푸시
git push origin main
```

### 2. Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 리포지토리 `dungeun/e-market` 선택
4. 프로젝트 설정:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. 환경변수 설정
Vercel 프로젝트 → Settings → Environment Variables에서 다음 변수들을 추가:

```bash
# 필수 환경변수
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your-super-secret-jwt-key-for-production
NODE_ENV=production
PLUGIN_ENABLED=true
CORE_INTEGRATION=true

# CORS 설정 (Vercel 도메인으로 업데이트)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# NextAuth 설정
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# 이메일 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### 4. 배포 실행
1. "Deploy" 버튼 클릭
2. 빌드 프로세스 완료 대기 (약 2-3분)
3. 배포 완료 후 생성된 URL 확인

## 🔄 배포 후 확인사항

### 1. 기능 테스트
- ✅ 메인 페이지 로딩 (히어로 배너, 카테고리, 캠페인)
- ✅ 로그인/회원가입 페이지 접근
- ✅ 다국어 지원 (한국어, 영어, 일본어)
- ✅ 마이페이지/비즈니스 대시보드 접근
- ✅ 관리자 페이지 기능

### 2. 데이터베이스 연결 확인
```bash
# Vercel Function 로그 확인
vercel logs

# API 엔드포인트 테스트
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/home/sections
```

### 3. 성능 최적화
1. Vercel Analytics 활성화
2. Lighthouse 점수 확인
3. Core Web Vitals 모니터링

## 🐛 트러블슈팅

### 데이터베이스 연결 오류
```bash
# Supabase 연결 테스트
npx prisma studio

# 연결 문자열 형식 확인
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
```

### 빌드 오류
```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 오류 확인
npm run type-check

# Lint 오류 확인
npm run lint
```

### 환경변수 문제
1. Vercel Dashboard → Settings → Environment Variables 확인
2. 모든 필수 변수가 설정되어 있는지 확인
3. 변수 값에 특수문자가 포함된 경우 따옴표로 감싸기

## 📊 모니터링 및 유지보수

### 1. Vercel Analytics
- 실시간 사용자 모니터링
- 성능 메트릭 추적
- 오류 로그 분석

### 2. Supabase Dashboard
- 데이터베이스 성능 모니터링
- 쿼리 최적화
- 백업 및 복원

### 3. 정기 업데이트
```bash
# 의존성 업데이트
npm update

# 보안 취약점 점검
npm audit

# Prisma 마이그레이션
npx prisma migrate deploy
```

## 🎯 성공적인 배포 완료!

✅ **배포 완료 체크리스트**
- [ ] Supabase 데이터베이스 설정 완료
- [ ] GitHub 리포지토리 업데이트
- [ ] Vercel 프로젝트 생성 및 환경변수 설정
- [ ] 배포 성공 및 URL 접근 확인
- [ ] 모든 주요 기능 정상 작동 확인
- [ ] 성능 및 모니터링 설정 완료

🚀 **배포된 서비스**: https://your-vercel-app.vercel.app

---

💡 **추가 지원이 필요한 경우**: 
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)