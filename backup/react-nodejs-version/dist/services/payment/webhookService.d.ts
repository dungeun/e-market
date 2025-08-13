export interface WebhookPayload {
    gateway: string;
    event: string;
    data: any;
    signature?: string;
    timestamp?: Date;
}
export declare class WebhookService {
    /**
     * Process webhook from payment gateway
     */
    processWebhook(payload: WebhookPayload): Promise<void>;
    /**
     * Process Stripe webhook events
     */
    private processStripeWebhook;
    /**
     * Process TossPayments webhook events
     */
    private processTossPaymentsWebhook;
    /**
     * Process Inicis webhook events
     */
    private processInicisWebhook;
    /**
     * Process KCP webhook events
     */
    private processKcpWebhook;
    /**
     * Process PayPal webhook events
     */
    private processPayPalWebhook;
    /**
     * Handle successful payment
     */
    private handlePaymentSuccess;
    /**
     * Handle failed payment
     */
    private handlePaymentFailed;
    /**
     * Handle payment cancellation
     */
    private handlePaymentCancelled;
    /**
     * Handle chargeback notification
     */
    private handleChargeback;
    /**
     * Handle recurring payment success
     */
    private handleRecurringPaymentSuccess;
    /**
     * Handle refund completion
     */
    private handleRefundCompleted;
    /**
     * Find payment by gateway-specific data
     */
    private findPaymentByGatewayData;
    /**
     * Extract failure reason from gateway data (currently unused)
     */
    private extractRefundAmount;
    /**
     * Extract refund transaction ID from gateway data (currently unused)
     */
    /**
     * Log webhook for debugging and audit
     */
    private logWebhook;
}
export declare const webhookService: WebhookService;
//# sourceMappingURL=webhookService.d.ts.map