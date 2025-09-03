#!/bin/bash

# Podman 설정 및 실행 스크립트
set -e

echo "🚀 Commerce Platform - Podman Setup Script"
echo "========================================="

# 1. Podman 설치 확인
if ! command -v podman &> /dev/null; then
    echo "❌ Podman이 설치되지 않았습니다."
    echo "다음 명령으로 설치하세요:"
    echo "brew install podman (macOS)"
    echo "sudo apt-get install podman (Ubuntu)"
    exit 1
fi

echo "✅ Podman 버전: $(podman --version)"

# 2. Podman Machine 초기화 (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Podman Machine 설정 중..."
    
    # 기존 머신 확인
    if podman machine list | grep -q "podman-machine-default"; then
        echo "기존 Podman Machine이 있습니다. 시작합니다..."
        podman machine start
    else
        echo "새 Podman Machine을 생성합니다..."
        podman machine init --cpus 4 --memory 8192 --disk-size 50
        podman machine start
    fi
fi

# 3. 환경변수 파일 생성
if [ ! -f .env ]; then
    echo "📝 환경변수 파일 생성 중..."
    cp .env.example .env
    
    # 랜덤 시크릿 생성
    JWT_SECRET=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16)
    
    # macOS와 Linux 모두 지원
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your-secret-key-change-this-in-production/$JWT_SECRET/g" .env
        sed -i '' "s/your-secret-key-here/$NEXTAUTH_SECRET/g" .env
        sed -i '' "s/secure_password/$DB_PASSWORD/g" .env
    else
        sed -i "s/your-secret-key-change-this-in-production/$JWT_SECRET/g" .env
        sed -i "s/your-secret-key-here/$NEXTAUTH_SECRET/g" .env
        sed -i "s/secure_password/$DB_PASSWORD/g" .env
    fi
    
    echo "✅ 환경변수 설정 완료"
fi

# 4. 볼륨 디렉토리 생성
echo "📁 볼륨 디렉토리 생성 중..."
mkdir -p ./volumes/postgres
mkdir -p ./volumes/redis
mkdir -p ./uploads
mkdir -p ./ssl

# 5. 네트워크 생성
echo "🌐 Podman 네트워크 생성 중..."
podman network create commerce-network 2>/dev/null || echo "네트워크가 이미 존재합니다."

# 6. PostgreSQL 컨테이너 실행
echo "🐘 PostgreSQL 컨테이너 시작 중..."
podman run -d \
    --name commerce-postgres \
    --network commerce-network \
    -e POSTGRES_USER=commerce \
    -e POSTGRES_PASSWORD=$DB_PASSWORD \
    -e POSTGRES_DB=commerce_db \
    -p 5432:5432 \
    -v ./volumes/postgres:/var/lib/postgresql/data \
    --restart unless-stopped \
    docker.io/postgres:15-alpine || echo "PostgreSQL 컨테이너가 이미 실행 중입니다."

# 7. Redis 컨테이너 실행
echo "📦 Redis 컨테이너 시작 중..."
podman run -d \
    --name commerce-redis \
    --network commerce-network \
    -p 6379:6379 \
    -v ./volumes/redis:/data \
    --restart unless-stopped \
    docker.io/redis:7-alpine redis-server --appendonly yes || echo "Redis 컨테이너가 이미 실행 중입니다."

# 8. 데이터베이스 초기화 대기
echo "⏳ 데이터베이스 초기화 대기 중..."
sleep 5

# 9. Prisma 마이그레이션 실행
echo "🔄 Prisma 마이그레이션 실행 중..."
npm run db:generate
npm run db:push

# 10. 애플리케이션 빌드
echo "🏗️ Next.js 애플리케이션 빌드 중..."
npm run build

# 11. 애플리케이션 컨테이너 빌드 및 실행
echo "🚀 애플리케이션 컨테이너 빌드 중..."
podman build -t commerce-app:latest .

echo "🎯 애플리케이션 컨테이너 실행 중..."
podman run -d \
    --name commerce-app \
    --network commerce-network \
    -p 3000:3000 \
    -v ./uploads:/app/uploads \
    -v ./public:/app/public \
    --env-file .env \
    --restart unless-stopped \
    commerce-app:latest || echo "애플리케이션 컨테이너가 이미 실행 중입니다."

# 12. 상태 확인
echo ""
echo "✅ Podman 설정 완료!"
echo "========================================="
echo "실행 중인 컨테이너:"
podman ps

echo ""
echo "📌 접속 정보:"
echo "- 애플리케이션: http://localhost:3000"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
echo "🔧 유용한 명령어:"
echo "- 로그 확인: podman logs commerce-app"
echo "- 컨테이너 중지: podman stop commerce-app commerce-postgres commerce-redis"
echo "- 컨테이너 시작: podman start commerce-app commerce-postgres commerce-redis"
echo "- 전체 정리: podman system prune -a"