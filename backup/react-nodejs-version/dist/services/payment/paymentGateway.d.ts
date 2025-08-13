import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../types/payment';
export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any>;
}
export interface RefundRequest {
    paymentId: string;
    transactionId: string;
    amount: number;
    reason: string;
    metadata?: Record<string, any>;
}
export declare abstract class PaymentGateway {
    protected config: any;
    constructor(config: any);
    abstract initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    abstract confirmPayment(paymentId: string, data: any): Promise<GatewayResponse>;
    abstract cancelPayment(paymentId: string, reason: string): Promise<GatewayResponse>;
    abstract refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    abstract getPaymentStatus(transactionId: string): Promise<GatewayResponse>;
    abstract verifyWebhookSignature(payload: any, signature: string): boolean;
    abstract generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    abstract getSupportedMethods(): string[];
    abstract getSupportedCurrencies(): string[];
    protected validateConfig(): void;
    protected formatAmount(amount: number, currency: string): number;
    protected generateOrderId(orderId: string): string;
}
//# sourceMappingURL=paymentGateway.d.ts.map