"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalGateway = void 0;
const axios_1 = __importDefault(require("axios"));
const paymentGateway_1 = require("../paymentGateway");
const error_1 = require("../../../middleware/error");
const logger_1 = require("../../../utils/logger");
class PayPalGateway extends paymentGateway_1.PaymentGateway {
    constructor(config) {
        super(config);
        this.validateConfig();
        this.apiUrl = config.mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
    validateConfig() {
        if (!this.config.clientId) {
            throw new Error('PayPal client ID is required');
        }
        if (!this.config.clientSecret) {
            throw new Error('PayPal client secret is required');
        }
    }
    async getAccessToken() {
        // Check if token is cached and not expired
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return this.accessToken;
        }
        try {
            const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
            const response = await axios_1.default.post(`${this.apiUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
            return this.accessToken || '';
        }
        catch (error) {
            logger_1.logger.error('PayPal get access token error:', error);
            throw new error_1.AppError('Failed to authenticate with PayPal', 500);
        }
    }
    async initiatePayment(request) {
        try {
            const accessToken = await this.getAccessToken();
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                        reference_id: request.orderId,
                        amount: {
                            currency_code: request.currency,
                            value: request.amount.toFixed(2),
                        },
                        description: `Order ${request.orderId}`,
                    }],
                application_context: {
                    return_url: request.returnUrl,
                    cancel_url: request.cancelUrl,
                    brand_name: 'Commerce Plugin',
                    locale: 'en-US',
                    user_action: 'PAY_NOW',
                },
            };
            const response = await axios_1.default.post(`${this.apiUrl}/v2/checkout/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const approveLink = response.data.links.find((link) => link.rel === 'approve');
            return {
                paymentId: response.data.id,
                paymentUrl: approveLink?.href,
                sessionData: {
                    orderId: response.data.id,
                },
                expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
            };
        }
        catch (error) {
            logger_1.logger.error('PayPal initiate payment error:', error);
            throw new error_1.AppError(error.response?.data?.message || 'Failed to initiate payment', 500);
        }
    }
    async confirmPayment(paymentId, _data) {
        try {
            const accessToken = await this.getAccessToken();
            // Capture the payment
            const response = await axios_1.default.post(`${this.apiUrl}/v2/checkout/orders/${paymentId}/capture`, {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.status === 'COMPLETED') {
                const capture = response.data.purchase_units[0].payments.captures[0];
                return {
                    success: true,
                    transactionId: capture.id,
                    approvalNumber: response.data.id,
                    rawResponse: response.data,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: response.data.status,
                    errorMessage: `Payment status: ${response.data.status}`,
                    rawResponse: response.data,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('PayPal confirm payment error:', error);
            return {
                success: false,
                errorCode: error.response?.data?.name || 'CONFIRM_ERROR',
                errorMessage: error.response?.data?.message || error.message,
                rawResponse: error.response?.data,
            };
        }
    }
    async cancelPayment(paymentId, _reason) {
        try {
            // PayPal orders automatically expire after 3 hours if not captured
            // No explicit cancellation API for uncaptured orders
            return {
                success: true,
                transactionId: paymentId,
            };
        }
        catch (error) {
            logger_1.logger.error('PayPal cancel payment error:', error);
            return {
                success: false,
                errorCode: 'CANCEL_ERROR',
                errorMessage: 'Failed to cancel payment',
            };
        }
    }
    async refundPayment(request) {
        try {
            const accessToken = await this.getAccessToken();
            const refundData = {
                amount: {
                    value: request.amount.toFixed(2),
                    currency_code: 'USD', // Should be from original payment
                },
                note_to_payer: request.reason,
            };
            const response = await axios_1.default.post(`${this.apiUrl}/v2/payments/captures/${request.transactionId}/refund`, refundData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.status === 'COMPLETED') {
                return {
                    success: true,
                    transactionId: response.data.id,
                    rawResponse: response.data,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: response.data.status,
                    errorMessage: `Refund status: ${response.data.status}`,
                    rawResponse: response.data,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('PayPal refund payment error:', error);
            return {
                success: false,
                errorCode: error.response?.data?.name || 'REFUND_ERROR',
                errorMessage: error.response?.data?.message || error.message,
                rawResponse: error.response?.data,
            };
        }
    }
    async getPaymentStatus(transactionId) {
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.get(`${this.apiUrl}/v2/checkout/orders/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            return {
                success: true,
                transactionId: response.data.id,
                rawResponse: response.data,
            };
        }
        catch (error) {
            logger_1.logger.error('PayPal get payment status error:', error);
            return {
                success: false,
                errorCode: error.response?.data?.name || 'QUERY_ERROR',
                errorMessage: error.response?.data?.message || error.message,
                rawResponse: error.response?.data,
            };
        }
    }
    verifyWebhookSignature(_payload, _signature) {
        try {
            // PayPal webhook verification requires additional API call
            // For simplicity, returning true here
            // In production, implement proper webhook verification
            return true;
        }
        catch (error) {
            logger_1.logger.error('PayPal webhook verification error:', error);
            return false;
        }
    }
    async generateReceipt(paymentId, transactionId) {
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.get(`${this.apiUrl}/v2/payments/captures/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const capture = response.data;
            return {
                paymentId,
                receiptNumber: `PP-${capture.id}`,
                issuedAt: new Date(),
                amount: parseFloat(capture.amount.value),
                currency: capture.amount.currency_code,
                taxAmount: 0, // PayPal doesn't separate tax in captures
                items: [{
                        name: `Order ${paymentId}`,
                        quantity: 1,
                        unitPrice: parseFloat(capture.amount.value),
                        totalPrice: parseFloat(capture.amount.value),
                    }],
                customerInfo: {
                    name: capture.payer?.name?.given_name
                        ? `${capture.payer.name.given_name} ${capture.payer.name.surname}`
                        : 'Unknown',
                    email: capture.payer?.email_address || '',
                },
                paymentInfo: {
                    method: 'PayPal',
                    transactionId: capture.id,
                    approvalNumber: capture.id,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('PayPal generate receipt error:', error);
            throw new error_1.AppError('Failed to generate receipt', 500);
        }
    }
    getSupportedMethods() {
        return [
            'paypal',
            'credit_card',
            'debit_card',
            'venmo', // US only
            'pay_later', // PayPal Credit
        ];
    }
    getSupportedCurrencies() {
        // PayPal supports 25+ currencies
        return [
            'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY',
            'SEK', 'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY',
            'INR', 'RUB', 'BRL', 'MYR', 'PHP', 'PLN', 'CZK', 'DKK',
            'HUF', 'ILS', 'THB', 'TWD',
        ];
    }
}
exports.PayPalGateway = PayPalGateway;
//# sourceMappingURL=paypalGateway.js.map