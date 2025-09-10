# 🚀 배포 및 설정 문서
*E-Market Korea - 중고 상품 커머스 플랫폼*

## 📊 배포 시스템 개요
```yaml
배포 플랫폼: Vercel (Primary), Docker (Backup)
빌드 시스템: Next.js 15 with Turbopack
CI/CD: GitHub Actions + Vercel Integration
환경 구성: Development, Staging, Production
모니터링: Vercel Analytics + Custom Monitoring
```

## 🏗️ 프로젝트 구성

### Next.js 설정 (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 배포 설정
  output: 'standalone',
  
  // 빌드 최적화
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.commerce.com',
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'img.29cm.co.kr',
      },
      {
        protocol: 'https',
        hostname: 't1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 실험적 기능
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // 환경변수 노출
  env: {
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.TOSS_CLIENT_KEY,
    NEXT_PUBLIC_KAKAO_JS_KEY: process.env.KAKAO_CLIENT_ID,
    NEXT_PUBLIC_NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Origin', 
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,POST,PUT,DELETE,OPTIONS' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'Content-Type, Authorization' 
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  
  // URL 재작성
  async rewrites() {
    return [
      // Socket.io 프록시
      {
        source: '/socket.io/:path*',
        destination: '/api/socket/:path*',
      },
    ]
  },
}
```

### Tailwind CSS 설정 (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}
```

## 🔧 환경 설정

### 환경변수 구성 (`.env.example`)
```bash
# 기본 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="E-Market Korea"
NEXT_PUBLIC_APP_DESCRIPTION="중고 상품 커머스 플랫폼"

# 데이터베이스 설정
DATABASE_URL="postgresql://user:password@localhost:5432/emarket_korea"
DATABASE_DIRECT_URL="postgresql://user:password@localhost:5432/emarket_korea"
REDIS_URL="redis://localhost:6379"

# 인증 설정 (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# 소셜 로그인 설정
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"

KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# 결제 시스템 설정
TOSS_CLIENT_KEY="your-toss-client-key"
TOSS_SECRET_KEY="your-toss-secret-key"

# 이미지 업로드 설정
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# 이메일 설정
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 모니터링 및 분석
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"
GOOGLE_ANALYTICS_ID="your-google-analytics-id"

# 외부 API 설정
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_TRANSLATE_API_KEY="your-google-translate-api-key"

# 이카운트 연동
ECOUNT_API_URL="https://api.ecount.com"
ECOUNT_API_KEY="your-ecount-api-key"
ECOUNT_COMPANY_ID="your-company-id"

# 개발 환경 설정
NODE_ENV="development"
LOG_LEVEL="debug"
DEBUG_MODE="true"
```

### TypeScript 설정 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/styles/*": ["./styles/*"]
    },
    "target": "ES2017",
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## 🐳 Docker 설정

### Dockerfile
```dockerfile
# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose 설정 (`docker/podman-compose.yml`)
```yaml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - emarket-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: emarket_korea
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - emarket-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - emarket-network
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/nginx.conf
      - ../nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - emarket-network

volumes:
  postgres_data:
  redis_data:

networks:
  emarket-network:
    driver: bridge
```

## ⚙️ CI/CD 파이프라인

### GitHub Actions 워크플로우 (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

  deploy-preview:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run post-deployment tests
        run: |
          # 배포 후 헬스체크
          curl -f https://e-market-korea.vercel.app/api/health || exit 1
```

### 배포 스크립트 (`deploy.sh`)
```bash
#!/bin/bash

# E-Market Korea 배포 스크립트
set -e

echo "🚀 E-Market Korea 배포 시작"

# 환경 확인
if [ -z "$1" ]; then
    echo "사용법: ./deploy.sh [환경]"
    echo "환경: development, staging, production"
    exit 1
fi

ENVIRONMENT=$1

echo "📝 환경: $ENVIRONMENT"

# 환경별 설정
case $ENVIRONMENT in
    "development")
        VERCEL_ENV="development"
        ;;
    "staging")
        VERCEL_ENV="preview"
        ;;
    "production")
        VERCEL_ENV="production"
        ;;
    *)
        echo "❌ 잘못된 환경입니다."
        exit 1
        ;;
esac

# 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 타입 체크
echo "🔍 타입 체크 중..."
npm run type-check

# 린트 검사
echo "🧹 린트 검사 중..."
npm run lint

# 테스트 실행
echo "🧪 테스트 실행 중..."
npm run test:ci

# 빌드
echo "🏗️  애플리케이션 빌드 중..."
npm run build

# Vercel 배포
echo "🚀 Vercel에 배포 중..."
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod --confirm
else
    vercel --confirm
fi

# 배포 후 헬스체크
echo "🏥 헬스체크 중..."
sleep 10

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://e-market-korea.vercel.app/api/health"
else
    # 프리뷰 URL은 동적으로 생성되므로 별도 처리 필요
    echo "⏭️  프리뷰 환경 헬스체크 스킵"
    HEALTH_URL=""
fi

if [ ! -z "$HEALTH_URL" ]; then
    if curl -f $HEALTH_URL; then
        echo "✅ 배포 성공!"
    else
        echo "❌ 헬스체크 실패"
        exit 1
    fi
fi

echo "🎉 $ENVIRONMENT 환경 배포 완료!"
```

