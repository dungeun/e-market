#!/bin/bash
echo "=== 실행 중인 PostgreSQL에 연결 시도 ==="

ssh root@141.164.60.51 << 'ENDSSH'
echo "1. 현재 PostgreSQL 프로세스:"
ps aux | grep postgres | grep -v grep

echo
echo "2. 포트 5432 사용 중인 프로세스:"
netstat -tlnp | grep :5432

echo
echo "3. 직접 PostgreSQL 연결 시도:"
echo "기본 postgres 사용자로 연결..."
if psql -U postgres -c "SELECT version();" 2>/dev/null; then
    echo "✅ postgres 사용자 연결 성공!"
    
    echo
    echo "4. 사용자 목록:"
    psql -U postgres -c "\du"
    
    echo
    echo "5. 데이터베이스 목록:"
    psql -U postgres -c "\l"
    
    echo
    echo "6. commerce 사용자 생성 (필요시):"
    psql -U postgres -c "CREATE USER commerce WITH PASSWORD 'secure_password';" 2>/dev/null || echo "사용자가 이미 존재하거나 권한 부족"
    psql -U postgres -c "ALTER USER commerce CREATEDB;" 2>/dev/null
    
    echo
    echo "7. commerce_db 데이터베이스 생성 (필요시):"
    psql -U postgres -c "CREATE DATABASE commerce_db OWNER commerce;" 2>/dev/null || echo "데이터베이스가 이미 존재하거나 생성 실패"
    
    echo
    echo "8. 권한 부여:"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE commerce_db TO commerce;" 2>/dev/null
    
    echo
    echo "9. commerce 사용자로 연결 테스트:"
    PGPASSWORD=secure_password psql -U commerce -d commerce_db -c "SELECT 'Connection successful!' as result;" 2>/dev/null || echo "commerce 사용자 연결 실패"
    
else
    echo "❌ postgres 사용자 연결 실패"
    
    echo "Ubuntu postgres 사용자로 시도..."
    sudo -u postgres psql -c "SELECT version();" 2>/dev/null || echo "sudo로도 연결 실패"
fi

ENDSSH