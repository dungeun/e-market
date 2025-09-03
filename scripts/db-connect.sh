#!/bin/bash

# Podman 컨테이너 내부에서 Prisma 명령 실행
set -e

echo "🔄 Podman 컨테이너를 통한 데이터베이스 작업"

case "$1" in
    "push")
        echo "📊 데이터베이스 스키마 동기화 중..."
        podman exec -e DATABASE_URL="postgresql://commerce:secure_password_2024@localhost:5432/commerce_db?schema=public" \
            videopick-postgres-local \
            sh -c "cd /tmp && npx prisma db push --schema=/workspace/prisma/schema.prisma"
        ;;
    "seed")
        echo "🌱 초기 데이터 시딩 중..."
        podman exec -e DATABASE_URL="postgresql://commerce:secure_password_2024@localhost:5432/commerce_db?schema=public" \
            videopick-postgres-local \
            sh -c "cd /tmp && npx tsx /workspace/prisma/seed.ts"
        ;;
    "studio")
        echo "🎨 Prisma Studio 실행 중..."
        DATABASE_URL="postgresql://commerce:secure_password_2024@localhost:5432/commerce_db?schema=public" \
            npx prisma studio
        ;;
    *)
        echo "사용법: $0 {push|seed|studio}"
        exit 1
        ;;
esac