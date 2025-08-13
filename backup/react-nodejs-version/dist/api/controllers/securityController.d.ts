import { Request, Response, NextFunction } from 'express';
export declare class SecurityController {
    /**
     * Search audit logs
     */
    searchAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export audit logs
     */
    exportAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get security alerts
     */
    getSecurityAlerts(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resolve security alert
     */
    resolveSecurityAlert(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get PCI DSS compliance report
     */
    getPCIComplianceReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get GDPR compliance report
     */
    getGDPRComplianceReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get security report
     */
    getSecurityReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get blacklist entries
     */
    getBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add to blacklist
     */
    addToBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove from blacklist
     */
    removeFromBlacklist(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get API keys
     */
    getAPIKeys(_req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create API key
     */
    createAPIKey(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Revoke API key
     */
    revokeAPIKey(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get active sessions
     */
    getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Terminate session
     */
    terminateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Terminate all user sessions
     */
    terminateUserSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cleanup old audit logs
     */
    cleanupOldLogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Cleanup expired payment tokens
     */
    cleanupExpiredTokens(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Generate CSV from audit logs
     */
    private generateCSV;
}
export default SecurityController;
//# sourceMappingURL=securityController.d.ts.map