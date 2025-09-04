#!/bin/bash

echo "🔧 Vercel 환경 변수 설정 시작..."

# 모든 환경에 환경 변수 추가
echo "postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" | vercel env add DATABASE_POOLER_URL production preview development --force 2>/dev/null || echo "DATABASE_POOLER_URL exists"

echo "postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1" | vercel env add POSTGRES_URL production preview development --force 2>/dev/null || echo "POSTGRES_URL exists"

echo "postgresql://postgres.qfcrfhvszddvdznmdqxn:Commerce2024!@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" | vercel env add POSTGRES_URL_NON_POOLING production preview development --force 2>/dev/null || echo "POSTGRES_URL_NON_POOLING exists"

echo "https://qfcrfhvszddvdznmdqxn.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --force 2>/dev/null || echo "NEXT_PUBLIC_SUPABASE_URL exists"

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmY3JmaHZzemRkdmR6bm1kcXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0ODg5MjIsImV4cCI6MjA1MDA2NDkyMn0.ZLk-bPnJN8Wr7Rx9rXbozJWVPIA_Y4R7qKhI_VFpDxs" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --force 2>/dev/null || echo "NEXT_PUBLIC_SUPABASE_ANON_KEY exists"

echo "LinkPickPlatform2024!SuperSecretJWTKey#RevuPlatformProduction$" | vercel env add JWT_SECRET production preview development --force 2>/dev/null || echo "JWT_SECRET exists"

echo "LinkPickPlatform2024RefreshToken!SuperSecret#Production$" | vercel env add JWT_REFRESH_SECRET production preview development --force 2>/dev/null || echo "JWT_REFRESH_SECRET exists"

echo "1h" | vercel env add JWT_EXPIRES_IN production preview development --force 2>/dev/null || echo "JWT_EXPIRES_IN exists"

echo "7d" | vercel env add JWT_REFRESH_EXPIRES_IN production preview development --force 2>/dev/null || echo "JWT_REFRESH_EXPIRES_IN exists"

echo "redis://default:mYOnQFZCyXRh2xYS8Y5JLZN1WcSjIdRy@redis-15395.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com:15395" | vercel env add REDIS_URL production preview development --force 2>/dev/null || echo "REDIS_URL exists"

echo "production" | vercel env add NODE_ENV production --force 2>/dev/null || echo "NODE_ENV exists"

echo "https://commerce-nextjs-ruddy.vercel.app,https://*.vercel.app" | vercel env add CORS_ORIGIN production preview development --force 2>/dev/null || echo "CORS_ORIGIN exists"

echo "true" | vercel env add PLUGIN_ENABLED production preview development --force 2>/dev/null || echo "PLUGIN_ENABLED exists"

echo "true" | vercel env add CORE_INTEGRATION production preview development --force 2>/dev/null || echo "CORE_INTEGRATION exists"

echo "✅ Vercel 환경 변수 설정 완료!"
echo "🚀 배포 명령: vercel --prod"