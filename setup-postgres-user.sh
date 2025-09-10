#!/bin/bash
echo "=== PostgreSQL 사용자 및 데이터베이스 설정 ==="

ssh root@141.164.60.51 << 'ENDSSH'
echo "1. 현재 사용자 목록:"
sudo -u postgres psql -c "\du"

echo
echo "2. commerce 사용자 생성:"
sudo -u postgres psql -c "DROP USER IF EXISTS commerce;"
sudo -u postgres psql -c "CREATE USER commerce WITH PASSWORD 'secure_password' CREATEDB;"

echo
echo "3. commerce_db 데이터베이스 생성:"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS commerce_db;"
sudo -u postgres psql -c "CREATE DATABASE commerce_db OWNER commerce;"

echo
echo "4. 권한 부여:"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE commerce_db TO commerce;"

echo
echo "5. PostgreSQL 설정 확인:"
sudo -u postgres psql -c "\l" | grep commerce

echo
echo "6. pg_hba.conf 설정 (외부 접근 허용):"
PG_HBA="/etc/postgresql/15/main/pg_hba.conf"
if ! grep -q "host.*commerce.*md5" "$PG_HBA"; then
    echo "host    commerce_db     commerce        0.0.0.0/0               md5" >> "$PG_HBA"
    echo "외부 접근 설정 추가됨"
else
    echo "외부 접근 설정이 이미 존재함"
fi

echo
echo "7. postgresql.conf 설정 (외부 연결 허용):"
PG_CONF="/etc/postgresql/15/main/postgresql.conf"
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
echo "listen_addresses 설정 업데이트됨"

echo
echo "8. PostgreSQL 재시작:"
systemctl restart postgresql

echo "잠시 대기 중..."
sleep 3

echo
echo "9. 연결 테스트:"
PGPASSWORD=secure_password psql -h localhost -U commerce -d commerce_db -c "SELECT 'Success! Ready for migrations.' as status;"

ENDSSH