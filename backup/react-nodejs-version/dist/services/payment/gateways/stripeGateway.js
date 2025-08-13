"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeGateway = void 0;
const stripe_1 = __importDefault(require("stripe"));
const paymentGateway_1 = require("../paymentGateway");
const error_1 = require("../../../middleware/error");
const logger_1 = require("../../../utils/logger");
class StripeGateway extends paymentGateway_1.PaymentGateway {
    constructor(config) {
        super(config);
        this.validateConfig();
        this.stripe = new stripe_1.default(config.secretKey, {
            apiVersion: '2023-10-16',
        });
    }
    validateConfig() {
        if (!this.config.secretKey) {
            throw new Error('Stripe secret key is required');
        }
        if (!this.config.webhookSecret) {
            throw new Error('Stripe webhook secret is required');
        }
    }
    async initiatePayment(request) {
        try {
            // Create a payment intent
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: this.formatAmount(request.amount, request.currency),
                currency: request.currency.toLowerCase(),
                metadata: {
                    orderId: request.orderId,
                    ...request.metadata,
                },
                receipt_email: request.customerEmail,
            });
            // Create a checkout session for better UX
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: request.currency.toLowerCase(),
                            product_data: {
                                name: `Order ${request.orderId}`,
                            },
                            unit_amount: this.formatAmount(request.amount, request.currency),
                        },
                        quantity: 1,
                    }],
                mode: 'payment',
                success_url: request.returnUrl,
                cancel_url: request.cancelUrl,
                customer_email: request.customerEmail,
                metadata: {
                    orderId: request.orderId,
                    paymentIntentId: paymentIntent.id,
                },
            });
            return {
                paymentId: paymentIntent.id,
                paymentUrl: session.url || undefined,
                paymentKey: paymentIntent.client_secret || undefined,
                sessionData: {
                    sessionId: session.id,
                    publishableKey: this.config.publishableKey,
                },
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            };
        }
        catch (error) {
            logger_1.logger.error('Stripe initiate payment error:', error);
            throw new error_1.AppError(error.message || 'Failed to initiate payment', 500);
        }
    }
    async confirmPayment(paymentId, _data) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            if (paymentIntent.status === 'succeeded') {
                return {
                    success: true,
                    transactionId: paymentIntent.id,
                    approvalNumber: paymentIntent.charges?.data[0]?.id,
                    rawResponse: paymentIntent,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: paymentIntent.status,
                    errorMessage: `Payment status: ${paymentIntent.status}`,
                    rawResponse: paymentIntent,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('Stripe confirm payment error:', error);
            return {
                success: false,
                errorCode: error.code || 'CONFIRM_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async cancelPayment(paymentId, _reason) {
        try {
            const canceledIntent = await this.stripe.paymentIntents.cancel(paymentId, {
                cancellation_reason: 'requested_by_customer',
            });
            return {
                success: true,
                transactionId: canceledIntent.id,
                rawResponse: canceledIntent,
            };
        }
        catch (error) {
            logger_1.logger.error('Stripe cancel payment error:', error);
            return {
                success: false,
                errorCode: error.code || 'CANCEL_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async refundPayment(request) {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: request.transactionId,
                amount: this.formatAmount(request.amount, 'USD'), // Stripe uses cents
                reason: this.mapRefundReason(request.reason),
                metadata: request.metadata,
            });
            return {
                success: true,
                transactionId: refund.id,
                approvalNumber: refund.charge,
                rawResponse: refund,
            };
        }
        catch (error) {
            logger_1.logger.error('Stripe refund payment error:', error);
            return {
                success: false,
                errorCode: error.code || 'REFUND_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async getPaymentStatus(transactionId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
            return {
                success: true,
                transactionId: paymentIntent.id,
                approvalNumber: paymentIntent.charges?.data[0]?.id,
                rawResponse: paymentIntent,
            };
        }
        catch (error) {
            logger_1.logger.error('Stripe get payment status error:', error);
            return {
                success: false,
                errorCode: error.code || 'QUERY_ERROR',
                errorMessage: error.message,
            };
        }
    }
    verifyWebhookSignature(payload, signature) {
        try {
            this.stripe.webhooks.constructEvent(JSON.stringify(payload), signature, this.config.webhookSecret);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Stripe webhook verification error:', error);
            return false;
        }
    }
    async generateReceipt(paymentId, transactionId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId, {
                expand: ['charges', 'customer'],
            });
            const charge = paymentIntent.charges?.data[0];
            if (!charge) {
                throw new error_1.AppError('No charge found for payment', 400);
            }
            return {
                paymentId,
                receiptNumber: `ST-${charge.id}`,
                issuedAt: new Date(),
                amount: paymentIntent.amount / 100, // Convert from cents
                currency: paymentIntent.currency.toUpperCase(),
                taxAmount: 0, // Stripe doesn't separate tax
                items: [{
                        name: `Order ${paymentIntent.metadata.orderId}`,
                        quantity: 1,
                        unitPrice: paymentIntent.amount / 100,
                        totalPrice: paymentIntent.amount / 100,
                    }],
                customerInfo: {
                    name: charge.billing_details?.name || 'Unknown',
                    email: charge.billing_details?.email || paymentIntent.receipt_email || '',
                    phone: charge.billing_details?.phone || undefined,
                },
                paymentInfo: {
                    method: charge.payment_method_details?.type || 'card',
                    transactionId: paymentIntent.id,
                    approvalNumber: charge.id,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Stripe generate receipt error:', error);
            throw new error_1.AppError('Failed to generate receipt', 500);
        }
    }
    mapRefundReason(reason) {
        const reasonMap = {
            'DUPLICATE_PAYMENT': 'duplicate',
            'FRAUDULENT_TRANSACTION': 'fraudulent',
            'CUSTOMER_REQUEST': 'requested_by_customer',
            'PRODUCT_ISSUE': 'requested_by_customer',
            'OTHER': 'requested_by_customer',
        };
        return reasonMap[reason] || 'requested_by_customer';
    }
    getSupportedMethods() {
        return [
            'card',
            'bank_transfer',
            'alipay',
            'wechat_pay',
            'apple_pay',
            'google_pay',
            'klarna',
            'afterpay',
        ];
    }
    getSupportedCurrencies() {
        // Stripe supports 135+ currencies
        return [
            'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'CAD', 'AUD',
            'NZD', 'HKD', 'SGD', 'SEK', 'DKK', 'PLN', 'NOK', 'CZK',
            'HUF', 'BGN', 'RON', 'TRY', 'ILS', 'CLP', 'PHP', 'MXN',
            'ZAR', 'BRL', 'MYR', 'RUB', 'INR', 'THB', 'IDR', 'TWD',
        ];
    }
}
exports.StripeGateway = StripeGateway;
//# sourceMappingURL=stripeGateway.js.map