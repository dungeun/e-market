"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = void 0;
class PaymentGateway {
    constructor(config) {
        this.config = config;
    }
    // Validate configuration
    validateConfig() {
        // Override in subclasses to validate specific config
    }
    // Format amount for gateway (handle decimal places, currency conversion etc)
    formatAmount(amount, currency) {
        // Most Korean gateways expect amount in won without decimals
        if (currency === 'KRW') {
            return Math.round(amount);
        }
        // For other currencies, convert to smallest unit (e.g., cents for USD)
        return Math.round(amount * 100);
    }
    // Generate unique order ID for gateway
    generateOrderId(orderId) {
        // Some gateways have specific format requirements
        return `${orderId}_${Date.now()}`;
    }
}
exports.PaymentGateway = PaymentGateway;
//# sourceMappingURL=paymentGateway.js.map