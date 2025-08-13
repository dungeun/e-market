import { PaymentGateway, PaymentRequest, RefundRequest } from '../paymentGateway';
import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../../types/payment';
interface TossPaymentsConfig {
    secretKey: string;
    clientKey: string;
    testMode: boolean;
}
export declare class TossPaymentsGateway extends PaymentGateway {
    private apiUrl;
    private headers;
    constructor(config: TossPaymentsConfig);
    protected validateConfig(): void;
    initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    confirmPayment(paymentKey: string, data: any): Promise<GatewayResponse>;
    cancelPayment(paymentKey: string, reason: string): Promise<GatewayResponse>;
    refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    getPaymentStatus(paymentKey: string): Promise<GatewayResponse>;
    verifyWebhookSignature(_payload: any, _signature: string): boolean;
    generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    getSupportedMethods(): string[];
    getSupportedCurrencies(): string[];
}
export {};
//# sourceMappingURL=tossPaymentsGateway.d.ts.map