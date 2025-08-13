import { InitiatePaymentInput, ConfirmPaymentInput, CancelPaymentInput, RefundPaymentInput, PaymentQueryInput, SavePaymentMethodInput, PaymentWithOrder, PaymentMethod, PaymentInitiationResponse, PaymentAnalytics, PaymentReceipt } from '../types/payment';
export declare class PaymentService {
    initiatePayment(data: InitiatePaymentInput): Promise<PaymentInitiationResponse>;
    confirmPayment(data: ConfirmPaymentInput): Promise<PaymentWithOrder>;
    cancelPayment(id: string, data: CancelPaymentInput): Promise<PaymentWithOrder>;
    refundPayment(id: string, data: RefundPaymentInput): Promise<PaymentWithOrder>;
    getPaymentById(id: string): Promise<PaymentWithOrder>;
    getPayments(query: PaymentQueryInput): Promise<{
        payments: PaymentWithOrder[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    savePaymentMethod(userId: string, data: SavePaymentMethodInput): Promise<PaymentMethod>;
    getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
    deletePaymentMethod(id: string, userId: string): Promise<void>;
    generateReceipt(paymentId: string): Promise<PaymentReceipt>;
    getPaymentAnalytics(userId?: string): Promise<PaymentAnalytics>;
    processWebhook(gateway: string, payload: any, signature?: string): Promise<void>;
    private getPaymentWithOrder;
    private formatPaymentWithOrder;
    private formatPaymentDetails;
    private formatPaymentMethod;
    /**
     * Map gateway name to PaymentMethodType enum
     */
    private mapGatewayToPaymentMethod;
    /**
     * Map any payment method type to valid PaymentMethodType enum
     */
    private mapToValidPaymentMethodType;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=paymentService.d.ts.map