## 📊 모니터링 및 분석

### Vercel Analytics 설정
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function VercelProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}
```

### 커스텀 모니터링
```typescript
// lib/monitoring.ts
interface MonitoringConfig {
  performance: {
    webVitals: {
      enabled: boolean;
      reportToAnalytics: boolean;
    };
    customMetrics: {
      pageLoadTime: boolean;
      apiResponseTime: boolean;
      errorRate: boolean;
    };
  };
  
  errorTracking: {
    enabled: boolean;
    service: 'sentry' | 'bugsnag' | 'custom';
    reportingLevel: 'error' | 'warning' | 'info';
  };
  
  userAnalytics: {
    enabled: boolean;
    trackingEvents: string[];
    privacyCompliant: boolean;
  };
}

// 웹 바이탈 추적
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics로 전송
    console.log(metric);
    
    // 커스텀 분석 서비스로 전송
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    });
  }
}
```

## 🔒 보안 설정

### 보안 헤더 설정
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 보안 헤더 설정
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  )

  // HSTS (HTTPS 환경에서만)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 환경별 보안 설정
```typescript
interface SecurityConfig {
  development: {
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'];
      credentials: true;
    };
    https: false;
    rateLimit: false;
  };
  
  staging: {
    cors: {
      origin: ['https://staging-emarket.vercel.app'];
      credentials: true;
    };
    https: true;
    rateLimit: {
      windowMs: 15 * 60 * 1000; // 15분
      max: 100; // 요청 제한
    };
  };
  
  production: {
    cors: {
      origin: ['https://e-market-korea.com'];
      credentials: true;
    };
    https: true;
    rateLimit: {
      windowMs: 15 * 60 * 1000;
      max: 1000;
    };
    additionalSecurity: {
      helmet: true;
      csrf: true;
      sanitization: true;
    };
  };
}
```

## 🚀 성능 최적화

### 빌드 최적화
```typescript
// next.config.mjs 추가 설정
const nextConfig = {
  // 번들 분석
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
  
  // 압축
  compress: true,
  
  // 트레일링 슬래시
  trailingSlash: false,
  
  // 파워드 바이 헤더 제거
  poweredByHeader: false,
  
  // 프리페치 비활성화 (선택적)
  devIndicators: {
    buildActivity: false,
  },
  
  // 웹팩 최적화
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // 클라이언트 번들 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    return config
  },
}
```

### 캐싱 전략
```typescript
// lib/cache/config.ts
interface CacheConfig {
  redis: {
    ttl: {
      short: 5 * 60; // 5분
      medium: 30 * 60; // 30분
      long: 24 * 60 * 60; // 24시간
    };
    keyPatterns: {
      products: 'products:*';
      users: 'users:*';
      sessions: 'sessions:*';
      translations: 'translations:*';
    };
  };
  
  browser: {
    staticAssets: 'max-age=31536000, immutable';
    dynamicContent: 'max-age=0, must-revalidate';
    images: 'max-age=31536000, immutable';
  };
  
  cdn: {
    enabled: true;
    provider: 'vercel';
    regions: ['icn1', 'nrt1', 'sin1']; // 아시아 지역
  };
}
```

## 🔧 개발 환경 설정

### 로컬 개발 스크립트
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "analyze": "ANALYZE=true npm run build",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky install"
  }
}
```

### Git Hooks 설정
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint:fix
npm run format
npm run type-check
```

```json
// .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx commitlint --edit "$1"
```

## 📈 배포 후 체크리스트

### 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 타입 체크 통과
- [ ] 린트 검사 통과
- [ ] 빌드 성공
- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 보안 검사 완료

### 배포 후 체크리스트
- [ ] 애플리케이션 접근 가능
- [ ] API 엔드포인트 정상 작동
- [ ] 데이터베이스 연결 확인
- [ ] 인증 시스템 작동
- [ ] 이미지 업로드 기능 확인
- [ ] 결제 시스템 테스트
- [ ] 다국어 기능 확인
- [ ] 모니터링 대시보드 확인

### 장애 대응 절차
```typescript
interface DisasterRecovery {
  rollback: {
    vercel: 'Vercel 대시보드에서 이전 배포로 롤백';
    database: 'Database 백업에서 복구';
    process: '5분 이내 대응 목표';
  };
  
  monitoring: {
    alerts: 'Slack, Email 알림';
    healthChecks: '1분 간격 모니터링';
    escalation: '5분 내 미해결 시 에스컬레이션';
  };
  
  communication: {
    statusPage: '상태 페이지 업데이트';
    users: '사용자 공지';
    team: '팀 내부 커뮤니케이션';
  };
}
```

---

*이 문서는 E-Market Korea 프로젝트의 완전한 배포 및 설정 매뉴얼입니다.*