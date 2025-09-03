# 의존성 설치 단계
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && \
    npm install prisma

# 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# 프로덕션 단계
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Standalone 모드 사용
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma 클라이언트
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Create writable directories
RUN mkdir -p /app/uploads && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "server.js"]