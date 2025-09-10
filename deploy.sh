#!/bin/bash

# 배포 설정
REMOTE_HOST="141.164.60.51"
REMOTE_USER="root"
PROJECT_NAME="commerce-nextjs"
REMOTE_DIR="/opt/${PROJECT_NAME}"

echo "🚀 Commerce Next.js 배포 시작..."

# 1. 로컬 개발 서버 종료
echo "📛 로컬 개발 서버 종료 중..."
lsof -ti:3001 | xargs -r kill 2>/dev/null || true

# 2. 프로젝트 빌드 및 압축
echo "📦 프로젝트 압축 중..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='uploads' \
    -czf ${PROJECT_NAME}.tar.gz .

# 3. 원격 서버로 파일 전송
echo "📤 파일 전송 중..."
scp ${PROJECT_NAME}.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:/tmp/

# 4. 원격 서버에서 배포 실행
echo "🔄 원격 서버 배포 실행 중..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << 'EOF'
set -e

PROJECT_NAME="commerce-nextjs"
REMOTE_DIR="/opt/${PROJECT_NAME}"

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 서비스 중지 중..."
cd ${REMOTE_DIR} 2>/dev/null || true
podman-compose -f docker/podman-compose.yml down 2>/dev/null || true

# 백업 생성
if [ -d "${REMOTE_DIR}" ]; then
    echo "💾 기존 배포 백업 중..."
    mv ${REMOTE_DIR} ${REMOTE_DIR}_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

# 새 배포 디렉토리 생성
echo "📁 배포 디렉토리 준비 중..."
mkdir -p ${REMOTE_DIR}
cd ${REMOTE_DIR}

# 압축 해제
echo "📦 프로젝트 압축 해제 중..."
tar -xzf /tmp/${PROJECT_NAME}.tar.gz

# 환경 변수 파일 생성
echo "🔧 환경 변수 설정 중..."
cat > .env.production << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://commerce:secure_password@postgres:5432/commerce_db
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NEXTAUTH_URL=http://141.164.60.51:3001
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NODE_TLS_REJECT_UNAUTHORIZED=0
ENVEOF

# 빌드 이미지 및 시작
echo "🏗️ 컨테이너 빌드 및 시작 중..."
cd docker
podman-compose -f podman-compose.yml up -d --build

# 서비스 상태 확인
echo "🔍 서비스 상태 확인 중..."
sleep 30
podman-compose -f podman-compose.yml ps

# 헬스체크
echo "🏥 헬스체크 실행 중..."
for i in {1..10}; do
    if curl -f http://localhost:3001 2>/dev/null; then
        echo "✅ 서비스가 정상 동작 중입니다!"
        break
    fi
    echo "⏳ 서비스 시작 대기 중... (${i}/10)"
    sleep 5
done

# 임시 파일 정리
rm -f /tmp/${PROJECT_NAME}.tar.gz

echo "🎉 배포 완료!"
echo "🌐 URL: http://141.164.60.51:3001"
EOF

# 5. 로컬 임시 파일 정리
echo "🧹 로컬 임시 파일 정리 중..."
rm -f ${PROJECT_NAME}.tar.gz

echo "✅ 배포 스크립트 완료!"
echo "🌐 URL: http://141.164.60.51:3001"