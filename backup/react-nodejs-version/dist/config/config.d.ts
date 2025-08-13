export declare const config: {
    port: number;
    nodeEnv: "development" | "production" | "test";
    databaseUrl: string;
    redis: {
        port: number;
        enabled: boolean;
        host: string;
        db: number;
        retryDelayOnFailover: number;
        maxRetriesPerRequest: number;
        url?: string | undefined;
        password?: string | undefined;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    bcryptRounds: number;
    rateLimit: {
        windowMs: number;
        max: number;
        enableAdaptive: boolean;
        enableCircuitBreaker: boolean;
        userTiers: {
            basic: {
                points: number;
                duration: number;
            };
            premium: {
                points: number;
                duration: number;
            };
            enterprise: {
                points: number;
                duration: number;
            };
        };
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
        uploadPath: string;
    };
    email: {
        secure: boolean;
        port?: number | undefined;
        host?: string | undefined;
        user?: string | undefined;
        pass?: string | undefined;
        from?: string | undefined;
    };
    stripe: {
        secretKey?: string | undefined;
        publishableKey?: string | undefined;
        webhookSecret?: string | undefined;
    };
    aws: {
        region: string;
        accessKeyId?: string | undefined;
        secretAccessKey?: string | undefined;
        s3Bucket?: string | undefined;
    };
    log: {
        level: "error" | "warn" | "info" | "debug";
        file: string;
    };
    performance: {
        enableCompression: boolean;
        compressionLevel: number;
        enableCaching: boolean;
        cacheDefaultTTL: number;
        enableResponseTime: boolean;
        enableStaticServing: boolean;
        staticMaxAge: number;
    };
    database: {
        poolMin: number;
        poolMax: number;
        poolIdleTimeout: number;
        queryTimeout: number;
        statementTimeout: number;
        enableQueryLogging: boolean;
    };
    cdn: {
        enabled: boolean;
        assets: string[];
        url?: string | undefined;
    };
    monitoring: {
        enabled: boolean;
        metricsPort: number;
        healthCheckPath: string;
        readinessCheckPath: string;
        enablePerformanceMetrics: boolean;
        enableRequestTracking: boolean;
        errorReportingUrl?: string | undefined;
    };
    security: {
        enableHelmet: boolean;
        enableCsrf: boolean;
        enableHsts: boolean;
        enableXssProtection: boolean;
        enableContentTypeNoSniff: boolean;
        enableFrameGuard: boolean;
        encryptionKey: string;
        jwtSecret: string;
        trustedIPs: string[];
        cspDirectives: {
            defaultSrc: string[];
            scriptSrc: string[];
            styleSrc: string[];
            imgSrc: string[];
        };
    };
    api: {
        enableVersioning: boolean;
        defaultVersion: string;
        supportedVersions: string[];
        deprecationNoticeVersions: string[];
    };
};
//# sourceMappingURL=config.d.ts.map