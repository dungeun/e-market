#!/bin/bash

# PostgreSQL 데이터베이스 초기화 스크립트
set -e

echo "🐘 PostgreSQL 데이터베이스 초기화 시작"
echo "========================================"

# 환경변수 설정
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-commerce_db}"
DB_USER="${DB_USER:-commerce}"
DB_PASSWORD="${DB_PASSWORD:-secure_password_2024}"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PostgreSQL 실행 확인
check_postgres() {
    echo "📍 PostgreSQL 연결 테스트 중..."
    
    if command -v psql &> /dev/null; then
        echo -e "${GREEN}✅ psql 클라이언트 발견${NC}"
    else
        echo -e "${RED}❌ psql이 설치되지 않았습니다.${NC}"
        echo "설치 명령:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt-get install postgresql-client"
        exit 1
    fi
    
    # PostgreSQL 서버 연결 테스트
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres -c '\l' &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL 서버 연결 성공${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL 서버에 연결할 수 없습니다. Podman으로 실행합니다...${NC}"
        start_postgres_podman
    fi
}

# Podman으로 PostgreSQL 실행
start_postgres_podman() {
    echo "🚀 Podman으로 PostgreSQL 컨테이너 시작..."
    
    # 기존 컨테이너 확인 및 제거
    if podman ps -a | grep -q commerce-postgres; then
        echo "기존 PostgreSQL 컨테이너 제거 중..."
        podman stop commerce-postgres 2>/dev/null || true
        podman rm commerce-postgres 2>/dev/null || true
    fi
    
    # PostgreSQL 컨테이너 실행
    podman run -d \
        --name commerce-postgres \
        -e POSTGRES_USER=$DB_USER \
        -e POSTGRES_PASSWORD=$DB_PASSWORD \
        -e POSTGRES_DB=$DB_NAME \
        -p $DB_PORT:5432 \
        -v postgres_data:/var/lib/postgresql/data \
        --restart unless-stopped \
        docker.io/postgres:15-alpine
    
    echo "⏳ PostgreSQL 초기화 대기 중..."
    sleep 10
    
    # 연결 재시도
    for i in {1..30}; do
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\l' &> /dev/null; then
            echo -e "${GREEN}✅ PostgreSQL 컨테이너 실행 및 연결 성공${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done
}

# 데이터베이스 생성
create_database() {
    echo "📦 데이터베이스 생성 중..."
    
    # postgres 사용자로 접속하여 데이터베이스 생성
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U postgres <<EOF
-- 사용자 생성 (이미 존재하면 무시)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END\$\$;

-- 데이터베이스 생성 (이미 존재하면 무시)
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF
    
    echo -e "${GREEN}✅ 데이터베이스 설정 완료${NC}"
}

# 확장 프로그램 설치
install_extensions() {
    echo "🔧 PostgreSQL 확장 프로그램 설치 중..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
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
}

# 성능 최적화 설정
optimize_database() {
    echo "⚡ 데이터베이스 성능 최적화 중..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
-- 연결 설정
ALTER DATABASE $DB_NAME SET max_connections = 200;

-- 메모리 설정 (개발 환경)
ALTER DATABASE $DB_NAME SET shared_buffers = '256MB';
ALTER DATABASE $DB_NAME SET effective_cache_size = '1GB';
ALTER DATABASE $DB_NAME SET maintenance_work_mem = '64MB';

-- 쿼리 최적화
ALTER DATABASE $DB_NAME SET random_page_cost = 1.1;
ALTER DATABASE $DB_NAME SET effective_io_concurrency = 200;

-- 로깅 설정
ALTER DATABASE $DB_NAME SET log_statement = 'all';
ALTER DATABASE $DB_NAME SET log_duration = on;
EOF
    
    echo -e "${GREEN}✅ 성능 최적화 완료${NC}"
}

# 환경변수 파일 업데이트
update_env_file() {
    echo "📝 환경변수 파일 업데이트 중..."
    
    # .env 파일이 없으면 생성
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
    
    # DATABASE_URL 업데이트
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"
    
    # macOS와 Linux 모두 지원
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|g" .env
    else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|g" .env
    fi
    
    echo -e "${GREEN}✅ 환경변수 업데이트 완료${NC}"
    echo "DATABASE_URL: $DATABASE_URL"
}

# Prisma 마이그레이션 실행
run_prisma_migration() {
    echo "🔄 Prisma 마이그레이션 실행 중..."
    
    # Prisma 클라이언트 생성
    npx prisma generate
    
    # 마이그레이션 실행
    npx prisma migrate dev --name init
    
    echo -e "${GREEN}✅ Prisma 마이그레이션 완료${NC}"
}

# Redis 실행 (옵션)
start_redis_podman() {
    echo "📦 Redis 컨테이너 시작..."
    
    if podman ps -a | grep -q commerce-redis; then
        echo "기존 Redis 컨테이너 제거 중..."
        podman stop commerce-redis 2>/dev/null || true
        podman rm commerce-redis 2>/dev/null || true
    fi
    
    podman run -d \
        --name commerce-redis \
        -p 6379:6379 \
        -v redis_data:/data \
        --restart unless-stopped \
        docker.io/redis:7-alpine redis-server --appendonly yes
    
    echo -e "${GREEN}✅ Redis 컨테이너 실행 완료${NC}"
}

# 메인 실행
main() {
    echo "🚀 Commerce Platform 데이터베이스 초기화"
    echo "========================================"
    
    # 1. PostgreSQL 확인 및 실행
    check_postgres
    
    # 2. 데이터베이스 생성
    create_database
    
    # 3. 확장 프로그램 설치
    install_extensions
    
    # 4. 성능 최적화
    optimize_database
    
    # 5. 환경변수 업데이트
    update_env_file
    
    # 6. Prisma 마이그레이션
    run_prisma_migration
    
    # 7. Redis 실행 (옵션)
    read -p "Redis도 실행하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_redis_podman
    fi
    
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 데이터베이스 초기화 완료!${NC}"
    echo ""
    echo "📌 연결 정보:"
    echo "  PostgreSQL: $DB_HOST:$DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo ""
    echo "🔧 다음 명령어:"
    echo "  개발 서버 실행: npm run dev"
    echo "  Prisma Studio: npm run db:studio"
    echo "  데이터베이스 상태: podman ps"
}

# 스크립트 실행
main "$@"