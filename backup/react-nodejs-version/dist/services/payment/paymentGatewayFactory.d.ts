import { PaymentGateway } from './paymentGateway';
export declare class PaymentGatewayFactory {
    private static gateways;
    static registerGateway(name: string, gateway: PaymentGateway): void;
    static getGateway(name: string): PaymentGateway;
    static getSupportedGateways(): string[];
    static isGatewaySupported(name: string): boolean;
}
//# sourceMappingURL=paymentGatewayFactory.d.ts.map