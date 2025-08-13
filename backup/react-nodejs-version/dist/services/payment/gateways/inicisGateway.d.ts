import { PaymentGateway, PaymentRequest, RefundRequest } from '../paymentGateway';
import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../../types/payment';
interface InicisConfig {
    mid: string;
    signKey: string;
    apiUrl: string;
    testMode: boolean;
}
export declare class InicisGateway extends PaymentGateway {
    private apiUrl;
    constructor(config: InicisConfig);
    protected validateConfig(): void;
    private generateSignature;
    private generateTimestamp;
    initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    confirmPayment(_paymentId: string, data: any): Promise<GatewayResponse>;
    cancelPayment(paymentId: string, _reason: string): Promise<GatewayResponse>;
    refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    getPaymentStatus(transactionId: string): Promise<GatewayResponse>;
    verifyWebhookSignature(payload: any, signature: string): boolean;
    generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    getSupportedMethods(): string[];
    getSupportedCurrencies(): string[];
}
export {};
//# sourceMappingURL=inicisGateway.d.ts.map