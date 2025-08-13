"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinedSecurityMiddleware = exports.ipSecurityMiddleware = exports.requestSanitizer = exports.corsSecurityMiddleware = exports.additionalSecurityHeaders = exports.csrfProtection = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
/**
 * Security headers middleware with advanced configuration
 */
const securityHeaders = () => {
    return (0, helmet_1.default)({
        // Content Security Policy
        contentSecurityPolicy: config_1.config.security.enableHelmet ? {
            useDefaults: false,
            directives: {
                defaultSrc: config_1.config.security.cspDirectives.defaultSrc,
                scriptSrc: [
                    ...config_1.config.security.cspDirectives.scriptSrc,
                    // Allow webpack dev server in development
                    ...(config_1.config.nodeEnv === 'development' ? ['\'unsafe-eval\''] : []),
                ],
                styleSrc: config_1.config.security.cspDirectives.styleSrc,
                imgSrc: config_1.config.security.cspDirectives.imgSrc,
                connectSrc: ['\'self\'', 'https:'],
                fontSrc: ['\'self\'', 'https:', 'data:'],
                objectSrc: ['\'none\''],
                mediaSrc: ['\'self\''],
                frameSrc: ['\'none\''],
                childSrc: ['\'none\''],
                workerSrc: ['\'self\''],
                manifestSrc: ['\'self\''],
                baseUri: ['\'self\''],
                formAction: ['\'self\''],
                frameAncestors: ['\'none\''],
                upgradeInsecureRequests: config_1.config.nodeEnv === 'production' ? [] : null,
            },
            reportOnly: config_1.config.nodeEnv === 'development',
        } : false,
        // HTTP Strict Transport Security
        hsts: config_1.config.security.enableHsts ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        } : false,
        // X-Frame-Options
        frameguard: config_1.config.security.enableFrameGuard ? {
            action: 'deny',
        } : false,
        // X-Content-Type-Options
        noSniff: config_1.config.security.enableContentTypeNoSniff,
        // X-XSS-Protection
        xssFilter: config_1.config.security.enableXssProtection,
        // Referrer Policy
        referrerPolicy: {
            policy: ['strict-origin-when-cross-origin'],
        },
        // Cross-Origin policies
        crossOriginEmbedderPolicy: false, // Can cause issues with some integrations
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        // Remove X-Powered-By header
        hidePoweredBy: true,
        // Permissions Policy (formerly Feature Policy)
        permittedCrossDomainPolicies: false,
    });
};
exports.securityHeaders = securityHeaders;
/**
 * CSRF Protection middleware
 */
const csrfProtection = () => {
    return (req, res, next) => {
        // Skip CSRF for GET, HEAD, OPTIONS requests
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }
        // Skip CSRF for API requests with valid API key
        if (req.apiClient) {
            return next();
        }
        // Skip CSRF for whitelisted origins
        const origin = req.headers.origin;
        const allowedOrigins = config_1.config.cors.origin.split(',').map(o => o.trim());
        if (origin && allowedOrigins.includes(origin)) {
            return next();
        }
        // Check for CSRF token in header or body
        const csrfToken = req.headers['x-csrf-token'] ||
            req.headers['x-xsrf-token'] ||
            req.body?._csrf ||
            req.query._csrf;
        if (!csrfToken) {
            logger_1.logger.warn('CSRF token missing', {
                ip: req.ip,
                endpoint: req.originalUrl,
                method: req.method,
                userAgent: req.headers['user-agent'],
            });
            return res.status(403).json({
                success: false,
                error: {
                    type: 'CSRFError',
                    message: 'CSRF token missing',
                    code: 'CSRF_TOKEN_MISSING',
                },
            });
        }
        // In a real implementation, you would validate the CSRF token here
        // For now, we'll accept any non-empty token
        if (typeof csrfToken !== 'string' || csrfToken.length < 10) {
            logger_1.logger.warn('Invalid CSRF token', {
                ip: req.ip,
                endpoint: req.originalUrl,
                method: req.method,
                tokenLength: csrfToken?.toString().length || 0,
            });
            return res.status(403).json({
                success: false,
                error: {
                    type: 'CSRFError',
                    message: 'Invalid CSRF token',
                    code: 'CSRF_TOKEN_INVALID',
                },
            });
        }
        next();
    };
};
exports.csrfProtection = csrfProtection;
/**
 * Additional security headers
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevent MIME type confusion attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // XSS protection (legacy but still useful)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions policy
    res.setHeader('Permissions-Policy', [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'magnetometer=()',
        'gyroscope=()',
        'fullscreen=(self)',
        'payment=(self)',
    ].join(', '));
    // Clear site data on logout (when applicable)
    if (req.path === '/api/auth/logout') {
        res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    }
    // Cache control for sensitive pages
    if (req.path.includes('/admin') || req.path.includes('/profile')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    // HPKP (HTTP Public Key Pinning) - be very careful with this in production
    if (config_1.config.nodeEnv === 'production' && process.env.HPKP_ENABLED === 'true') {
        const hpkpHeader = [
            `pin-sha256="${process.env.HPKP_PIN1}"`,
            `pin-sha256="${process.env.HPKP_PIN2}"`,
            'max-age=5184000', // 60 days
            'includeSubDomains',
        ].join('; ');
        res.setHeader('Public-Key-Pins', hpkpHeader);
    }
    // Expect-CT header for Certificate Transparency
    if (config_1.config.nodeEnv === 'production') {
        res.setHeader('Expect-CT', 'max-age=86400, enforce');
    }
    next();
};
exports.additionalSecurityHeaders = additionalSecurityHeaders;
/**
 * CORS preflight handling with security considerations
 */
const corsSecurityMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = config_1.config.cors.origin.split(',').map(o => o.trim());
    // Log suspicious origin requests
    if (origin && !allowedOrigins.includes(origin)) {
        logger_1.logger.warn('Request from unallowed origin', {
            origin,
            ip: req.ip,
            endpoint: req.originalUrl,
            userAgent: req.headers['user-agent'],
        });
    }
    // Set CORS headers for allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-CSRF-Token',
            'X-XSRF-Token',
            'X-API-Key',
        ].join(', '));
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    next();
};
exports.corsSecurityMiddleware = corsSecurityMiddleware;
/**
 * Request sanitization middleware
 */
const requestSanitizer = (req, res, next) => {
    try {
        // Sanitize query parameters
        if (req.query) {
            for (const [key, value] of Object.entries(req.query)) {
                if (typeof value === 'string') {
                    // Basic XSS prevention
                    req.query[key] = value
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=/gi, '');
                }
            }
        }
        // Sanitize body (for form data)
        if (req.body && typeof req.body === 'object') {
            sanitizeObject(req.body);
        }
        // Check for suspicious patterns in URL
        const suspiciousPatterns = [
            /\.\./g, // Directory traversal
            /<script/gi, // Script tags
            /javascript:/gi, // JavaScript protocol
            /vbscript:/gi, // VBScript protocol
            /data:text\/html/gi, // Data URL with HTML
            /%3Cscript/gi, // URL encoded script
            /\bunion\b.*\bselect\b/gi, // SQL injection
            /\bdrop\b.*\btable\b/gi, // SQL injection
        ];
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(req.originalUrl)) {
                logger_1.logger.warn('Suspicious URL pattern detected', {
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    pattern: pattern.source,
                });
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'SecurityError',
                        message: 'Suspicious request pattern detected',
                        code: 'SUSPICIOUS_PATTERN',
                    },
                });
                return;
            }
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Request sanitization failed', error);
        next();
    }
};
exports.requestSanitizer = requestSanitizer;
/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object')
        return;
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            obj[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        else if (typeof value === 'object' && value !== null) {
            sanitizeObject(value);
        }
    }
}
/**
 * IP-based security middleware
 */
const ipSecurityMiddleware = (req, res, next) => {
    const clientIP = req.ip;
    // Block known malicious IPs (this would typically come from a database or external service)
    const blockedIPs = [
    // Add known malicious IPs here
    ];
    if (blockedIPs.includes(clientIP || '')) {
        logger_1.logger.warn('Blocked IP attempted access', {
            ip: clientIP,
            endpoint: req.originalUrl,
            userAgent: req.headers['user-agent'],
        });
        res.status(403).json({
            success: false,
            error: {
                type: 'SecurityError',
                message: 'Access denied',
                code: 'IP_BLOCKED',
            },
        });
        return;
    }
    // Check for proxy headers that might indicate tunneling
    const suspiciousHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-cluster-client-ip',
        'cf-connecting-ip',
    ];
    let proxyCount = 0;
    for (const header of suspiciousHeaders) {
        if (req.headers[header]) {
            proxyCount++;
        }
    }
    // Log if too many proxy headers (might indicate tunneling)
    if (proxyCount > 2) {
        logger_1.logger.warn('Multiple proxy headers detected', {
            ip: clientIP,
            headers: Object.fromEntries(suspiciousHeaders.map(h => [h, req.headers[h]]).filter(([, v]) => v)),
            endpoint: req.originalUrl,
        });
    }
    next();
};
exports.ipSecurityMiddleware = ipSecurityMiddleware;
/**
 * Combined security middleware
 */
exports.combinedSecurityMiddleware = [
    exports.corsSecurityMiddleware,
    (0, exports.securityHeaders)(),
    exports.additionalSecurityHeaders,
    exports.requestSanitizer,
    exports.ipSecurityMiddleware,
    ...(config_1.config.security.enableCsrf ? [(0, exports.csrfProtection)()] : []),
];
//# sourceMappingURL=securityHeaders.js.map