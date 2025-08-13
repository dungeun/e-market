export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    subject: string;
    bodyTemplate: string;
    isActive: boolean;
}
export type NotificationType = 'LOW_STOCK_ALERT' | 'OUT_OF_STOCK_ALERT' | 'CRITICAL_STOCK_ALERT' | 'ORDER_CONFIRMATION' | 'PAYMENT_SUCCESS' | 'INVENTORY_ADJUSTMENT';
export interface NotificationData {
    type: NotificationType;
    recipients: string[];
    data: Record<string, any>;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    channel: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'IN_APP';
}
export interface LowStockAlertData {
    productId: string;
    productName: string;
    productSku: string;
    currentQuantity: number;
    lowStockThreshold: number;
    categoryName?: string;
    alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CRITICAL_STOCK';
}
export declare class NotificationService {
    private templates;
    constructor();
    private initializeDefaultTemplates;
    sendLowStockAlert(alertData: LowStockAlertData): Promise<void>;
    sendNotification(notification: NotificationData): Promise<void>;
    private processTemplate;
    private sendEmailNotification;
    private sendSMSNotification;
    private sendWebhookNotification;
    private createInAppNotification;
    private getAdminRecipients;
    private mapAlertTypeToNotification;
    private mapAlertTypeToPriority;
    testNotification(type: NotificationType, testEmail: string): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notificationService.d.ts.map