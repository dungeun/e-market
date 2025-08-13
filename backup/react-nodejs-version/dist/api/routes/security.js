"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const securityController_1 = require("../controllers/securityController");
const router = (0, express_1.Router)();
const securityController = new securityController_1.SecurityController();
// All security routes require admin authentication
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']));
// Audit logs
router.get('/audit-logs', (0, rateLimiter_1.rateLimiter)('api'), securityController.searchAuditLogs);
router.get('/audit-logs/export', (0, rateLimiter_1.rateLimiter)('api'), securityController.exportAuditLogs);
// Security alerts
router.get('/alerts', (0, rateLimiter_1.rateLimiter)('api'), securityController.getSecurityAlerts);
router.patch('/alerts/:id/resolve', (0, rateLimiter_1.rateLimiter)('api'), securityController.resolveSecurityAlert);
// Compliance reports
router.get('/compliance/pci-dss', (0, rateLimiter_1.rateLimiter)('api'), securityController.getPCIComplianceReport);
router.get('/compliance/gdpr', (0, rateLimiter_1.rateLimiter)('api'), securityController.getGDPRComplianceReport);
router.get('/compliance/security', (0, rateLimiter_1.rateLimiter)('api'), securityController.getSecurityReport);
// Blacklist management
router.get('/blacklist', (0, rateLimiter_1.rateLimiter)('api'), securityController.getBlacklist);
router.post('/blacklist', (0, rateLimiter_1.rateLimiter)('api'), securityController.addToBlacklist);
router.delete('/blacklist/:id', (0, rateLimiter_1.rateLimiter)('api'), securityController.removeFromBlacklist);
// API key management
router.get('/api-keys', (0, rateLimiter_1.rateLimiter)('api'), securityController.getAPIKeys);
router.post('/api-keys', (0, rateLimiter_1.rateLimiter)('api'), securityController.createAPIKey);
router.delete('/api-keys/:id', (0, rateLimiter_1.rateLimiter)('api'), securityController.revokeAPIKey);
// Session management
router.get('/sessions', (0, rateLimiter_1.rateLimiter)('api'), securityController.getActiveSessions);
router.delete('/sessions/:id', (0, rateLimiter_1.rateLimiter)('api'), securityController.terminateSession);
router.delete('/sessions/user/:userId', (0, rateLimiter_1.rateLimiter)('api'), securityController.terminateUserSessions);
// Security maintenance
router.post('/maintenance/cleanup-logs', (0, rateLimiter_1.rateLimiter)('api'), securityController.cleanupOldLogs);
router.post('/maintenance/cleanup-tokens', (0, rateLimiter_1.rateLimiter)('api'), securityController.cleanupExpiredTokens);
exports.default = router;
//# sourceMappingURL=security.js.map