#!/bin/bash

# 공유 PostgreSQL 서버에 commerce 데이터베이스 설정
set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐘 공유 PostgreSQL 서버에 Commerce 데이터베이스 설정${NC}"
echo "============================================"

# PostgreSQL 연결 정보 (기존 서버)
PG_CONTAINER="videopick-postgres-local"
PG_HOST="localhost"
PG_PORT="5432"
PG_ADMIN_USER="admin"
PG_ADMIN_PASSWORD="dev_password"

# commerce 데이터베이스와 사용자 생성
echo -e "${YELLOW}📦 Commerce 데이터베이스 및 사용자 생성 중...${NC}"

PGPASSWORD=$PG_ADMIN_PASSWORD podman exec $PG_CONTAINER psql -U $PG_ADMIN_USER -d videopick_dev <<EOF
-- commerce 사용자 생성 (이미 존재하면 무시)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'commerce') THEN
        CREATE USER commerce WITH PASSWORD 'secure_password_2024';
    ELSE
        ALTER USER commerce WITH PASSWORD 'secure_password_2024';
    END IF;
END\$\$;

-- commerce_db 데이터베이스 생성 (이미 존재하면 무시)
SELECT 'CREATE DATABASE commerce_db OWNER commerce'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'commerce_db')\gexec

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE commerce_db TO commerce;
ALTER USER commerce CREATEDB;

-- 연결 정보 확인
\l commerce_db
\du commerce
EOF

echo -e "${GREEN}✅ 데이터베이스 설정 완료${NC}"

# commerce_db에 확장 프로그램 설치
echo -e "${YELLOW}🔧 PostgreSQL 확장 프로그램 설치 중...${NC}"

PGPASSWORD=$PG_ADMIN_PASSWORD podman exec $PG_CONTAINER psql -U $PG_ADMIN_USER -d commerce_db <<EOF
-- UUID 지원
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 암호화 지원
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 전체 텍스트 검색
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- JSON 인덱싱
CREATE EXTENSION IF NOT EXISTS "btree_gin";
EOF

echo -e "${GREEN}✅ 확장 프로그램 설치 완료${NC}"

# 환경변수 파일 업데이트 안내
echo ""
echo -e "${BLUE}📌 환경변수 설정 확인${NC}"
echo "DATABASE_URL이 다음과 같이 설정되어 있는지 확인하세요:"
echo "postgresql://commerce:secure_password_2024@localhost:5432/commerce_db?schema=public"
echo ""

# Redis 확인
echo -e "${YELLOW}📦 Redis 상태 확인...${NC}"
if podman ps | grep -q commerce-redis; then
    echo -e "${GREEN}✅ Redis가 이미 실행 중입니다${NC}"
else
    if podman ps -a | grep -q commerce-redis; then
        podman start commerce-redis
        echo -e "${GREEN}✅ Redis 컨테이너 시작됨${NC}"
    else
        echo "Redis 컨테이너를 생성합니다..."
        podman run -d \
            --name commerce-redis \
            -p 6379:6379 \
            -v redis_data:/data \
            --restart unless-stopped \
            docker.io/redis:7-alpine redis-server --appendonly yes
        
        echo -e "${GREEN}✅ Redis 컨테이너 생성 및 시작됨${NC}"
    fi
fi

echo ""
echo "============================================"
echo -e "${GREEN}✨ 데이터베이스 설정 완료!${NC}"
echo ""
echo "📝 다음 단계:"
echo "1. Prisma 마이그레이션 실행: npm run db:push"
echo "2. 초기 데이터 시딩: npm run db:seed"
echo "3. 개발 서버 시작: npm run dev"
echo ""
echo "🔐 데이터베이스 접속 정보:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: commerce_db"
echo "  User: commerce"
echo "  Password: secure_password_2024"
echo "============================================"