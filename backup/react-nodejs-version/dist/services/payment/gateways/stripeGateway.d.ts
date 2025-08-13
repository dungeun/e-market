import { PaymentGateway, PaymentRequest, RefundRequest } from '../paymentGateway';
import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../../types/payment';
interface StripeConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
    testMode: boolean;
}
export declare class StripeGateway extends PaymentGateway {
    private stripe;
    constructor(config: StripeConfig);
    protected validateConfig(): void;
    initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    confirmPayment(paymentId: string, _data: any): Promise<GatewayResponse>;
    cancelPayment(paymentId: string, _reason: string): Promise<GatewayResponse>;
    refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    getPaymentStatus(transactionId: string): Promise<GatewayResponse>;
    verifyWebhookSignature(payload: any, signature: string): boolean;
    generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    private mapRefundReason;
    getSupportedMethods(): string[];
    getSupportedCurrencies(): string[];
}
export {};
//# sourceMappingURL=stripeGateway.d.ts.map