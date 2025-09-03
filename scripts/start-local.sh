#!/bin/bash

# 로컬 개발 환경 시작 스크립트
set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Commerce Platform - 로컬 개발 환경 시작${NC}"
echo "============================================"

# 1. Podman 확인
check_podman() {
    echo -e "${YELLOW}📍 Podman 상태 확인...${NC}"
    
    if ! command -v podman &> /dev/null; then
        echo -e "${RED}❌ Podman이 설치되지 않았습니다.${NC}"
        echo "설치 방법:"
        echo "  macOS: brew install podman"
        echo "  Linux: sudo apt-get install podman"
        exit 1
    fi
    
    # macOS에서 Podman Machine 확인
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if ! podman machine list | grep -q "Currently running"; then
            echo -e "${YELLOW}⚠️  Podman Machine이 실행되지 않았습니다. 시작합니다...${NC}"
            podman machine start
        fi
    fi
    
    echo -e "${GREEN}✅ Podman 준비 완료${NC}"
}

# 2. PostgreSQL 확인 (공유 서버 사용)
start_postgres() {
    echo -e "${YELLOW}🐘 PostgreSQL 상태 확인...${NC}"
    
    # videopick-postgres-local 컨테이너 사용
    if podman ps | grep -q videopick-postgres-local; then
        echo -e "${GREEN}✅ 공유 PostgreSQL 서버가 실행 중입니다${NC}"
    else
        echo -e "${YELLOW}⚠️  공유 PostgreSQL 서버가 실행되지 않았습니다. 시작 중...${NC}"
        podman start videopick-postgres-local
        sleep 5
        if podman ps | grep -q videopick-postgres-local; then
            echo -e "${GREEN}✅ 공유 PostgreSQL 서버 시작됨${NC}"
        else
            echo -e "${RED}❌ PostgreSQL 서버를 시작할 수 없습니다${NC}"
            echo "videopick-postgres-local 컨테이너가 존재하는지 확인하세요"
            exit 1
        fi
    fi
    
    # commerce_db 데이터베이스 존재 확인
    echo "📍 commerce_db 데이터베이스 확인 중..."
    if PGPASSWORD=secure_password_2024 psql -h localhost -p 5432 -U commerce -d commerce_db -c '\l' &> /dev/null; then
        echo -e "${GREEN}✅ commerce_db 데이터베이스 준비 완료${NC}"
    else
        echo -e "${YELLOW}⚠️  commerce_db가 없습니다. 생성 스크립트를 실행하세요:${NC}"
        echo "   ./scripts/setup-shared-db.sh"
        exit 1
    fi
}

# 3. Redis 시작
start_redis() {
    echo -e "${YELLOW}📦 Redis 시작...${NC}"
    
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
}

# 4. 데이터베이스 상태 확인
check_database() {
    echo -e "${YELLOW}🔍 데이터베이스 연결 확인...${NC}"
    
    # PostgreSQL 연결 테스트
    for i in {1..10}; do
        if PGPASSWORD=secure_password_2024 psql -h localhost -p 5432 -U commerce -d commerce_db -c '\l' &> /dev/null; then
            echo -e "${GREEN}✅ PostgreSQL 연결 성공${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}❌ PostgreSQL 연결 실패${NC}"
    return 1
}

# 5. Prisma 마이그레이션
run_migrations() {
    echo -e "${YELLOW}🔄 데이터베이스 마이그레이션...${NC}"
    
    # Prisma 클라이언트 생성
    npm run db:generate
    
    # 마이그레이션 실행
    npm run db:push
    
    echo -e "${GREEN}✅ 마이그레이션 완료${NC}"
}

# 6. 초기 데이터 시딩
seed_database() {
    echo -e "${YELLOW}🌱 초기 데이터 시딩...${NC}"
    
    # 시딩 실행
    npm run db:seed
    
    echo -e "${GREEN}✅ 시딩 완료${NC}"
}

# 7. 개발 서버 시작
start_dev_server() {
    echo -e "${YELLOW}🚀 Next.js 개발 서버 시작...${NC}"
    
    # 환경변수 확인
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  .env 파일이 생성되었습니다. 필요한 값을 설정하세요.${NC}"
    fi
    
    # 개발 서버 시작
    echo -e "${GREEN}✅ 개발 서버를 시작합니다...${NC}"
    echo ""
    echo "============================================"
    echo -e "${GREEN}✨ 모든 준비가 완료되었습니다!${NC}"
    echo ""
    echo "📌 접속 정보:"
    echo "  - 애플리케이션: http://localhost:3000"
    echo "  - Prisma Studio: http://localhost:5555"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo ""
    echo "🔐 기본 계정:"
    echo "  - 관리자: admin@commerce.com / Admin@123456"
    echo "  - 사용자: user1@test.com / User@123456"
    echo ""
    echo "🛠️ 유용한 명령어:"
    echo "  - DB 관리: npm run db:studio"
    echo "  - 로그 확인: podman logs commerce-postgres"
    echo "  - 컨테이너 상태: podman ps"
    echo "============================================"
    echo ""
    
    # 개발 서버 실행
    npm run dev
}

# 8. 정리 함수
cleanup() {
    echo -e "\n${YELLOW}🧹 종료 중...${NC}"
    echo "컨테이너를 중지하려면: podman stop commerce-postgres commerce-redis"
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 메인 실행
main() {
    # 1. Podman 확인
    check_podman
    
    # 2. PostgreSQL 시작
    start_postgres
    
    # 3. Redis 시작
    start_redis
    
    # 4. 데이터베이스 연결 확인
    check_database
    
    # 5. 마이그레이션 실행
    run_migrations
    
    # 6. 시딩 (선택적)
    read -p "초기 데이터를 시딩하시겠습니까? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        seed_database
    fi
    
    # 7. 개발 서버 시작
    start_dev_server
}

# 스크립트 실행
main "$@"