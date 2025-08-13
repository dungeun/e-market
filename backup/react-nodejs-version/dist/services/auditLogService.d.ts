import { Request } from 'express';
export interface AuditLogData {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
}
/**
 * Security Audit Log Service
 * Tracks all security-relevant events for compliance and forensics
 */
export declare class AuditLogService {
    /**
     * Log authentication events
     */
    logAuthEvent(action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'TOKEN_REFRESH' | 'SESSION_EXPIRED', userId: string | null, req: Request, metadata?: any): Promise<void>;
    /**
     * Log data access events
     */
    logDataAccess(action: 'VIEW' | 'EXPORT' | 'DOWNLOAD' | 'SHARE', entityType: string, entityId: string, userId: string, req: Request, metadata?: any): Promise<void>;
    /**
     * Log security events
     */
    logSecurityEvent(action: 'RATE_LIMIT_EXCEEDED' | 'CSRF_VIOLATION' | 'SUSPICIOUS_ACTIVITY' | 'BLACKLIST_HIT' | 'ENCRYPTION_FAILURE', userId: string | null, req: Request, metadata?: any): Promise<void>;
    /**
     * Log payment events
     */
    logPaymentEvent(action: 'INITIATE' | 'COMPLETE' | 'FAIL' | 'REFUND' | 'DISPUTE' | 'FRAUD_CHECK', paymentId: string, userId: string, req: Request, metadata?: any): Promise<void>;
    /**
     * Log administrative actions
     */
    logAdminAction(action: string, targetType: string, targetId: string, adminId: string, req: Request, metadata?: any): Promise<void>;
    /**
     * Log API access
     */
    logAPIAccess(req: Request, res: any, responseTime: number, error?: any): Promise<void>;
    /**
     * Check failed login patterns
     */
    private checkFailedLoginPatterns;
    /**
     * Check data exfiltration patterns
     */
    private checkDataExfiltration;
    /**
     * Check API abuse patterns
     */
    private checkAPIAbusePatterns;
    /**
     * Get security event severity
     */
    private getSecurityEventSeverity;
    /**
     * Create security alert
     */
    private createSecurityAlert;
    /**
     * Classify data sensitivity
     */
    private classifyData;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startDate: Date, endDate: Date, reportType: 'PCI_DSS' | 'GDPR' | 'SECURITY'): Promise<any>;
    /**
     * Clean up old audit logs
     */
    cleanupOldLogs(retentionDays?: number): Promise<number>;
    /**
     * Search audit logs
     */
    searchLogs(criteria: {
        userId?: string;
        action?: string;
        entityType?: string;
        entityId?: string;
        startDate?: Date;
        endDate?: Date;
        ipAddress?: string;
        limit?: number;
    }): Promise<any[]>;
}
export declare const auditLogService: AuditLogService;
//# sourceMappingURL=auditLogService.d.ts.map