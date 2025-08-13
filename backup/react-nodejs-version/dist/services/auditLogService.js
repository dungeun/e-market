"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogService = exports.AuditLogService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const security_1 = require("../utils/security");
/**
 * Security Audit Log Service
 * Tracks all security-relevant events for compliance and forensics
 */
class AuditLogService {
    /**
     * Log authentication events
     */
    async logAuthEvent(action, userId, req, metadata) {
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    userId: userId || 'anonymous',
                    action: `AUTH_${action}`,
                    entityType: 'user',
                    entityId: userId || undefined,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    metadata: {
                        ...metadata,
                        timestamp: new Date(),
                        sessionId: req.session?.id,
                    },
                    createdAt: new Date(),
                },
            });
            // Alert on suspicious auth patterns
            if (action === 'LOGIN_FAILED') {
                await this.checkFailedLoginPatterns(req.ip || 'unknown');
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log auth event', { error, action, userId });
        }
    }
    /**
     * Log data access events
     */
    async logDataAccess(action, entityType, entityId, userId, req, metadata) {
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    userId,
                    action: `DATA_${action}`,
                    entityType,
                    entityId,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    metadata: {
                        ...metadata,
                        timestamp: new Date(),
                        dataClassification: await this.classifyData(entityType, entityId),
                    },
                    createdAt: new Date(),
                },
            });
            // Check for data exfiltration patterns
            await this.checkDataExfiltration(userId, entityType);
        }
        catch (error) {
            logger_1.logger.error('Failed to log data access', { error, action, entityType, entityId });
        }
    }
    /**
     * Log security events
     */
    async logSecurityEvent(action, userId, req, metadata) {
        try {
            const severity = this.getSecurityEventSeverity(action);
            await database_1.prisma.auditLog.create({
                data: {
                    userId: userId || 'anonymous',
                    action: `SECURITY_${action}`,
                    entityType: 'security',
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    metadata: {
                        ...metadata,
                        severity,
                        timestamp: new Date(),
                    },
                    createdAt: new Date(),
                },
            });
            // Create security alert for high severity events
            if (severity === 'HIGH' || severity === 'CRITICAL') {
                await this.createSecurityAlert(action, userId, req, metadata);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log security event', { error, action });
        }
    }
    /**
     * Log payment events
     */
    async logPaymentEvent(action, paymentId, userId, req, metadata) {
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    userId,
                    action: `PAYMENT_${action}`,
                    entityType: 'payment',
                    entityId: paymentId,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    metadata: {
                        ...metadata,
                        timestamp: new Date(),
                        amount: metadata?.amount,
                        currency: metadata?.currency,
                        gateway: metadata?.gateway,
                        maskedCardNumber: metadata?.cardNumber ? security_1.SecurityUtils.maskCardNumber(metadata.cardNumber) : undefined,
                    },
                    createdAt: new Date(),
                },
            });
            // Monitor payment patterns
            if (action === 'FRAUD_CHECK' && metadata?.riskScore > 50) {
                await this.createSecurityAlert('HIGH_RISK_PAYMENT', userId, req, metadata);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log payment event', { error, action, paymentId });
        }
    }
    /**
     * Log administrative actions
     */
    async logAdminAction(action, targetType, targetId, adminId, req, metadata) {
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: `ADMIN_${action}`,
                    entityType: targetType,
                    entityId: targetId,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    metadata: {
                        ...metadata,
                        timestamp: new Date(),
                        adminRole: req.user?.role,
                    },
                    createdAt: new Date(),
                },
            });
            // Alert on sensitive admin actions
            const sensitiveActions = ['USER_DELETE', 'PERMISSION_GRANT', 'DATA_EXPORT', 'SYSTEM_CONFIG_CHANGE'];
            if (sensitiveActions.includes(action)) {
                await this.createSecurityAlert('SENSITIVE_ADMIN_ACTION', adminId, req, { action, targetType, targetId });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log admin action', { error, action, targetType });
        }
    }
    /**
     * Log API access
     */
    async logAPIAccess(req, res, responseTime, error) {
        try {
            const userId = req.user?.id ||
                req.apiClient?.id ||
                'anonymous';
            await database_1.prisma.auditLog.create({
                data: {
                    userId,
                    action: 'API_ACCESS',
                    entityType: 'api',
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.headers['user-agent'] || 'unknown',
                    method: req.method,
                    path: req.originalUrl,
                    statusCode: res.statusCode,
                    metadata: {
                        responseTime,
                        error: error ? security_1.SecurityUtils.redactSensitiveData(error) : undefined,
                        requestSize: req.headers['content-length'],
                        responseSize: res.get('content-length'),
                        apiVersion: req.headers['api-version'],
                        timestamp: new Date(),
                    },
                    createdAt: new Date(),
                },
            });
            // Monitor API abuse patterns
            if (responseTime > 5000 || res.statusCode >= 500) {
                await this.checkAPIAbusePatterns(userId, req);
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to log API access', { error });
        }
    }
    /**
     * Check failed login patterns
     */
    async checkFailedLoginPatterns(ipAddress) {
        const recentFailures = await database_1.prisma.auditLog.count({
            where: {
                action: 'AUTH_LOGIN_FAILED',
                ipAddress,
                createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
            },
        });
        if (recentFailures >= 5) {
            logger_1.logger.warn('Multiple failed login attempts detected', { ipAddress, count: recentFailures });
            // Auto-blacklist IP after 10 failures
            if (recentFailures >= 10) {
                await database_1.prisma.blacklist.create({
                    data: {
                        type: 'IP',
                        value: ipAddress,
                        reason: 'Multiple failed login attempts',
                        isActive: true,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    },
                });
            }
        }
    }
    /**
     * Check data exfiltration patterns
     */
    async checkDataExfiltration(userId, entityType) {
        const recentExports = await database_1.prisma.auditLog.count({
            where: {
                userId,
                action: { in: ['DATA_EXPORT', 'DATA_DOWNLOAD'] },
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
            },
        });
        if (recentExports > 50) {
            logger_1.logger.warn('Potential data exfiltration detected', { userId, exports: recentExports });
            await database_1.prisma.securityAlert.create({
                data: {
                    userId,
                    alertType: 'DATA_EXFILTRATION_SUSPECTED',
                    severity: 'HIGH',
                    metadata: {
                        exportCount: recentExports,
                        entityType,
                        timeWindow: '1_hour',
                    },
                    createdAt: new Date(),
                },
            });
        }
    }
    /**
     * Check API abuse patterns
     */
    async checkAPIAbusePatterns(userId, _req) {
        const recentRequests = await database_1.prisma.auditLog.findMany({
            where: {
                userId,
                action: 'API_ACCESS',
                createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
            },
            select: {
                statusCode: true,
                metadata: true,
            },
        });
        const errorRate = recentRequests.filter(r => (r.statusCode || 0) >= 400).length / recentRequests.length;
        const avgResponseTime = recentRequests.reduce((sum, r) => sum + (r.metadata?.responseTime || 0), 0) / recentRequests.length;
        if (errorRate > 0.5 || avgResponseTime > 3000) {
            logger_1.logger.warn('API abuse pattern detected', {
                userId,
                errorRate,
                avgResponseTime,
                requestCount: recentRequests.length,
            });
        }
    }
    /**
     * Get security event severity
     */
    getSecurityEventSeverity(action) {
        const severityMap = {
            'RATE_LIMIT_EXCEEDED': 'MEDIUM',
            'CSRF_VIOLATION': 'HIGH',
            'SUSPICIOUS_ACTIVITY': 'HIGH',
            'BLACKLIST_HIT': 'HIGH',
            'ENCRYPTION_FAILURE': 'CRITICAL',
        };
        return severityMap[action] || 'MEDIUM';
    }
    /**
     * Create security alert
     */
    async createSecurityAlert(alertType, userId, req, metadata) {
        await database_1.prisma.securityAlert.create({
            data: {
                userId: userId || 'system',
                alertType,
                severity: this.getSecurityEventSeverity(alertType),
                metadata: {
                    ...metadata,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    timestamp: new Date(),
                },
                createdAt: new Date(),
            },
        });
        // Send notifications for critical alerts
        if (this.getSecurityEventSeverity(alertType) === 'CRITICAL') {
            logger_1.logger.error('CRITICAL SECURITY ALERT', { alertType, userId, metadata });
            // In production, send email/SMS alerts to security team
        }
    }
    /**
     * Classify data sensitivity
     */
    async classifyData(entityType, _entityId) {
        const sensitiveTypes = {
            'payment': 'HIGHLY_SENSITIVE',
            'paymentMethod': 'HIGHLY_SENSITIVE',
            'user': 'SENSITIVE',
            'order': 'SENSITIVE',
            'address': 'SENSITIVE',
            'product': 'PUBLIC',
            'category': 'PUBLIC',
        };
        return sensitiveTypes[entityType] || 'INTERNAL';
    }
    /**
     * Generate compliance report
     */
    async generateComplianceReport(startDate, endDate, reportType) {
        try {
            const baseQuery = {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            };
            const report = {
                reportType,
                period: { startDate, endDate },
                generatedAt: new Date(),
            };
            switch (reportType) {
                case 'PCI_DSS':
                    report.paymentAccess = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: { startsWith: 'PAYMENT_' },
                        },
                    });
                    report.encryptionFailures = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: 'SECURITY_ENCRYPTION_FAILURE',
                        },
                    });
                    report.unauthorizedAccess = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: { in: ['AUTH_LOGIN_FAILED', 'SECURITY_BLACKLIST_HIT'] },
                        },
                    });
                    break;
                case 'GDPR':
                    report.dataExports = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: 'USER_DATA_EXPORTED',
                        },
                    });
                    report.dataAnonymizations = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: 'USER_ANONYMIZED',
                        },
                    });
                    report.consentUpdates = await database_1.prisma.auditLog.count({
                        where: {
                            ...baseQuery,
                            action: 'CONSENT_UPDATED',
                        },
                    });
                    break;
                case 'SECURITY': {
                    const securityEvents = await database_1.prisma.auditLog.groupBy({
                        by: ['action'],
                        where: {
                            ...baseQuery,
                            action: { startsWith: 'SECURITY_' },
                        },
                        _count: true,
                    });
                    report.securityEvents = securityEvents;
                    report.totalAlerts = await database_1.prisma.securityAlert.count({
                        where: baseQuery,
                    });
                    report.criticalAlerts = await database_1.prisma.securityAlert.count({
                        where: {
                            ...baseQuery,
                            severity: 'CRITICAL',
                        },
                    });
                    break;
                }
            }
            return report;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate compliance report', { error, reportType });
            throw error;
        }
    }
    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(retentionDays = 90) {
        try {
            const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            // Archive logs before deletion (in production, export to cold storage)
            const logsToDelete = await database_1.prisma.auditLog.count({
                where: {
                    createdAt: { lt: cutoffDate },
                },
            });
            if (logsToDelete > 0) {
                logger_1.logger.info(`Archiving ${logsToDelete} audit logs older than ${retentionDays} days`);
                // Delete old logs
                const result = await database_1.prisma.auditLog.deleteMany({
                    where: {
                        createdAt: { lt: cutoffDate },
                    },
                });
                return result.count;
            }
            return 0;
        }
        catch (error) {
            logger_1.logger.error('Failed to cleanup old audit logs', error);
            throw error;
        }
    }
    /**
     * Search audit logs
     */
    async searchLogs(criteria) {
        try {
            const where = {};
            if (criteria.userId)
                where.userId = criteria.userId;
            if (criteria.action)
                where.action = { contains: criteria.action };
            if (criteria.entityType)
                where.entityType = criteria.entityType;
            if (criteria.entityId)
                where.entityId = criteria.entityId;
            if (criteria.ipAddress)
                where.ipAddress = criteria.ipAddress;
            if (criteria.startDate || criteria.endDate) {
                where.createdAt = {};
                if (criteria.startDate)
                    where.createdAt.gte = criteria.startDate;
                if (criteria.endDate)
                    where.createdAt.lte = criteria.endDate;
            }
            return await database_1.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: criteria.limit || 100,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to search audit logs', error);
            throw error;
        }
    }
}
exports.AuditLogService = AuditLogService;
exports.auditLogService = new AuditLogService();
//# sourceMappingURL=auditLogService.js.map