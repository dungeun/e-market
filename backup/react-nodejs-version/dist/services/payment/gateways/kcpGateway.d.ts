import { PaymentGateway, PaymentRequest, RefundRequest } from '../paymentGateway';
import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../../types/payment';
interface KCPConfig {
    siteCd: string;
    siteKey: string;
    apiUrl: string;
    testMode: boolean;
}
export declare class KCPGateway extends PaymentGateway {
    private apiUrl;
    private jsUrl;
    constructor(config: KCPConfig);
    protected validateConfig(): void;
    private generateEncData;
    initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    confirmPayment(_paymentId: string, data: any): Promise<GatewayResponse>;
    cancelPayment(paymentId: string, _reason: string): Promise<GatewayResponse>;
    refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    getPaymentStatus(transactionId: string): Promise<GatewayResponse>;
    private parseKCPResponse;
    verifyWebhookSignature(_payload: any, _signature: string): boolean;
    generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    getSupportedMethods(): string[];
    getSupportedCurrencies(): string[];
}
export {};
//# sourceMappingURL=kcpGateway.d.ts.map