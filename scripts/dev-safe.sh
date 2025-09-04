#!/bin/bash

# 자동 포트 정리 및 안전한 서버 시작 스크립트
# 포트 충돌 문제를 자동으로 해결합니다

PORT=3001
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 포트 $PORT 상태 확인 중...${NC}"

# 포트를 사용 중인 프로세스 확인
PIDS=$(lsof -ti:$PORT)

if [ ! -z "$PIDS" ]; then
    echo -e "${YELLOW}⚠️  포트 $PORT를 사용 중인 프로세스 발견:${NC}"
    lsof -i:$PORT | grep LISTEN
    
    echo -e "${YELLOW}🛑 기존 프로세스 종료 중...${NC}"
    
    # 포트를 사용하는 모든 프로세스 종료
    for PID in $PIDS; do
        kill -9 $PID 2>/dev/null && echo -e "${GREEN}✅ 프로세스 $PID 종료됨${NC}"
    done
    
    # node server.js 프로세스도 모두 종료
    pkill -f "node server.js" 2>/dev/null
    
    # 잠시 대기
    sleep 2
    
    # 다시 확인
    REMAINING=$(lsof -ti:$PORT)
    if [ ! -z "$REMAINING" ]; then
        echo -e "${RED}❌ 일부 프로세스가 여전히 실행 중입니다. 강제 종료를 시도합니다...${NC}"
        for PID in $REMAINING; do
            kill -9 $PID 2>/dev/null
        done
        sleep 1
    fi
fi

echo -e "${GREEN}✨ 포트 $PORT가 사용 가능합니다.${NC}"
echo -e "${GREEN}🚀 서버를 시작합니다...${NC}"

# 서버 시작
exec node server.js