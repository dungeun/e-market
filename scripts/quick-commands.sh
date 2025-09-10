#!/bin/bash

# 하이브리드 개발환경 빠른 명령어 모음
# 사용법: ./scripts/quick-commands.sh [command]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 도움말 출력
show_help() {
    echo -e "${BLUE}=== 하이브리드 개발환경 빠른 명령어 ===${NC}"
    echo ""
    echo -e "${YELLOW}개발 관련:${NC}"
    echo "  dev          - 로컬 개발 서버 시작"
    echo "  vercel-dev   - Vercel 환경으로 개발 서버 시작"
    echo "  build        - 프로덕션 빌드"
    echo "  build-check  - 상세 빌드 검증"
    echo "  typecheck    - TypeScript 타입 검증"
    echo ""
    echo -e "${YELLOW}데이터베이스 관련:${NC}"
    echo "  test-server  - 서버 DB 연결 테스트"
    echo "  test-drizzle - Drizzle ORM 테스트"
    echo "  sync-schema  - 스키마 서버 동기화"
    echo "  backup-db    - 데이터베이스 백업"
    echo ""
    echo -e "${YELLOW}서버 관리:${NC}"
    echo "  server-status   - 서버 컨테이너 상태 확인"
    echo "  server-storage  - 서버 스토리지 용량 확인"
    echo "  server-ssh      - 서버 SSH 접속"
    echo ""
    echo -e "${YELLOW}시스템 상태:${NC}"
    echo "  status       - 전체 시스템 상태 확인"
    echo "  health       - 헬스 체크 실행"
    echo ""
    echo "사용 예: ./scripts/quick-commands.sh dev"
}

# 시스템 상태 확인
check_status() {
    echo -e "${BLUE}🔍 시스템 상태 확인 중...${NC}"
    echo ""
    
    echo -e "${YELLOW}📡 서버 연결 상태:${NC}"
    npm run test:server
    echo ""
    
    echo -e "${YELLOW}💾 서버 스토리지 상태:${NC}"
    ssh root@141.164.60.51 'df -h /mnt/blockstorage'
    echo ""
    
    echo -e "${YELLOW}🐳 서버 컨테이너 상태:${NC}"
    ssh root@141.164.60.51 'podman ps -a'
    echo ""
    
    echo -e "${GREEN}✅ 시스템 상태 확인 완료${NC}"
}

# 헬스 체크
health_check() {
    echo -e "${BLUE}🏥 헬스 체크 실행 중...${NC}"
    echo ""
    
    # 1. 로컬 환경 체크
    echo -e "${YELLOW}1. 로컬 환경 체크${NC}"
    if [ -f ".env" ]; then
        echo "✅ .env 파일 존재"
    else
        echo "❌ .env 파일 없음"
        return 1
    fi
    
    if [ -f "drizzle.config.ts" ]; then
        echo "✅ Drizzle 설정 존재"
    else
        echo "❌ Drizzle 설정 없음"
    fi
    
    # 2. 의존성 체크
    echo -e "${YELLOW}2. 필수 도구 체크${NC}"
    if command -v vercel &> /dev/null; then
        echo "✅ Vercel CLI 설치됨 ($(vercel --version))"
    else
        echo "❌ Vercel CLI 미설치"
    fi
    
    if command -v npx &> /dev/null; then
        echo "✅ NPX 사용 가능"
    else
        echo "❌ NPX 사용 불가"
    fi
    
    # 3. 서버 연결 체크
    echo -e "${YELLOW}3. 서버 연결 체크${NC}"
    if ssh -o ConnectTimeout=5 root@141.164.60.51 'echo "연결 성공"' &> /dev/null; then
        echo "✅ SSH 연결 성공"
    else
        echo "❌ SSH 연결 실패"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 헬스 체크 완료!${NC}"
}

# 명령어 처리
case "$1" in
    "dev")
        echo -e "${GREEN}🚀 로컬 개발 서버 시작...${NC}"
        npm run dev
        ;;
    "vercel-dev")
        echo -e "${GREEN}⚡ Vercel 환경 개발 서버 시작...${NC}"
        vercel dev
        ;;
    "build")
        echo -e "${YELLOW}🔨 프로덕션 빌드...${NC}"
        npm run build
        ;;
    "build-check")
        echo -e "${YELLOW}🔍 상세 빌드 검증...${NC}"
        npm run build:check
        ;;
    "typecheck")
        echo -e "${BLUE}📝 TypeScript 타입 검증...${NC}"
        npm run typecheck
        ;;
    "test-server")
        echo -e "${BLUE}🔌 서버 연결 테스트...${NC}"
        npm run test:server
        ;;
    "test-drizzle")
        echo -e "${BLUE}🗃️ Drizzle 연결 테스트...${NC}"
        npm run test:drizzle
        ;;
    "sync-schema")
        echo -e "${YELLOW}🔄 스키마 서버 동기화...${NC}"
        npm run sync:schema
        ;;
    "backup-db")
        echo -e "${GREEN}💾 데이터베이스 백업...${NC}"
        npm run backup:db
        ;;
    "server-status")
        echo -e "${BLUE}📊 서버 컨테이너 상태...${NC}"
        npm run server:status
        ;;
    "server-storage")
        echo -e "${BLUE}💽 서버 스토리지 상태...${NC}"
        npm run server:storage
        ;;
    "server-ssh")
        echo -e "${BLUE}🔗 서버 SSH 접속...${NC}"
        ssh root@141.164.60.51
        ;;
    "status")
        check_status
        ;;
    "health")
        health_check
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 알 수 없는 명령어: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac