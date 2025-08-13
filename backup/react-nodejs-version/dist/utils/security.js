"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
/**
 * Security utilities for PCI DSS and GDPR compliance
 */
class SecurityUtils {
    /**
     * Encrypt sensitive data (PCI DSS requirement)
     */
    static encrypt(text) {
        const key = Buffer.from(config_1.config.security.encryptionKey, 'hex');
        const iv = crypto_1.default.randomBytes(this.IV_LENGTH);
        const cipher = crypto_1.default.createCipheriv(this.ENCRYPTION_ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Combine iv + authTag + encrypted
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }
    /**
     * Decrypt sensitive data
     */
    static decrypt(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            const key = Buffer.from(config_1.config.security.encryptionKey, 'hex');
            const decipher = crypto_1.default.createDecipheriv(this.ENCRYPTION_ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error('Failed to decrypt data');
        }
    }
    /**
     * Hash password using bcrypt
     */
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    /**
     * Verify password against hash
     */
    static async verifyPassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Generate secure random token
     */
    static generateSecureToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    /**
     * Generate JWT token
     */
    static generateJWT(payload, expiresIn = '1h') {
        const options = {
            algorithm: 'HS256',
            issuer: 'commerce-plugin',
        };
        if (expiresIn) {
            // Handle string/number union type for expiresIn
            if (typeof expiresIn === 'string') {
                options.expiresIn = expiresIn;
            }
            else {
                options.expiresIn = Number(expiresIn);
            }
        }
        return jsonwebtoken_1.default.sign(payload, config_1.config.security.jwtSecret, options);
    }
    /**
     * Verify JWT token
     */
    static verifyJWT(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.config.security.jwtSecret, {
                algorithms: ['HS256'],
                issuer: 'commerce-plugin',
            });
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    /**
     * Mask sensitive data (PCI DSS - show only last 4 digits)
     */
    static maskCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\D/g, '');
        const last4 = cleaned.slice(-4);
        const masked = cleaned.slice(0, -4).replace(/\d/g, '*');
        return masked + last4;
    }
    /**
     * Mask email for privacy (GDPR)
     */
    static maskEmail(email) {
        const [localPart, domain] = email.split('@');
        const maskedLocal = localPart.charAt(0) +
            localPart.slice(1, -1).replace(/./g, '*') +
            localPart.slice(-1);
        return `${maskedLocal}@${domain}`;
    }
    /**
     * Anonymize personal data (GDPR right to be forgotten)
     */
    static anonymizeData(data) {
        const anonymized = { ...data };
        // Anonymize personal fields
        const personalFields = [
            'email', 'firstName', 'lastName', 'phone',
            'addressLine1', 'addressLine2', 'city', 'state', 'postalCode',
        ];
        personalFields.forEach(field => {
            if (anonymized[field]) {
                anonymized[field] = 'ANONYMIZED';
            }
        });
        // Hash any IDs for tracking while maintaining anonymity
        if (anonymized.id) {
            anonymized.anonymizedId = crypto_1.default
                .createHash('sha256')
                .update(anonymized.id)
                .digest('hex');
        }
        return anonymized;
    }
    /**
     * Validate password strength (PCI DSS requirement)
     */
    static validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Sanitize input to prevent injection attacks
     */
    static sanitizeInput(input) {
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes
            .trim();
    }
    /**
     * Generate CSRF token
     */
    static generateCSRFToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    /**
     * Hash data for integrity check
     */
    static hashData(data) {
        return crypto_1.default
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }
    /**
     * Verify data integrity
     */
    static verifyDataIntegrity(data, hash) {
        const computedHash = this.hashData(data);
        return computedHash === hash;
    }
    /**
     * Generate API key
     */
    static generateAPIKey() {
        const prefix = 'sk_';
        const env = config_1.config.nodeEnv === 'production' ? 'live' : 'test';
        const random = crypto_1.default.randomBytes(24).toString('hex');
        return `${prefix}${env}_${random}`;
    }
    /**
     * Validate API key format
     */
    static isValidAPIKey(apiKey) {
        const pattern = /^sk_(test|live)_[a-f0-9]{48}$/;
        return pattern.test(apiKey);
    }
    /**
     * Redact sensitive data from logs
     */
    static redactSensitiveData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const sensitiveFields = [
            'password', 'token', 'apiKey', 'secretKey',
            'cardNumber', 'cvv', 'ssn', 'taxId',
            'authorization', 'x-api-key',
        ];
        const redacted = Array.isArray(data) ? [...data] : { ...data };
        Object.keys(redacted).forEach(key => {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                redacted[key] = '[REDACTED]';
            }
            else if (typeof redacted[key] === 'object') {
                redacted[key] = this.redactSensitiveData(redacted[key]);
            }
        });
        return redacted;
    }
    /**
     * Check if request is from trusted source
     */
    static isTrustedSource(ip, userAgent) {
        // Check against whitelist
        const trustedIPs = config_1.config.security.trustedIPs || [];
        if (trustedIPs.includes(ip)) {
            return true;
        }
        // Check for suspicious user agents
        const suspiciousAgents = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python-requests',
        ];
        const lowerUserAgent = userAgent.toLowerCase();
        return !suspiciousAgents.some(agent => lowerUserAgent.includes(agent));
    }
    /**
     * Rate limit key generator
     */
    static getRateLimitKey(identifier, window = 'minute') {
        const now = new Date();
        let timeWindow;
        switch (window) {
            case 'second':
                timeWindow = `${now.getMinutes()}:${now.getSeconds()}`;
                break;
            case 'minute':
                timeWindow = `${now.getHours()}:${now.getMinutes()}`;
                break;
            case 'hour':
                timeWindow = `${now.getDate()}:${now.getHours()}`;
                break;
            default:
                timeWindow = `${now.getHours()}:${now.getMinutes()}`;
        }
        return `ratelimit:${identifier}:${timeWindow}`;
    }
}
exports.SecurityUtils = SecurityUtils;
SecurityUtils.ENCRYPTION_ALGORITHM = 'aes-256-gcm';
SecurityUtils.IV_LENGTH = 16;
exports.default = SecurityUtils;
//# sourceMappingURL=security.js.map