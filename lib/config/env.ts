/**
 * Environment Configuration
 * Centralized configuration to replace hardcoded values
 */

export const env = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3004', 10),
  host: process.env.HOST || '0.0.0.0',
  
  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3004',
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/commerce_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'commerce_db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || 'noreply@commerce-app.com',
  },
  
  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'public/uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedExtensions: (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif,webp').split(','),
  },
  
  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10),
  },
  
  // Default Values
  defaults: {
    language: process.env.DEFAULT_LANGUAGE || 'ko',
    currency: process.env.DEFAULT_CURRENCY || 'KRW',
    pageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
  
  // Feature Flags
  features: {
    multiLanguage: process.env.FEATURE_MULTI_LANGUAGE === 'true',
    socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
    advancedSearch: process.env.FEATURE_ADVANCED_SEARCH === 'true',
  },
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  mockData: process.env.ENABLE_MOCK_DATA === 'true',
};

// Type-safe environment variable access
export type Environment = typeof env;

// Validate required environment variables
export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && env.isProduction) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default env;