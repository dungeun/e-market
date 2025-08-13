/**
 * Security utilities for PCI DSS and GDPR compliance
 */
export declare class SecurityUtils {
    private static readonly ENCRYPTION_ALGORITHM;
    private static readonly IV_LENGTH;
    /**
     * Encrypt sensitive data (PCI DSS requirement)
     */
    static encrypt(text: string): string;
    /**
     * Decrypt sensitive data
     */
    static decrypt(encryptedData: string): string;
    /**
     * Hash password using bcrypt
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verify password against hash
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Generate secure random token
     */
    static generateSecureToken(length?: number): string;
    /**
     * Generate JWT token
     */
    static generateJWT(payload: any, expiresIn?: string | number): string;
    /**
     * Verify JWT token
     */
    static verifyJWT(token: string): any;
    /**
     * Mask sensitive data (PCI DSS - show only last 4 digits)
     */
    static maskCardNumber(cardNumber: string): string;
    /**
     * Mask email for privacy (GDPR)
     */
    static maskEmail(email: string): string;
    /**
     * Anonymize personal data (GDPR right to be forgotten)
     */
    static anonymizeData(data: Record<string, any>): Record<string, any>;
    /**
     * Validate password strength (PCI DSS requirement)
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Sanitize input to prevent injection attacks
     */
    static sanitizeInput(input: string): string;
    /**
     * Generate CSRF token
     */
    static generateCSRFToken(): string;
    /**
     * Hash data for integrity check
     */
    static hashData(data: string): string;
    /**
     * Verify data integrity
     */
    static verifyDataIntegrity(data: string, hash: string): boolean;
    /**
     * Generate API key
     */
    static generateAPIKey(): string;
    /**
     * Validate API key format
     */
    static isValidAPIKey(apiKey: string): boolean;
    /**
     * Redact sensitive data from logs
     */
    static redactSensitiveData(data: any): any;
    /**
     * Check if request is from trusted source
     */
    static isTrustedSource(ip: string, userAgent: string): boolean;
    /**
     * Rate limit key generator
     */
    static getRateLimitKey(identifier: string, window?: string): string;
}
export default SecurityUtils;
//# sourceMappingURL=security.d.ts.map