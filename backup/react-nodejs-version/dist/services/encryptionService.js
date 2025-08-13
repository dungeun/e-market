"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionService = exports.EncryptionService = void 0;
const security_1 = require("../utils/security");
const logger_1 = require("../utils/logger");
const database_1 = require("../utils/database");
/**
 * Service for handling sensitive data encryption (PCI DSS & GDPR compliance)
 */
class EncryptionService {
    /**
     * Encrypt payment method data before storing
     */
    async encryptPaymentMethod(data) {
        const encryptedData = {};
        const maskedData = {};
        try {
            // Never store CVV (PCI DSS requirement)
            if (data.cvv) {
                logger_1.logger.warn('Attempted to store CVV - this is not allowed');
                delete data.cvv;
            }
            // Encrypt card number
            if (data.cardNumber) {
                encryptedData.cardNumber = security_1.SecurityUtils.encrypt(data.cardNumber);
                maskedData.cardNumber = security_1.SecurityUtils.maskCardNumber(data.cardNumber);
                maskedData.last4 = data.cardNumber.slice(-4);
            }
            // Encrypt bank account details
            if (data.accountNumber) {
                encryptedData.accountNumber = security_1.SecurityUtils.encrypt(data.accountNumber);
                maskedData.accountNumber = '*'.repeat(data.accountNumber.length - 4) +
                    data.accountNumber.slice(-4);
            }
            if (data.routingNumber) {
                encryptedData.routingNumber = security_1.SecurityUtils.encrypt(data.routingNumber);
                maskedData.routingNumber = '*'.repeat(data.routingNumber.length);
            }
            return { encryptedData, maskedData };
        }
        catch (error) {
            logger_1.logger.error('Failed to encrypt payment method', error);
            throw new Error('Encryption failed');
        }
    }
    /**
     * Decrypt payment method data
     */
    async decryptPaymentMethod(encryptedData) {
        const decryptedData = {};
        try {
            for (const [key, value] of Object.entries(encryptedData)) {
                if (value && typeof value === 'string') {
                    decryptedData[key] = security_1.SecurityUtils.decrypt(value);
                }
            }
            return decryptedData;
        }
        catch (error) {
            logger_1.logger.error('Failed to decrypt payment method', error);
            throw new Error('Decryption failed');
        }
    }
    /**
     * Encrypt personal data (GDPR requirement)
     */
    async encryptPersonalData(data) {
        const encryptedData = {};
        try {
            for (const [key, value] of Object.entries(data)) {
                if (value && typeof value === 'string') {
                    encryptedData[key] = security_1.SecurityUtils.encrypt(value);
                }
            }
            return encryptedData;
        }
        catch (error) {
            logger_1.logger.error('Failed to encrypt personal data', error);
            throw new Error('Encryption failed');
        }
    }
    /**
     * Encrypt sensitive order data
     */
    async encryptOrderData(orderId) {
        try {
            const order = await database_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: true,
                    shippingAddress: true,
                    billingAddress: true,
                },
            });
            if (!order) {
                throw new Error('Order not found');
            }
            // Encrypt customer information
            const updates = {};
            if (order.customerEmail) {
                updates.customerEmail = security_1.SecurityUtils.encrypt(order.customerEmail);
            }
            if (order.customerPhone) {
                updates.customerPhone = security_1.SecurityUtils.encrypt(order.customerPhone);
            }
            // Update order with encrypted data
            await database_1.prisma.order.update({
                where: { id: orderId },
                data: updates,
            });
            logger_1.logger.info(`Order ${orderId} data encrypted`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to encrypt order ${orderId}`, error);
            throw error;
        }
    }
    /**
     * Anonymize user data (GDPR right to be forgotten)
     */
    async anonymizeUserData(userId) {
        try {
            // Start transaction
            await database_1.prisma.$transaction(async (tx) => {
                // Anonymize user data
                const anonymizedEmail = `deleted_${Date.now()}@anonymized.com`;
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        email: anonymizedEmail,
                        firstName: 'DELETED',
                        lastName: 'USER',
                        phone: null,
                        password: security_1.SecurityUtils.generateSecureToken(),
                        isActive: false,
                        deletedAt: new Date(),
                    },
                });
                // Anonymize addresses
                await tx.address.updateMany({
                    where: { userId },
                    data: {
                        firstName: 'DELETED',
                        lastName: 'USER',
                        company: null,
                        addressLine1: 'DELETED',
                        addressLine2: null,
                        city: 'DELETED',
                        state: 'DELETED',
                        postalCode: '00000',
                        phone: null,
                    },
                });
                // Anonymize orders
                await tx.order.updateMany({
                    where: { userId },
                    data: {
                        customerEmail: anonymizedEmail,
                        customerFirstName: 'DELETED',
                        customerLastName: 'USER',
                        customerPhone: null,
                        notes: null,
                    },
                });
                // Delete payment methods
                await tx.paymentMethod.deleteMany({
                    where: { userId },
                });
                // Delete sessions
                await tx.session.deleteMany({
                    where: { userId },
                });
                // Create audit log
                await tx.auditLog.create({
                    data: {
                        userId: 'system',
                        action: 'USER_ANONYMIZED',
                        entityType: 'user',
                        entityId: userId,
                        metadata: {
                            anonymizedAt: new Date(),
                            reason: 'GDPR right to be forgotten',
                        },
                    },
                });
            });
            logger_1.logger.info(`User ${userId} data anonymized`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to anonymize user ${userId}`, error);
            throw error;
        }
    }
    /**
     * Export user data (GDPR right to data portability)
     */
    async exportUserData(userId) {
        try {
            const userData = await database_1.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    addresses: true,
                    orders: {
                        include: {
                            items: true,
                            payments: {
                                select: {
                                    id: true,
                                    amount: true,
                                    currency: true,
                                    status: true,
                                    method: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                    carts: {
                        include: {
                            items: true,
                        },
                    },
                    reviews: true,
                    wishlistItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!userData) {
                throw new Error('User not found');
            }
            // Remove sensitive data
            const exportData = {
                ...userData,
                password: undefined,
                paymentMethods: undefined,
            };
            // Create audit log
            await database_1.prisma.auditLog.create({
                data: {
                    userId,
                    action: 'USER_DATA_EXPORTED',
                    entityType: 'user',
                    entityId: userId,
                    metadata: {
                        exportedAt: new Date(),
                        reason: 'GDPR data portability request',
                    },
                },
            });
            logger_1.logger.info(`User ${userId} data exported`);
            return exportData;
        }
        catch (error) {
            logger_1.logger.error(`Failed to export user ${userId} data`, error);
            throw error;
        }
    }
    /**
     * Check if data needs re-encryption (key rotation)
     */
    async checkReencryptionNeeded(_encryptedData, encryptionVersion) {
        const currentVersion = '1.0';
        return encryptionVersion !== currentVersion;
    }
    /**
     * Re-encrypt data with new key (key rotation)
     */
    async reencryptData(oldEncryptedData, oldKeyVersion) {
        try {
            // This would decrypt with old key and encrypt with new key
            // For now, we'll just return the same data
            // In production, implement proper key rotation
            logger_1.logger.info('Data re-encryption requested', { oldKeyVersion });
            return oldEncryptedData;
        }
        catch (error) {
            logger_1.logger.error('Failed to re-encrypt data', error);
            throw error;
        }
    }
    /**
     * Encrypt file/document
     */
    async encryptFile(buffer, metadata) {
        try {
            // Encrypt file contents
            const encryptedContent = security_1.SecurityUtils.encrypt(buffer.toString('base64'));
            const encryptedBuffer = Buffer.from(encryptedContent);
            // Encrypt metadata
            const encryptedMetadata = security_1.SecurityUtils.encrypt(JSON.stringify(metadata));
            return {
                encryptedBuffer,
                encryptedMetadata,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to encrypt file', error);
            throw error;
        }
    }
    /**
     * Generate data retention report
     */
    async generateDataRetentionReport() {
        try {
            const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds
            const cutoffDate = new Date(Date.now() - retentionPeriod);
            const [totalUsers, activeUsers, inactiveUsers, dataToBeDeleted, oldestOrder,] = await Promise.all([
                database_1.prisma.user.count(),
                database_1.prisma.user.count({ where: { isActive: true } }),
                database_1.prisma.user.count({ where: { isActive: false } }),
                database_1.prisma.order.count({ where: { createdAt: { lt: cutoffDate } } }),
                database_1.prisma.order.findFirst({ orderBy: { createdAt: 'asc' } }),
            ]);
            return {
                totalUsers,
                activeUsers,
                inactiveUsers,
                dataToBeDeleted,
                oldestData: oldestOrder?.createdAt || null,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate data retention report', error);
            throw error;
        }
    }
}
exports.EncryptionService = EncryptionService;
exports.encryptionService = new EncryptionService();
//# sourceMappingURL=encryptionService.js.map