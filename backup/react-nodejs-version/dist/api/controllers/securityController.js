"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const zod_1 = require("zod");
const database_1 = require("../../utils/database");
const auditLogService_1 = require("../../services/auditLogService");
const paymentSecurityService_1 = require("../../services/paymentSecurityService");
const security_1 = require("../../utils/security");
const AuditLogSearchSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    action: zod_1.z.string().optional(),
    entityType: zod_1.z.string().optional(),
    entityId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    ipAddress: zod_1.z.string().optional(),
    limit: zod_1.z.string().transform(Number).optional(),
});
const BlacklistSchema = zod_1.z.object({
    type: zod_1.z.enum(['IP', 'USER_AGENT', 'EMAIL', 'CARD_FINGERPRINT']),
    value: zod_1.z.string(),
    reason: zod_1.z.string(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
const APIKeySchema = zod_1.z.object({
    name: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()),
    expiresAt: zod_1.z.string().datetime().optional(),
});
class SecurityController {
    /**
     * Search audit logs
     */
    async searchAuditLogs(req, res, next) {
        try {
            const query = AuditLogSearchSchema.parse(req.query);
            const criteria = {
                ...query,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                limit: query.limit || 100,
            };
            const logs = await auditLogService_1.auditLogService.searchLogs(criteria);
            // Log this admin action
            await auditLogService_1.auditLogService.logAdminAction('AUDIT_LOG_SEARCH', 'audit_log', 'multiple', req.user.id, req, { criteria });
            res.json({
                success: true,
                data: logs,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export audit logs
     */
    async exportAuditLogs(req, res, next) {
        try {
            const query = AuditLogSearchSchema.parse(req.query);
            const criteria = {
                ...query,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
                limit: 10000, // Higher limit for exports
            };
            const logs = await auditLogService_1.auditLogService.searchLogs(criteria);
            // Log export action
            await auditLogService_1.auditLogService.logAdminAction('AUDIT_LOG_EXPORT', 'audit_log', 'multiple', req.user.id, req, { count: logs.length });
            // Set headers for CSV download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
            // Generate CSV
            const csv = this.generateCSV(logs);
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get security alerts
     */
    async getSecurityAlerts(req, res, next) {
        try {
            const { resolved, severity, userId } = req.query;
            const where = {};
            if (resolved !== undefined)
                where.resolved = resolved === 'true';
            if (severity)
                where.severity = severity;
            if (userId)
                where.userId = userId;
            const alerts = await database_1.prisma.securityAlert.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
            res.json({
                success: true,
                data: alerts,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Resolve security alert
     */
    async resolveSecurityAlert(req, res, next) {
        try {
            const { id } = req.params;
            const alert = await database_1.prisma.securityAlert.update({
                where: { id },
                data: { resolved: true },
            });
            await auditLogService_1.auditLogService.logAdminAction('SECURITY_ALERT_RESOLVED', 'security_alert', id, req.user.id, req);
            res.json({
                success: true,
                data: alert,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get PCI DSS compliance report
     */
    async getPCIComplianceReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const [auditReport, paymentReport] = await Promise.all([
                auditLogService_1.auditLogService.generateComplianceReport(start, end, 'PCI_DSS'),
                paymentSecurityService_1.paymentSecurityService.generatePCIComplianceReport(),
            ]);
            await auditLogService_1.auditLogService.logAdminAction('COMPLIANCE_REPORT_GENERATED', 'compliance', 'PCI_DSS', req.user.id, req);
            res.json({
                success: true,
                data: {
                    audit: auditReport,
                    payment: paymentReport,
                    generatedAt: new Date(),
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get GDPR compliance report
     */
    async getGDPRComplianceReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const report = await auditLogService_1.auditLogService.generateComplianceReport(start, end, 'GDPR');
            await auditLogService_1.auditLogService.logAdminAction('COMPLIANCE_REPORT_GENERATED', 'compliance', 'GDPR', req.user.id, req);
            res.json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get security report
     */
    async getSecurityReport(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const report = await auditLogService_1.auditLogService.generateComplianceReport(start, end, 'SECURITY');
            await auditLogService_1.auditLogService.logAdminAction('COMPLIANCE_REPORT_GENERATED', 'compliance', 'SECURITY', req.user.id, req);
            res.json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get blacklist entries
     */
    async getBlacklist(req, res, next) {
        try {
            const { type, isActive } = req.query;
            const where = {};
            if (type)
                where.type = type;
            if (isActive !== undefined)
                where.isActive = isActive === 'true';
            const blacklist = await database_1.prisma.blacklist.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 100,
            });
            res.json({
                success: true,
                data: blacklist,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Add to blacklist
     */
    async addToBlacklist(req, res, next) {
        try {
            const data = BlacklistSchema.parse(req.body);
            const entry = await database_1.prisma.blacklist.create({
                data: {
                    ...data,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
                },
            });
            await auditLogService_1.auditLogService.logAdminAction('BLACKLIST_ENTRY_ADDED', 'blacklist', entry.id, req.user.id, req, data);
            res.status(201).json({
                success: true,
                data: entry,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Remove from blacklist
     */
    async removeFromBlacklist(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.blacklist.update({
                where: { id },
                data: { isActive: false },
            });
            await auditLogService_1.auditLogService.logAdminAction('BLACKLIST_ENTRY_REMOVED', 'blacklist', id, req.user.id, req);
            res.json({
                success: true,
                message: 'Blacklist entry deactivated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get API keys
     */
    async getAPIKeys(_req, res, next) {
        try {
            const apiKeys = await database_1.prisma.apiClient.findMany({
                select: {
                    id: true,
                    name: true,
                    permissions: true,
                    isActive: true,
                    lastUsedAt: true,
                    requestCount: true,
                    expiresAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({
                success: true,
                data: apiKeys,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create API key
     */
    async createAPIKey(req, res, next) {
        try {
            const data = APIKeySchema.parse(req.body);
            // Generate API key
            const apiKey = security_1.SecurityUtils.generateAPIKey();
            const hashedKey = security_1.SecurityUtils.hashData(apiKey);
            const client = await database_1.prisma.apiClient.create({
                data: {
                    name: data.name,
                    hashedKey,
                    permissions: data.permissions,
                    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
                },
            });
            await auditLogService_1.auditLogService.logAdminAction('API_KEY_CREATED', 'api_client', client.id, req.user.id, req, { name: data.name });
            res.status(201).json({
                success: true,
                data: {
                    id: client.id,
                    name: client.name,
                    apiKey, // Only shown once
                    permissions: client.permissions,
                    expiresAt: client.expiresAt,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Revoke API key
     */
    async revokeAPIKey(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.apiClient.update({
                where: { id },
                data: { isActive: false },
            });
            await auditLogService_1.auditLogService.logAdminAction('API_KEY_REVOKED', 'api_client', id, req.user.id, req);
            res.json({
                success: true,
                message: 'API key revoked',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get active sessions
     */
    async getActiveSessions(req, res, next) {
        try {
            const { userId } = req.query;
            const where = {
                expiresAt: { gt: new Date() },
                revokedAt: null,
            };
            if (userId)
                where.userId = userId;
            const sessions = await database_1.prisma.session.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { lastActivityAt: 'desc' },
                take: 100,
            });
            res.json({
                success: true,
                data: sessions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Terminate session
     */
    async terminateSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await database_1.prisma.session.update({
                where: { id },
                data: { revokedAt: new Date() },
            });
            await auditLogService_1.auditLogService.logAdminAction('SESSION_TERMINATED', 'session', id, req.user.id, req, { userId: session.userId });
            res.json({
                success: true,
                message: 'Session terminated',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Terminate all user sessions
     */
    async terminateUserSessions(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await database_1.prisma.session.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: { revokedAt: new Date() },
            });
            await auditLogService_1.auditLogService.logAdminAction('USER_SESSIONS_TERMINATED', 'user', userId, req.user.id, req, { count: result.count });
            res.json({
                success: true,
                message: `Terminated ${result.count} sessions`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cleanup old audit logs
     */
    async cleanupOldLogs(req, res, next) {
        try {
            const { retentionDays = 90 } = req.body;
            const count = await auditLogService_1.auditLogService.cleanupOldLogs(retentionDays);
            await auditLogService_1.auditLogService.logAdminAction('AUDIT_LOGS_CLEANUP', 'system', 'audit_logs', req.user.id, req, { retentionDays, deletedCount: count });
            res.json({
                success: true,
                message: `Cleaned up ${count} old audit logs`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cleanup expired payment tokens
     */
    async cleanupExpiredTokens(req, res, next) {
        try {
            const count = await paymentSecurityService_1.paymentSecurityService.cleanupExpiredTokens();
            await auditLogService_1.auditLogService.logAdminAction('PAYMENT_TOKENS_CLEANUP', 'system', 'payment_tokens', req.user.id, req, { deletedCount: count });
            res.json({
                success: true,
                message: `Cleaned up ${count} expired payment tokens`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Generate CSV from audit logs
     */
    generateCSV(logs) {
        const headers = ['Date', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent', 'Method', 'Path', 'Status Code'];
        const rows = logs.map(log => [
            log.createdAt.toISOString(),
            log.userId,
            log.action,
            log.entityType || '',
            log.entityId || '',
            log.ipAddress || '',
            log.userAgent || '',
            log.method || '',
            log.path || '',
            log.statusCode || '',
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');
        return csv;
    }
}
exports.SecurityController = SecurityController;
exports.default = SecurityController;
//# sourceMappingURL=securityController.js.map