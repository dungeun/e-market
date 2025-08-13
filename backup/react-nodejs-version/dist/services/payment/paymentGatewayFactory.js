"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayFactory = void 0;
const tossPaymentsGateway_1 = require("./gateways/tossPaymentsGateway");
const inicisGateway_1 = require("./gateways/inicisGateway");
const kcpGateway_1 = require("./gateways/kcpGateway");
const stripeGateway_1 = require("./gateways/stripeGateway");
const paypalGateway_1 = require("./gateways/paypalGateway");
const error_1 = require("../../middleware/error");
class PaymentGatewayFactory {
    static registerGateway(name, gateway) {
        this.gateways.set(name, gateway);
    }
    static getGateway(name) {
        const gateway = this.gateways.get(name);
        if (!gateway) {
            throw new error_1.AppError(`Payment gateway ${name} not found`, 400);
        }
        return gateway;
    }
    static getSupportedGateways() {
        return Array.from(this.gateways.keys());
    }
    static isGatewaySupported(name) {
        return this.gateways.has(name);
    }
}
exports.PaymentGatewayFactory = PaymentGatewayFactory;
_a = PaymentGatewayFactory;
PaymentGatewayFactory.gateways = new Map();
(() => {
    // Initialize gateways based on configuration
    _a.registerGateway('TOSS_PAYMENTS', new tossPaymentsGateway_1.TossPaymentsGateway({
        secretKey: process.env['TOSS_PAYMENTS_SECRET_KEY'] || '',
        clientKey: process.env['TOSS_PAYMENTS_CLIENT_KEY'] || '',
        testMode: process.env['NODE_ENV'] !== 'production',
    }));
    _a.registerGateway('INICIS', new inicisGateway_1.InicisGateway({
        mid: process.env['INICIS_MID'] || '',
        signKey: process.env['INICIS_SIGN_KEY'] || '',
        apiUrl: process.env['INICIS_API_URL'] || '',
        testMode: process.env['NODE_ENV'] !== 'production',
    }));
    _a.registerGateway('KCP', new kcpGateway_1.KCPGateway({
        siteCd: process.env['KCP_SITE_CODE'] || '',
        siteKey: process.env['KCP_SITE_KEY'] || '',
        apiUrl: process.env['KCP_API_URL'] || 'https://testpay.kcp.co.kr',
        testMode: process.env['NODE_ENV'] !== 'production',
    }));
    _a.registerGateway('STRIPE', new stripeGateway_1.StripeGateway({
        secretKey: process.env['STRIPE_SECRET_KEY'] || '',
        publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
        webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
        testMode: process.env['NODE_ENV'] !== 'production',
    }));
    _a.registerGateway('PAYPAL', new paypalGateway_1.PayPalGateway({
        clientId: process.env['PAYPAL_CLIENT_ID'] || '',
        clientSecret: process.env['PAYPAL_CLIENT_SECRET'] || '',
        mode: process.env['NODE_ENV'] === 'production' ? 'live' : 'sandbox',
    }));
})();
//# sourceMappingURL=paymentGatewayFactory.js.map