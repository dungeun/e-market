#!/bin/bash
echo "=== 서버 PostgreSQL 정보 수집 ==="

ssh root@141.164.60.51 << 'ENDSSH'
echo "1. Podman 컨테이너 상태:"
podman ps -a | grep -i postgres

echo
echo "2. Podman 네트워크 확인:"
podman network ls

echo
echo "3. PostgreSQL 컨테이너 로그 (최근 20줄):"
POSTGRES_CONTAINER=$(podman ps -a | grep -i postgres | awk '{print $1}' | head -1)
if [ ! -z "$POSTGRES_CONTAINER" ]; then
    echo "컨테이너 ID: $POSTGRES_CONTAINER"
    podman logs --tail 20 $POSTGRES_CONTAINER
    
    echo
    echo "4. 컨테이너 환경변수 확인:"
    podman exec $POSTGRES_CONTAINER env | grep -E "(POSTGRES|USER|PASS|DB)"
    
    echo
    echo "5. PostgreSQL 사용자 목록:"
    podman exec $POSTGRES_CONTAINER psql -U postgres -c "\du" 2>/dev/null || echo "postgres 사용자로 접속 실패"
    
    echo
    echo "6. 데이터베이스 목록:"
    podman exec $POSTGRES_CONTAINER psql -U postgres -c "\l" 2>/dev/null || echo "데이터베이스 목록 조회 실패"
else
    echo "PostgreSQL 컨테이너를 찾을 수 없습니다."
fi

echo
echo "7. 포트 확인:"
netstat -tlnp | grep :5432 || ss -tlnp | grep :5432

ENDSSH