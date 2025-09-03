/**
 * 환경변수 검증 시스템
 * 
 * 애플리케이션 시작 시 필수 환경변수를 검증하고
 * 누락된 환경변수가 있으면 명확한 에러 메시지와 함께 실패합니다.
 */

import { z } from 'zod';

// 환경변수 스키마 정의
const envSchema = z.object({
  // 데이터베이스
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // JWT 인증
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // 결제 (Toss Payments)
  TOSS_CLIENT_KEY: z.string().startsWith('test_').or(z.string().startsWith('live_')),
  TOSS_SECRET_KEY: z.string().startsWith('test_').or(z.string().startsWith('live_')),
  NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().optional(),
  
  // 애플리케이션
  NEXT_PUBLIC_BASE_URL: z.string().url('NEXT_PUBLIC_BASE_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Redis (선택적)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // AWS S3 (선택적)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // 이메일 (선택적)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

// 환경변수 타입
export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentValidator {
  private config: EnvConfig | null = null;
  private errors: string[] = [];

  /**
   * 환경변수 검증 및 초기화
   */
  initialize(): EnvConfig {
    if (this.config) {
      return this.config;
    }

    try {
      // 환경변수 검증
      this.config = envSchema.parse(process.env);
      
      // 프로덕션 환경 추가 검증
      if (this.config.NODE_ENV === 'production') {
        this.validateProduction();
      }

      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.handleValidationError(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * 프로덕션 환경 추가 검증
   */
  private validateProduction() {
    const warnings: string[] = [];
    
    // 테스트 키 사용 경고
    if (this.config?.TOSS_CLIENT_KEY.startsWith('test_')) {
      warnings.push('⚠️  WARNING: Using TEST Toss payment keys in PRODUCTION');
    }
    
    // HTTPS 확인
    if (!this.config?.NEXT_PUBLIC_BASE_URL.startsWith('https://')) {
      warnings.push('⚠️  WARNING: NEXT_PUBLIC_BASE_URL should use HTTPS in production');
    }
    
    // Redis 설정 확인
    if (!this.config?.REDIS_HOST) {
      warnings.push('⚠️  WARNING: Redis not configured for production caching');
    }
    
    if (warnings.length > 0) {

      warnings.forEach(w => 

    }
  }

  /**
   * 검증 에러 처리
   */
  private handleValidationError(error: z.ZodError): never {

    error.errors.forEach(err => {
      const path = err.path.join('.');
      const message = err.message;

      this.errors.push(`${path}: ${message}`);
    });

    process.exit(1);
  }

  /**
   * 환경변수 값 가져오기 (타입 안전)
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    if (!this.config) {
      this.initialize();
    }
    return this.config![key];
  }

  /**
   * 모든 환경변수 가져오기
   */
  getAll(): EnvConfig {
    if (!this.config) {
      this.initialize();
    }
    return this.config!;
  }

  /**
   * 환경 확인 헬퍼
   */
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
}

// 싱글톤 인스턴스
export const env = new EnvironmentValidator();

// 애플리케이션 시작 시 자동 검증 (Next.js instrumentation.ts에서 호출)
if (typeof window === 'undefined') {
  env.initialize();
}