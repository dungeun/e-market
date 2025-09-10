#!/bin/bash
echo "=== PostgreSQL 컨테이너 시작 ==="

ssh root@141.164.60.51 << 'ENDSSH'
echo "1. 현재 PostgreSQL 컨테이너 상태:"
podman ps -a | grep commerce-postgres

echo
echo "2. commerce-postgres 컨테이너 시작..."
if podman start commerce-postgres; then
    echo "✅ 컨테이너 시작 성공!"
    
    echo "3. 시작 후 상태 확인:"
    sleep 3
    podman ps | grep commerce-postgres
    
    echo
    echo "4. 로그 확인 (최근 10줄):"
    podman logs --tail 10 commerce-postgres
    
    echo
    echo "5. PostgreSQL 준비 상태 확인:"
    for i in {1..10}; do
        if podman exec commerce-postgres pg_isready -U postgres; then
            echo "✅ PostgreSQL 준비 완료!"
            break
        else
            echo "대기 중... ($i/10)"
            sleep 2
        fi
    done
    
    echo
    echo "6. 컨테이너 환경변수:"
    podman exec commerce-postgres env | grep POSTGRES
    
    echo
    echo "7. 데이터베이스 목록:"
    podman exec commerce-postgres psql -U postgres -c "\l"
    
    echo
    echo "8. 사용자 목록:"
    podman exec commerce-postgres psql -U postgres -c "\du"
    
else
    echo "❌ 컨테이너 시작 실패"
    echo "로그 확인:"
    podman logs commerce-postgres
fi
ENDSSH