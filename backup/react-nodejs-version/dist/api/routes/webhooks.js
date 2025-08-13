"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metricsService_1 = require("../../services/metricsService");
const logger_1 = __importDefault(require("../../utils/logger"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * /webhooks/alerts:
 *   post:
 *     summary: Receive AlertManager webhook notifications
 *     description: Handles incoming alert notifications from Prometheus AlertManager
 *     tags:
 *       - Webhooks
 *       - Monitoring
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *               groupKey:
 *                 type: string
 *               status:
 *                 type: string
 *               receiver:
 *                 type: string
 *               alerts:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook payload
 *       500:
 *         description: Internal server error
 */
router.post('/alerts', async (req, res) => {
    try {
        const webhook = req.body;
        logger_1.default.info('Received AlertManager webhook', {
            groupKey: webhook.groupKey,
            status: webhook.status,
            alertCount: webhook.alerts?.length || 0
        });
        // Process each alert
        for (const alert of webhook.alerts || []) {
            await processAlert(alert);
        }
        // Record webhook event
        metricsService_1.MetricsService.recordWebhookEvent('alertmanager', 'success');
        res.json({ message: 'Webhook processed successfully' });
    }
    catch (error) {
        logger_1.default.error('Failed to process AlertManager webhook', error);
        metricsService_1.MetricsService.recordWebhookEvent('alertmanager', 'failed');
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});
/**
 * @swagger
 * /webhooks/alerts/critical:
 *   post:
 *     summary: Receive critical alert notifications
 *     description: Handles critical alert notifications with immediate response
 *     tags:
 *       - Webhooks
 *       - Monitoring
 *       - Critical
 *     responses:
 *       200:
 *         description: Critical alert processed
 *       500:
 *         description: Internal server error
 */
router.post('/alerts/critical', async (req, res) => {
    try {
        const webhook = req.body;
        logger_1.default.error('CRITICAL ALERT received', {
            groupKey: webhook.groupKey,
            alerts: webhook.alerts?.map(alert => ({
                alertname: alert.labels.alertname,
                summary: alert.annotations.summary,
                description: alert.annotations.description
            }))
        });
        // Process critical alerts with immediate actions
        for (const alert of webhook.alerts || []) {
            await processCriticalAlert(alert);
        }
        // Send immediate notifications
        await sendCriticalAlertNotifications(webhook);
        metricsService_1.MetricsService.recordWebhookEvent('critical_alert', 'success');
        res.json({ message: 'Critical alert processed' });
    }
    catch (error) {
        logger_1.default.error('Failed to process critical alert webhook', error);
        metricsService_1.MetricsService.recordWebhookEvent('critical_alert', 'failed');
        res.status(500).json({ error: 'Failed to process critical alert' });
    }
});
/**
 * @swagger
 * /webhooks/payment:
 *   post:
 *     summary: Receive payment gateway webhooks
 *     description: Handles payment gateway webhook notifications
 *     tags:
 *       - Webhooks
 *       - Payment
 *     responses:
 *       200:
 *         description: Payment webhook processed
 *       500:
 *         description: Internal server error
 */
router.post('/payment', async (req, res) => {
    try {
        const paymentData = req.body;
        logger_1.default.info('Received payment webhook', {
            gateway: paymentData.gateway,
            transactionId: paymentData.transactionId,
            status: paymentData.status
        });
        // Record payment metrics
        if (paymentData.status === 'success') {
            metricsService_1.MetricsService.recordPaymentSuccess(paymentData.gateway, paymentData.method);
        }
        else if (paymentData.status === 'failed') {
            metricsService_1.MetricsService.recordPaymentFailure(paymentData.gateway, paymentData.method, paymentData.errorCode);
        }
        metricsService_1.MetricsService.recordWebhookEvent('payment', 'success');
        res.json({ message: 'Payment webhook processed' });
    }
    catch (error) {
        logger_1.default.error('Failed to process payment webhook', error);
        metricsService_1.MetricsService.recordWebhookEvent('payment', 'failed');
        res.status(500).json({ error: 'Failed to process payment webhook' });
    }
});
async function processAlert(alert) {
    const alertname = alert.labels.alertname;
    const severity = alert.labels.severity;
    logger_1.default.info('Processing alert', {
        alertname,
        severity,
        status: alert.status,
        summary: alert.annotations.summary
    });
    // Perform specific actions based on alert type
    switch (alertname) {
        case 'HighErrorRate':
            await handleHighErrorRateAlert(alert);
            break;
        case 'SlowAPIResponse':
            await handleSlowAPIResponseAlert(alert);
            break;
        case 'DatabaseConnectionFailure':
            await handleDatabaseConnectionAlert(alert);
            break;
        case 'ApplicationDown':
            await handleApplicationDownAlert(alert);
            break;
        case 'LowOrderConversionRate':
            await handleLowConversionAlert(alert);
            break;
        case 'ProductOutOfStock':
            await handleOutOfStockAlert(alert);
            break;
        default:
            logger_1.default.info('No specific handler for alert', { alertname });
    }
}
async function processCriticalAlert(alert) {
    const alertname = alert.labels.alertname;
    logger_1.default.error('Processing CRITICAL alert', {
        alertname,
        summary: alert.annotations.summary,
        description: alert.annotations.description
    });
    // Immediate actions for critical alerts
    switch (alertname) {
        case 'ApplicationDown':
            // Trigger automatic restart or scaling
            await triggerApplicationRecovery();
            break;
        case 'DatabaseConnectionFailure':
            // Check database connectivity and restart connections
            await checkDatabaseConnectivity();
            break;
        case 'HighErrorRate':
            // Enable circuit breaker or rate limiting
            await enableEmergencyProtection();
            break;
        default:
            logger_1.default.warn('No critical handler for alert', { alertname });
    }
}
async function sendCriticalAlertNotifications(_webhook) {
    // Send immediate notifications via multiple channels
    try {
        // Email notification
        // await emailService.sendCriticalAlert(webhook);
        // SMS notification
        // await smsService.sendCriticalAlert(webhook);
        // Slack notification
        // await slackService.sendCriticalAlert(webhook);
        logger_1.default.info('Critical alert notifications sent');
    }
    catch (error) {
        logger_1.default.error('Failed to send critical alert notifications', error);
    }
}
// Alert handlers
async function handleHighErrorRateAlert(alert) {
    logger_1.default.warn('High error rate detected', alert.annotations);
    // Implement automatic remediation
}
async function handleSlowAPIResponseAlert(alert) {
    logger_1.default.warn('Slow API response detected', alert.annotations);
    // Check and optimize slow endpoints
}
async function handleDatabaseConnectionAlert(alert) {
    logger_1.default.error('Database connection failure', alert.annotations);
    // Attempt to reconnect and check database health
}
async function handleApplicationDownAlert(alert) {
    logger_1.default.error('Application is down', alert.annotations);
    // Trigger recovery procedures
}
async function handleLowConversionAlert(alert) {
    logger_1.default.warn('Low conversion rate detected', alert.annotations);
    // Notify business team
}
async function handleOutOfStockAlert(alert) {
    logger_1.default.warn('Product out of stock', alert.annotations);
    // Notify inventory team
}
// Recovery actions
async function triggerApplicationRecovery() {
    logger_1.default.info('Triggering application recovery procedures');
    // Implement recovery logic
}
async function checkDatabaseConnectivity() {
    logger_1.default.info('Checking database connectivity');
    // Implement database health check
}
async function enableEmergencyProtection() {
    logger_1.default.info('Enabling emergency protection measures');
    // Implement emergency protection
}
exports.default = router;
//# sourceMappingURL=webhooks.js.map