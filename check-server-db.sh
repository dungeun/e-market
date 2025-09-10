#!/bin/bash
echo "=== PostgreSQL 서버 연결 진단 스크립트 ==="
echo

# 1. 네트워크 연결 확인
echo "1. 네트워크 연결 확인..."
if nc -zv 141.164.60.51 5432 2>&1; then
    echo "✅ 포트 5432 연결 가능"
else
    echo "❌ 포트 5432 연결 불가"
fi

echo

# 2. 다양한 인증 정보 시도
echo "2. 인증 정보 시도..."

# 시도할 인증 정보들
declare -a credentials=(
    "commerce:secure_password:commerce_db"
    "commerce:commerce123:commerce"
    "postgres:secure_password:postgres"
    "postgres:postgres:postgres"
    "postgres:commerce123:commerce_db"
    "nextjs_user:ITeRgI4nxSZCaefOaheYJLnA5:nextjs_production"
)

for cred in "${credentials[@]}"; do
    IFS=':' read -r user pass db <<< "$cred"
    echo -n "시도 중: $user@$db ... "
    
    if PGPASSWORD="$pass" timeout 5 psql -h 141.164.60.51 -p 5432 -U "$user" -d "$db" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ 성공!"
        echo "USER: $user"
        echo "PASS: $pass"
        echo "DB: $db"
        echo "CONNECTION_STRING: postgresql://$user:$pass@141.164.60.51:5432/$db"
        echo
        echo "=== 연결 성공! ==="
        exit 0
    else
        echo "❌ 실패"
    fi
done

echo
echo "=== 모든 인증 정보 실패 ==="
echo "서버에서 직접 확인이 필요합니다:"
echo "ssh root@141.164.60.51"
echo "podman ps | grep postgres"
echo "podman exec -it [container_name] psql -U postgres -c '\\du'"