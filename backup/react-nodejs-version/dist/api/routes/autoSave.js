"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSaveRoutes = void 0;
const express_1 = require("express");
const autoSave_1 = require("../../middleware/autoSave");
const logger_1 = require("../../utils/logger");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
exports.autoSaveRoutes = router;
// ===== AUTO-SAVE MANAGEMENT =====
/**
 * @route   GET /api/v1/auto-save/stats
 * @desc    Get auto-save system statistics
 * @access  Private (Admin)
 */
router.get('/stats', async (_req, res) => {
    try {
        const stats = (0, autoSave_1.getAutoSaveStats)();
        return res.json({
            success: true,
            data: stats,
            message: 'Auto-save statistics retrieved successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting auto-save stats:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Internal server error'
            }
        });
    }
});
/**
 * @route   POST /api/v1/auto-save/recover
 * @desc    Manually trigger cart recovery from snapshot
 * @access  Private (Admin)
 * @body    { sessionId }
 */
router.post('/recover', async (req, res) => {
    try {
        const schema = zod_1.z.object({
            sessionId: zod_1.z.string().min(1, 'Session ID is required')
        });
        const { sessionId } = schema.parse(req.body);
        const recovered = await (0, autoSave_1.recoverCartFromSnapshot)(sessionId);
        return res.json({
            success: true,
            data: {
                sessionId,
                recovered
            },
            message: recovered
                ? 'Cart recovered successfully from snapshot'
                : 'No snapshot available for recovery'
        });
    }
    catch (error) {
        logger_1.logger.error('Error recovering cart from snapshot:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.errors
                }
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Internal server error'
            }
        });
    }
});
/**
 * @route   DELETE /api/v1/auto-save/cleanup/:sessionId
 * @desc    Clean up auto-save resources for a session
 * @access  Private (Admin)
 * @params  sessionId - Session ID to clean up
 */
router.delete('/cleanup/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: { message: 'Session ID is required' }
            });
        }
        (0, autoSave_1.cleanupAutoSave)(sessionId);
        return res.json({
            success: true,
            data: { sessionId },
            message: 'Auto-save resources cleaned up successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error cleaning up auto-save resources:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Internal server error'
            }
        });
    }
});
/**
 * @route   GET /api/v1/auto-save/health
 * @desc    Check auto-save system health
 * @access  Private (Admin)
 */
router.get('/health', async (_req, res) => {
    try {
        const stats = (0, autoSave_1.getAutoSaveStats)();
        const currentTime = new Date();
        // Check system health
        const health = {
            status: 'healthy',
            timestamp: currentTime.toISOString(),
            activeSessions: stats.activeSessions,
            snapshotsCount: stats.snapshotsCount,
            timersCount: stats.timersCount,
            issues: []
        };
        // Check for potential issues
        if (stats.activeSessions > 1000) {
            health.issues.push('High number of active sessions');
            health.status = 'warning';
        }
        if (stats.timersCount !== stats.activeSessions) {
            health.issues.push('Timer count mismatch with active sessions');
            health.status = 'warning';
        }
        if (stats.oldestSnapshot) {
            const oldestAge = currentTime.getTime() - stats.oldestSnapshot.getTime();
            const hoursOld = oldestAge / (1000 * 60 * 60);
            if (hoursOld > 24) {
                health.issues.push(`Very old snapshots detected (${Math.round(hoursOld)} hours old)`);
                health.status = 'warning';
            }
        }
        return res.json({
            success: true,
            data: health,
            message: 'Auto-save system health check completed'
        });
    }
    catch (error) {
        logger_1.logger.error('Error checking auto-save health:', error);
        return res.status(500).json({
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Internal server error'
            }
        });
    }
});
/**
 * @route   POST /api/v1/auto-save/test
 * @desc    Test auto-save functionality
 * @access  Private (Admin)
 * @body    { sessionId?, testData? }
 */
router.post('/test', async (req, res) => {
    try {
        const schema = zod_1.z.object({
            sessionId: zod_1.z.string().optional(),
            testData: zod_1.z.record(zod_1.z.any()).optional()
        });
        const { sessionId, testData } = schema.parse(req.body);
        // This is a test endpoint for validating auto-save functionality
        const testResult = {
            timestamp: new Date().toISOString(),
            sessionId: sessionId || 'test-session-' + Date.now(),
            testData: testData || { test: true },
            status: 'test_completed'
        };
        logger_1.logger.info('Auto-save test executed:', testResult);
        return res.json({
            success: true,
            data: testResult,
            message: 'Auto-save test completed successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error running auto-save test:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.errors
                }
            });
        }
        return res.status(500).json({
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Internal server error'
            }
        });
    }
});
//# sourceMappingURL=autoSave.js.map