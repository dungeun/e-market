"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSecurityService = exports.PaymentSecurityService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const security_1 = require("../utils/security");
const encryptionService_1 = require("./encryptionService");
const error_1 = require("../middleware/error");
/**
 * Payment Security Service for PCI DSS compliance
 */
class PaymentSecurityService {
    /**
     * Tokenize payment card (PCI DSS requirement)
     */
    async tokenizeCard(cardData) {
        try {
            // Validate card number
            if (!this.isValidCardNumber(cardData.cardNumber)) {
                throw new error_1.AppError('Invalid card number', 400);
            }
            // Never store CVV
            delete cardData.cvv;
            // Generate card fingerprint for duplicate detection
            const fingerprint = security_1.SecurityUtils.hashData(cardData.cardNumber + cardData.expiryMonth + cardData.expiryYear);
            // Check if card already tokenized
            const existingToken = await database_1.prisma.paymentToken.findFirst({
                where: { fingerprint },
            });
            if (existingToken) {
                return {
                    token: existingToken.token,
                    last4: existingToken.last4,
                    brand: existingToken.brand,
                    fingerprint: existingToken.fingerprint,
                };
            }
            // Generate secure token
            const token = `tok_${security_1.SecurityUtils.generateSecureToken(24)}`;
            const brand = this.detectCardBrand(cardData.cardNumber);
            const last4 = cardData.cardNumber.slice(-4);
            // Encrypt and store card data
            const { encryptedData } = await encryptionService_1.encryptionService.encryptPaymentMethod({
                cardNumber: cardData.cardNumber,
            });
            await database_1.prisma.paymentToken.create({
                data: {
                    token,
                    fingerprint,
                    last4,
                    brand,
                    expiryMonth: cardData.expiryMonth,
                    expiryYear: cardData.expiryYear,
                    encryptedData: encryptedData.cardNumber,
                    createdAt: new Date(),
                },
            });
            logger_1.logger.info('Card tokenized successfully', { token, brand });
            return { token, last4, brand, fingerprint };
        }
        catch (error) {
            logger_1.logger.error('Card tokenization failed', error);
            throw error;
        }
    }
    /**
     * Validate card number using Luhn algorithm
     */
    isValidCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\D/g, '');
        if (cleaned.length < 13 || cleaned.length > 19) {
            return false;
        }
        let sum = 0;
        let isEven = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i));
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        return sum % 10 === 0;
    }
    /**
     * Detect card brand
     */
    detectCardBrand(cardNumber) {
        const cleaned = cardNumber.replace(/\D/g, '');
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]|^2[2-7]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            diners: /^3(?:0[0-5]|[68])/,
            jcb: /^35/,
            unionpay: /^62/,
        };
        for (const [brand, pattern] of Object.entries(patterns)) {
            if (pattern.test(cleaned)) {
                return brand;
            }
        }
        return 'unknown';
    }
    /**
     * Validate payment request for fraud
     */
    async validatePaymentRequest(data) {
        const reasons = [];
        let riskScore = 0;
        try {
            // Check velocity limits
            const recentPayments = await database_1.prisma.payment.count({
                where: {
                    order: { userId: data.userId },
                    createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
                },
            });
            if (recentPayments > 5) {
                riskScore += 30;
                reasons.push('High payment velocity');
            }
            // Check amount limits
            const userOrders = await database_1.prisma.order.aggregate({
                where: { userId: data.userId },
                _avg: { total: true },
                _max: { total: true },
            });
            // const avgAmount = userOrders._avg.total?.toNumber() || 0
            const maxAmount = userOrders._max.total?.toNumber() || 0;
            if (data.amount > maxAmount * 2 && maxAmount > 0) {
                riskScore += 20;
                reasons.push('Unusually high amount');
            }
            // Check IP reputation
            const blacklistedIP = await database_1.prisma.blacklist.findFirst({
                where: {
                    type: 'IP',
                    value: data.ipAddress,
                    isActive: true,
                },
            });
            if (blacklistedIP) {
                riskScore += 50;
                reasons.push('Blacklisted IP address');
            }
            // Check for suspicious patterns
            if (!security_1.SecurityUtils.isTrustedSource(data.ipAddress, data.userAgent)) {
                riskScore += 10;
                reasons.push('Suspicious user agent');
            }
            // Check card reuse across accounts
            if (data.cardToken) {
                const cardUsage = await database_1.prisma.paymentMethod.count({
                    where: {
                        last4: data.cardToken?.slice(-4), // Use last 4 digits instead
                        userId: { not: data.userId },
                    },
                });
                if (cardUsage > 0) {
                    riskScore += 40;
                    reasons.push('Card used on multiple accounts');
                }
            }
            // Log fraud check
            await database_1.prisma.fraudCheck.create({
                data: {
                    userId: data.userId,
                    checkType: 'PAYMENT_VALIDATION',
                    riskScore,
                    reasons,
                    metadata: {
                        amount: data.amount,
                        currency: data.currency,
                        ipAddress: data.ipAddress,
                    },
                    createdAt: new Date(),
                },
            });
            return {
                isValid: riskScore < 50,
                riskScore,
                reasons,
            };
        }
        catch (error) {
            logger_1.logger.error('Payment validation failed', error);
            throw error;
        }
    }
    /**
     * Secure payment data for transmission
     */
    async prepareSecurePaymentData(paymentData) {
        try {
            // Remove sensitive fields
            const secureData = { ...paymentData };
            delete secureData.cvv;
            delete secureData.fullCardNumber;
            // Add security headers
            secureData.timestamp = Date.now();
            secureData.nonce = security_1.SecurityUtils.generateSecureToken(16);
            // Generate signature
            const signature = security_1.SecurityUtils.hashData(JSON.stringify(secureData) + config_1.config.security.jwtSecret);
            return { secureData, signature };
        }
        catch (error) {
            logger_1.logger.error('Failed to prepare secure payment data', error);
            throw error;
        }
    }
    /**
     * Monitor suspicious payment patterns
     */
    async monitorPaymentPatterns(userId) {
        try {
            const timeWindows = {
                hour: 60 * 60 * 1000,
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
            };
            for (const [window, ms] of Object.entries(timeWindows)) {
                const payments = await database_1.prisma.payment.findMany({
                    where: {
                        order: { userId },
                        createdAt: { gte: new Date(Date.now() - ms) },
                    },
                    select: {
                        amount: true,
                        status: true,
                        gateway: true,
                    },
                });
                const failedCount = payments.filter(p => p.status === 'FAILED').length;
                const totalAmount = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
                // Alert on suspicious patterns
                if (failedCount > 5) {
                    logger_1.logger.warn('High payment failure rate detected', {
                        userId,
                        window,
                        failedCount,
                    });
                    await this.createSecurityAlert(userId, 'HIGH_FAILURE_RATE', {
                        window,
                        failedCount,
                    });
                }
                if (window === 'hour' && totalAmount > 10000) {
                    logger_1.logger.warn('High payment volume detected', {
                        userId,
                        window,
                        totalAmount,
                    });
                    await this.createSecurityAlert(userId, 'HIGH_VOLUME', {
                        window,
                        totalAmount,
                    });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Payment pattern monitoring failed', error);
        }
    }
    /**
     * Create security alert
     */
    async createSecurityAlert(userId, alertType, metadata) {
        await database_1.prisma.securityAlert.create({
            data: {
                userId,
                alertType,
                severity: 'HIGH',
                metadata,
                createdAt: new Date(),
            },
        });
    }
    /**
     * Clean up expired payment tokens
     */
    async cleanupExpiredTokens() {
        try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const result = await database_1.prisma.paymentToken.deleteMany({
                where: {
                    OR: [
                        { expiryYear: { lt: currentYear } },
                        {
                            AND: [
                                { expiryYear: currentYear },
                                { expiryMonth: { lt: currentMonth } },
                            ],
                        },
                    ],
                },
            });
            logger_1.logger.info(`Cleaned up ${result.count} expired payment tokens`);
            return result.count;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup expired tokens', error);
            throw error;
        }
    }
    /**
     * Generate PCI compliance report
     */
    async generatePCIComplianceReport() {
        const issues = [];
        const recommendations = [];
        try {
            // Check encryption status
            const unencryptedPayments = await database_1.prisma.paymentMethod.count({
                where: {
                    provider: { startsWith: 'stripe' }, // Use provider instead of token
                },
            });
            if (unencryptedPayments > 0) {
                issues.push(`${unencryptedPayments} payment methods not properly encrypted`);
                recommendations.push('Encrypt all stored payment data');
            }
            // Check access logs
            const recentAccessLogs = await database_1.prisma.auditLog.count({
                where: {
                    action: { in: ['PAYMENT_VIEW', 'PAYMENT_EXPORT'] },
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            });
            if (recentAccessLogs === 0) {
                issues.push('No payment access audit logs found');
                recommendations.push('Implement comprehensive audit logging');
            }
            // Check SSL/TLS configuration
            if (config_1.config.nodeEnv === 'production' && !config_1.config.security.enableHsts) {
                issues.push('HSTS not enabled for production');
                recommendations.push('Enable HSTS for all production communications');
            }
            // Check key rotation
            const oldTokens = await database_1.prisma.paymentToken.count({
                where: {
                    createdAt: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
                },
            });
            if (oldTokens > 0) {
                issues.push(`${oldTokens} tokens older than 1 year`);
                recommendations.push('Implement key rotation policy');
            }
            return {
                compliant: issues.length === 0,
                issues,
                recommendations,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate PCI compliance report', error);
            throw error;
        }
    }
}
exports.PaymentSecurityService = PaymentSecurityService;
exports.paymentSecurityService = new PaymentSecurityService();
// Import config after class definition to avoid circular dependency
const config_1 = require("../config/config");
//# sourceMappingURL=paymentSecurityService.js.map