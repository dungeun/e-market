# 🚀 로컬 개발 환경 설정 가이드

## 📋 사전 요구사항

- Node.js 18.0.0 이상
- npm 8.0.0 이상
- Podman 설치됨
- PostgreSQL 클라이언트 (psql)

## 🔧 빠른 시작

### 1. 환경 설정
```bash
# 프로젝트 디렉토리로 이동
cd /Users/admin/new_project/commerce-nextjs

# 의존성 설치
npm install

# 환경변수 설정 확인
# .env 파일이 이미 구성되어 있습니다
```

### 2. 데이터베이스 및 서비스 실행

#### 옵션 A: 통합 스크립트 사용 (권장) 🎯
```bash
# 모든 서비스를 한 번에 시작
./scripts/start-local.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- ✅ Podman 상태 확인
- ✅ PostgreSQL 컨테이너 시작
- ✅ Redis 컨테이너 시작
- ✅ 데이터베이스 연결 확인
- ✅ Prisma 마이그레이션 실행
- ✅ 초기 데이터 시딩 (선택적)
- ✅ Next.js 개발 서버 시작

#### 옵션 B: 개별 명령 실행
```bash
# 1. 데이터베이스 초기화
./scripts/init-db.sh

# 2. Prisma 마이그레이션
npm run db:generate
npm run db:push

# 3. 초기 데이터 시딩
npm run db:seed

# 4. 개발 서버 시작
npm run dev
```

## 📌 접속 정보

### 애플리케이션
- 🌐 웹 애플리케이션: http://localhost:3000
- 📊 Prisma Studio: http://localhost:5555 (실행: `npm run db:studio`)

### 데이터베이스
- 🐘 PostgreSQL: `localhost:5432`
  - Database: `commerce_db`
  - User: `commerce`
  - Password: `secure_password_2024`

### Redis
- 📦 Redis: `localhost:6379`

## 🔐 기본 계정 정보

### 관리자 계정
- Email: `admin@commerce.com`
- Password: `Admin@123456`

### 테스트 사용자
1. 일반 사용자
   - Email: `user1@test.com`
   - Password: `User@123456`

2. 비즈니스 사용자 (B2B)
   - Email: `business@test.com`
   - Password: `User@123456`

## 🛠️ 유용한 명령어

### 데이터베이스 관리
```bash
# Prisma Studio 실행 (DB 관리 UI)
npm run db:studio

# 데이터베이스 초기화
npm run db:reset

# 마이그레이션 생성
npx prisma migrate dev --name <migration-name>

# 데이터베이스 상태 확인
npx prisma migrate status
```

### Podman 컨테이너 관리
```bash
# 컨테이너 상태 확인
podman ps

# PostgreSQL 로그 확인
podman logs commerce-postgres

# Redis 로그 확인
podman logs commerce-redis

# 컨테이너 중지
podman stop commerce-postgres commerce-redis

# 컨테이너 시작
podman start commerce-postgres commerce-redis

# 컨테이너 제거 (데이터 유지)
podman rm commerce-postgres commerce-redis
```

### 성능 최적화 인덱스 적용
```bash
# PostgreSQL에 직접 접속
PGPASSWORD=secure_password_2024 psql -h localhost -p 5432 -U commerce -d commerce_db

# 최적화 인덱스 적용
\i prisma/migrations/20250113_optimize_indexes/migration.sql

# 인덱스 상태 확인
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public';
```

## 🐛 문제 해결

### PostgreSQL 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
podman ps -a | grep postgres

# 컨테이너 재시작
podman restart commerce-postgres

# 로그 확인
podman logs commerce-postgres --tail 50
```

### Redis 연결 실패
```bash
# Redis 컨테이너 상태 확인
podman ps -a | grep redis

# 컨테이너 재시작
podman restart commerce-redis

# Redis CLI로 테스트
podman exec -it commerce-redis redis-cli ping
```

### Prisma 오류
```bash
# Prisma 클라이언트 재생성
npm run db:generate

# 스키마 강제 동기화
npm run db:push
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 프로세스 종료
kill -9 <PID>
```

## 📊 개발 환경 모니터링

### 데이터베이스 성능 모니터링
```sql
-- PostgreSQL에 접속 후 실행
-- 현재 연결 수
SELECT count(*) FROM pg_stat_activity;

-- 느린 쿼리 확인
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### Redis 모니터링
```bash
# Redis 메모리 사용량
podman exec commerce-redis redis-cli INFO memory

# Redis 키 개수
podman exec commerce-redis redis-cli DBSIZE

# Redis 모니터링 (실시간)
podman exec -it commerce-redis redis-cli MONITOR
```

## 🔄 데이터 백업 및 복원

### 백업
```bash
# PostgreSQL 백업
PGPASSWORD=secure_password_2024 pg_dump -h localhost -p 5432 -U commerce commerce_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Redis 백업
podman exec commerce-redis redis-cli BGSAVE
```

### 복원
```bash
# PostgreSQL 복원
PGPASSWORD=secure_password_2024 psql -h localhost -p 5432 -U commerce commerce_db < backup.sql

# Redis 복원 (RDB 파일 복사)
podman cp dump.rdb commerce-redis:/data/dump.rdb
podman restart commerce-redis
```

## 📝 추가 참고사항

- 모든 스크립트는 실행 권한이 설정되어 있습니다
- 환경변수는 `.env` 파일에서 관리됩니다
- 프로덕션 배포 전 반드시 비밀번호와 시크릿 키를 변경하세요
- 개발 중 문제가 발생하면 `./scripts/start-local.sh`를 다시 실행하세요

## 🎯 다음 단계

1. **로컬 테스트 완료** ✅
2. **스테이징 환경 배포**
3. **성능 테스트 실행**
4. **보안 검증**
5. **프로덕션 배포**

---

문제가 있으면 프로젝트 이슈 트래커에 보고해주세요.