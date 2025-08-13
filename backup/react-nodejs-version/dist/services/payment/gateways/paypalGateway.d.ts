import { PaymentGateway, PaymentRequest, RefundRequest } from '../paymentGateway';
import { PaymentInitiationResponse, GatewayResponse, PaymentReceipt } from '../../../types/payment';
interface PayPalConfig {
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
}
export declare class PayPalGateway extends PaymentGateway {
    private apiUrl;
    private accessToken?;
    private tokenExpiry?;
    constructor(config: PayPalConfig);
    protected validateConfig(): void;
    private getAccessToken;
    initiatePayment(request: PaymentRequest): Promise<PaymentInitiationResponse>;
    confirmPayment(paymentId: string, _data: any): Promise<GatewayResponse>;
    cancelPayment(paymentId: string, _reason: string): Promise<GatewayResponse>;
    refundPayment(request: RefundRequest): Promise<GatewayResponse>;
    getPaymentStatus(transactionId: string): Promise<GatewayResponse>;
    verifyWebhookSignature(_payload: any, _signature: string): boolean;
    generateReceipt(paymentId: string, transactionId: string): Promise<PaymentReceipt>;
    getSupportedMethods(): string[];
    getSupportedCurrencies(): string[];
}
export {};
//# sourceMappingURL=paypalGateway.d.ts.map