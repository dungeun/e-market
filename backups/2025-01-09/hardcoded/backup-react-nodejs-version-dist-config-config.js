"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const configSchema = zod_1.z.object({
    port: zod_1.z.number().default(3000),
    nodeEnv: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // Database
    databaseUrl: zod_1.z.string(),
    // Redis
    redis: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        url: zod_1.z.string().optional(),
        host: zod_1.z.string().default('localhost'),
        port: zod_1.z.number().default(6379),
        password: zod_1.z.string().optional(),
        db: zod_1.z.number().default(0),
        retryDelayOnFailover: zod_1.z.number().default(100),
        maxRetriesPerRequest: zod_1.z.number().default(3),
    }),
    // JWT
    jwt: zod_1.z.object({
        secret: zod_1.z.string(),
        expiresIn: zod_1.z.string().default('7d'),
        refreshSecret: zod_1.z.string(),
        refreshExpiresIn: zod_1.z.string().default('30d'),
    }),
    // Security
    bcryptRounds: zod_1.z.number().default(12),
    // Rate Limiting
    rateLimit: zod_1.z.object({
        windowMs: zod_1.z.number().default(15 * 60 * 1000), // 15 minutes
        max: zod_1.z.number().default(100), // 100 requests per window
        enableAdaptive: zod_1.z.boolean().default(true),
        enableCircuitBreaker: zod_1.z.boolean().default(true),
        userTiers: zod_1.z.object({
            basic: zod_1.z.object({
                points: zod_1.z.number().default(100),
                duration: zod_1.z.number().default(60),
            }),
            premium: zod_1.z.object({
                points: zod_1.z.number().default(500),
                duration: zod_1.z.number().default(60),
            }),
            enterprise: zod_1.z.object({
                points: zod_1.z.number().default(2000),
                duration: zod_1.z.number().default(60),
            }),
        }),
    }),
    // CORS
    cors: zod_1.z.object({
        origin: zod_1.z.string().default('http://localhost:3000'),
        credentials: zod_1.z.boolean().default(true),
    }),
    // File Upload
    upload: zod_1.z.object({
        maxFileSize: zod_1.z.number().default(5 * 1024 * 1024), // 5MB
        allowedTypes: zod_1.z.array(zod_1.z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
        uploadPath: zod_1.z.string().default('./uploads'),
    }),
    // Email
    email: zod_1.z.object({
        host: zod_1.z.string().optional(),
        port: zod_1.z.number().optional(),
        secure: zod_1.z.boolean().default(false),
        user: zod_1.z.string().optional(),
        pass: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
    }),
    // Payment Gateways
    stripe: zod_1.z.object({
        secretKey: zod_1.z.string().optional(),
        publishableKey: zod_1.z.string().optional(),
        webhookSecret: zod_1.z.string().optional(),
    }),
    // AWS S3
    aws: zod_1.z.object({
        accessKeyId: zod_1.z.string().optional(),
        secretAccessKey: zod_1.z.string().optional(),
        region: zod_1.z.string().default('us-east-1'),
        s3Bucket: zod_1.z.string().optional(),
    }),
    // Logging
    log: zod_1.z.object({
        level: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
        file: zod_1.z.string().default('logs/app.log'),
    }),
    // Performance
    performance: zod_1.z.object({
        enableCompression: zod_1.z.boolean().default(true),
        compressionLevel: zod_1.z.number().min(-1).max(9).default(6),
        enableCaching: zod_1.z.boolean().default(true),
        cacheDefaultTTL: zod_1.z.number().default(3600), // 1 hour
        enableResponseTime: zod_1.z.boolean().default(true),
        enableStaticServing: zod_1.z.boolean().default(true),
        staticMaxAge: zod_1.z.number().default(86400000), // 1 day in ms
    }),
    // Database Performance
    database: zod_1.z.object({
        poolMin: zod_1.z.number().default(2),
        poolMax: zod_1.z.number().default(10),
        poolIdleTimeout: zod_1.z.number().default(10000),
        queryTimeout: zod_1.z.number().default(30000),
        statementTimeout: zod_1.z.number().default(30000),
        enableQueryLogging: zod_1.z.boolean().default(false),
    }),
    // CDN Configuration
    cdn: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        url: zod_1.z.string().optional(),
        assets: zod_1.z.array(zod_1.z.string()).default(['images', 'videos', 'documents']),
    }),
    // Monitoring
    monitoring: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        metricsPort: zod_1.z.number().default(9090),
        healthCheckPath: zod_1.z.string().default('/health'),
        readinessCheckPath: zod_1.z.string().default('/ready'),
        enablePerformanceMetrics: zod_1.z.boolean().default(true),
        enableRequestTracking: zod_1.z.boolean().default(true),
        errorReportingUrl: zod_1.z.string().optional(),
    }),
    // Security Headers
    security: zod_1.z.object({
        enableHelmet: zod_1.z.boolean().default(true),
        enableCsrf: zod_1.z.boolean().default(true),
        enableHsts: zod_1.z.boolean().default(true),
        enableXssProtection: zod_1.z.boolean().default(true),
        enableContentTypeNoSniff: zod_1.z.boolean().default(true),
        enableFrameGuard: zod_1.z.boolean().default(true),
        encryptionKey: zod_1.z.string(),
        jwtSecret: zod_1.z.string(),
        trustedIPs: zod_1.z.array(zod_1.z.string()).default([]),
        cspDirectives: zod_1.z.object({
            defaultSrc: zod_1.z.array(zod_1.z.string()).default(['\'self\'']),
            scriptSrc: zod_1.z.array(zod_1.z.string()).default(['\'self\'']),
            styleSrc: zod_1.z.array(zod_1.z.string()).default(['\'self\'', '\'unsafe-inline\'']),
            imgSrc: zod_1.z.array(zod_1.z.string()).default(['\'self\'', 'data:', 'https:']),
        }),
    }),
    // API Versioning
    api: zod_1.z.object({
        enableVersioning: zod_1.z.boolean().default(true),
        defaultVersion: zod_1.z.string().default('v1'),
        supportedVersions: zod_1.z.array(zod_1.z.string()).default(['v1', 'v2']),
        deprecationNoticeVersions: zod_1.z.array(zod_1.z.string()).default([]),
    }),
});
const rawConfig = {
    port: Number(process.env['PORT']) || 3000,
    nodeEnv: process.env['NODE_ENV'] || 'development',
    databaseUrl: process.env['DATABASE_URL'] || 'postgresql://localhost:5432/commerce',
    redis: {
        enabled: process.env['REDIS_ENABLED'] === 'true',
        url: process.env['REDIS_URL'],
        host: process.env['REDIS_HOST'] || 'localhost',
        port: Number(process.env['REDIS_PORT']) || 6379,
        password: process.env['REDIS_PASSWORD'],
        db: Number(process.env['REDIS_DB']) || 0,
        retryDelayOnFailover: Number(process.env['REDIS_RETRY_DELAY']) || 100,
        maxRetriesPerRequest: Number(process.env['REDIS_MAX_RETRIES']) || 3,
    },
    jwt: {
        secret: process.env['JWT_SECRET'] || 'your-jwt-secret-key',
        expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
        refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
        refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '30d',
    },
    bcryptRounds: Number(process.env['BCRYPT_ROUNDS']) || 12,
    rateLimit: {
        windowMs: Number(process.env['RATE_LIMIT_WINDOW_MS']) || 15 * 60 * 1000,
        max: Number(process.env['RATE_LIMIT_MAX_REQUESTS']) || 100,
        enableAdaptive: process.env['RATE_LIMIT_ADAPTIVE'] !== 'false',
        enableCircuitBreaker: process.env['RATE_LIMIT_CIRCUIT_BREAKER'] !== 'false',
        userTiers: {
            basic: {
                points: Number(process.env['RATE_LIMIT_BASIC_POINTS']) || 100,
                duration: Number(process.env['RATE_LIMIT_BASIC_DURATION']) || 60,
            },
            premium: {
                points: Number(process.env['RATE_LIMIT_PREMIUM_POINTS']) || 500,
                duration: Number(process.env['RATE_LIMIT_PREMIUM_DURATION']) || 60,
            },
            enterprise: {
                points: Number(process.env['RATE_LIMIT_ENTERPRISE_POINTS']) || 2000,
                duration: Number(process.env['RATE_LIMIT_ENTERPRISE_DURATION']) || 60,
            },
        },
    },
    cors: {
        origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
        credentials: process.env['CORS_CREDENTIALS'] === 'true',
    },
    upload: {
        maxFileSize: Number(process.env['MAX_FILE_SIZE']) || 5 * 1024 * 1024,
        allowedTypes: process.env['ALLOWED_FILE_TYPES']?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        uploadPath: process.env['UPLOAD_PATH'] || './uploads',
    },
    email: {
        host: process.env['SMTP_HOST'],
        port: Number(process.env['SMTP_PORT']),
        secure: process.env['SMTP_SECURE'] === 'true',
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
        from: process.env['FROM_EMAIL'],
    },
    stripe: {
        secretKey: process.env['STRIPE_SECRET_KEY'],
        publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'],
        webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'],
    },
    aws: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        region: process.env['AWS_REGION'] || 'us-east-1',
        s3Bucket: process.env['AWS_S3_BUCKET'],
    },
    log: {
        level: process.env['LOG_LEVEL'] || 'info',
        file: process.env['LOG_FILE'] || 'logs/app.log',
    },
    performance: {
        enableCompression: process.env['ENABLE_COMPRESSION'] !== 'false',
        compressionLevel: Number(process.env['COMPRESSION_LEVEL']) || 6,
        enableCaching: process.env['ENABLE_CACHING'] !== 'false',
        cacheDefaultTTL: Number(process.env['CACHE_DEFAULT_TTL']) || 3600,
        enableResponseTime: process.env['ENABLE_RESPONSE_TIME'] !== 'false',
        enableStaticServing: process.env['ENABLE_STATIC_SERVING'] !== 'false',
        staticMaxAge: Number(process.env['STATIC_MAX_AGE']) || 86400000,
    },
    database: {
        poolMin: Number(process.env['DB_POOL_MIN']) || 2,
        poolMax: Number(process.env['DB_POOL_MAX']) || 10,
        poolIdleTimeout: Number(process.env['DB_POOL_IDLE_TIMEOUT']) || 10000,
        queryTimeout: Number(process.env['DB_QUERY_TIMEOUT']) || 30000,
        statementTimeout: Number(process.env['DB_STATEMENT_TIMEOUT']) || 30000,
        enableQueryLogging: process.env['DB_ENABLE_QUERY_LOGGING'] === 'true',
    },
    cdn: {
        enabled: process.env['CDN_ENABLED'] === 'true',
        url: process.env['CDN_URL'],
        assets: process.env['CDN_ASSETS']?.split(',') || ['images', 'videos', 'documents'],
    },
    monitoring: {
        enabled: process.env['MONITORING_ENABLED'] !== 'false',
        metricsPort: Number(process.env['METRICS_PORT']) || 9090,
        healthCheckPath: process.env['HEALTH_CHECK_PATH'] || '/health',
        readinessCheckPath: process.env['READINESS_CHECK_PATH'] || '/ready',
        enablePerformanceMetrics: process.env['MONITORING_PERFORMANCE'] !== 'false',
        enableRequestTracking: process.env['MONITORING_REQUEST_TRACKING'] !== 'false',
        errorReportingUrl: process.env['ERROR_REPORTING_URL'],
    },
    security: {
        enableHelmet: process.env['SECURITY_HELMET'] !== 'false',
        enableCsrf: process.env['SECURITY_CSRF'] !== 'false',
        enableHsts: process.env['SECURITY_HSTS'] !== 'false',
        enableXssProtection: process.env['SECURITY_XSS'] !== 'false',
        enableContentTypeNoSniff: process.env['SECURITY_CONTENT_TYPE'] !== 'false',
        enableFrameGuard: process.env['SECURITY_FRAME_GUARD'] !== 'false',
        encryptionKey: process.env['ENCRYPTION_KEY'] || 'your-32-byte-encryption-key-here-change-this',
        jwtSecret: process.env['JWT_SECRET'] || 'your-jwt-secret-key',
        trustedIPs: process.env['TRUSTED_IPS']?.split(',') || [],
        cspDirectives: {
            defaultSrc: process.env['CSP_DEFAULT_SRC']?.split(',') || ['\'self\''],
            scriptSrc: process.env['CSP_SCRIPT_SRC']?.split(',') || ['\'self\''],
            styleSrc: process.env['CSP_STYLE_SRC']?.split(',') || ['\'self\'', '\'unsafe-inline\''],
            imgSrc: process.env['CSP_IMG_SRC']?.split(',') || ['\'self\'', 'data:', 'https:'],
        },
    },
    api: {
        enableVersioning: process.env['API_VERSIONING'] !== 'false',
        defaultVersion: process.env['API_DEFAULT_VERSION'] || 'v1',
        supportedVersions: process.env['API_SUPPORTED_VERSIONS']?.split(',') || ['v1', 'v2'],
        deprecationNoticeVersions: process.env['API_DEPRECATED_VERSIONS']?.split(',') || [],
    },
};
exports.config = configSchema.parse(rawConfig);
//# sourceMappingURL=config.js.map