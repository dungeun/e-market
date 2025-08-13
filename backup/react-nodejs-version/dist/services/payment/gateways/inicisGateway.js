"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InicisGateway = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const paymentGateway_1 = require("../paymentGateway");
const error_1 = require("../../../middleware/error");
const logger_1 = require("../../../utils/logger");
class InicisGateway extends paymentGateway_1.PaymentGateway {
    constructor(config) {
        super(config);
        this.validateConfig();
        this.apiUrl = config.testMode
            ? 'https://stgstdpay.inicis.com'
            : 'https://stdpay.inicis.com';
    }
    validateConfig() {
        if (!this.config.mid) {
            throw new Error('Inicis MID is required');
        }
        if (!this.config.signKey) {
            throw new Error('Inicis sign key is required');
        }
    }
    generateSignature(params) {
        // Inicis signature generation
        const signData = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return crypto_1.default
            .createHash('sha256')
            .update(signData + this.config.signKey)
            .digest('hex');
    }
    generateTimestamp() {
        const now = new Date();
        return now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    }
    async initiatePayment(request) {
        try {
            const timestamp = this.generateTimestamp();
            const moid = this.generateOrderId(request.orderId);
            const paymentData = {
                mid: this.config.mid,
                oid: moid,
                amt: this.formatAmount(request.amount, request.currency),
                goodsName: `Order ${request.orderId}`,
                buyerName: request.customerName,
                buyerEmail: request.customerEmail,
                buyerTel: request.customerPhone || '',
                timestamp,
                returnUrl: request.returnUrl,
                closeUrl: request.cancelUrl,
                mKey: this.generateSignature({
                    mid: this.config.mid,
                    oid: moid,
                    amt: this.formatAmount(request.amount, request.currency),
                    timestamp,
                }),
            };
            // Inicis uses form-based payment page
            // Return session data for frontend to create payment form
            const paymentId = `inicis_${moid}`;
            return {
                paymentId,
                sessionData: {
                    formUrl: `${this.apiUrl}/stdpay/INIStdPay.jsp`,
                    formData: paymentData,
                },
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            };
        }
        catch (error) {
            logger_1.logger.error('Inicis initiate payment error:', error);
            throw new error_1.AppError('Failed to initiate payment', 500);
        }
    }
    async confirmPayment(_paymentId, data) {
        try {
            const { authToken, authUrl } = data;
            // Verify payment with auth token
            const response = await axios_1.default.post(authUrl, {
                mid: this.config.mid,
                authToken,
                timestamp: this.generateTimestamp(),
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.resultCode === '0000') {
                return {
                    success: true,
                    transactionId: response.data.tid,
                    approvalNumber: response.data.authCode,
                    rawResponse: response.data,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: response.data.resultCode,
                    errorMessage: response.data.resultMsg,
                    rawResponse: response.data,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('Inicis confirm payment error:', error);
            return {
                success: false,
                errorCode: 'CONFIRM_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async cancelPayment(paymentId, _reason) {
        try {
            // Inicis doesn't support direct payment cancellation before completion
            // This would typically be handled by letting the payment expire
            return {
                success: true,
                transactionId: paymentId,
            };
        }
        catch (error) {
            logger_1.logger.error('Inicis cancel payment error:', error);
            return {
                success: false,
                errorCode: 'CANCEL_ERROR',
                errorMessage: 'Failed to cancel payment',
            };
        }
    }
    async refundPayment(request) {
        try {
            const timestamp = this.generateTimestamp();
            const refundData = {
                type: 'Refund',
                mid: this.config.mid,
                tid: request.transactionId,
                msg: request.reason,
                amt: this.formatAmount(request.amount, 'KRW'),
                timestamp,
            };
            const refundDataWithHash = {
                ...refundData,
                hashData: this.generateSignature(refundData)
            };
            const response = await axios_1.default.post(`${this.apiUrl}/api/refund.jsp`, new URLSearchParams(refundDataWithHash), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.resultCode === '00') {
                return {
                    success: true,
                    transactionId: response.data.tid,
                    approvalNumber: response.data.cancelNum,
                    rawResponse: response.data,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: response.data.resultCode,
                    errorMessage: response.data.resultMsg,
                    rawResponse: response.data,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('Inicis refund payment error:', error);
            return {
                success: false,
                errorCode: 'REFUND_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async getPaymentStatus(transactionId) {
        try {
            const timestamp = this.generateTimestamp();
            const queryData = {
                type: 'Query',
                mid: this.config.mid,
                tid: transactionId,
                timestamp,
            };
            const queryDataWithHash = {
                ...queryData,
                hashData: this.generateSignature(queryData)
            };
            const response = await axios_1.default.post(`${this.apiUrl}/api/inquire.jsp`, new URLSearchParams(queryDataWithHash), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            if (response.data.resultCode === '00') {
                return {
                    success: true,
                    transactionId: response.data.tid,
                    approvalNumber: response.data.authCode,
                    rawResponse: response.data,
                };
            }
            else {
                return {
                    success: false,
                    errorCode: response.data.resultCode,
                    errorMessage: response.data.resultMsg,
                    rawResponse: response.data,
                };
            }
        }
        catch (error) {
            logger_1.logger.error('Inicis get payment status error:', error);
            return {
                success: false,
                errorCode: 'QUERY_ERROR',
                errorMessage: error.message,
            };
        }
    }
    verifyWebhookSignature(payload, signature) {
        try {
            // Inicis webhook verification
            const expectedSignature = this.generateSignature(payload);
            return signature === expectedSignature;
        }
        catch (error) {
            logger_1.logger.error('Inicis webhook verification error:', error);
            return false;
        }
    }
    async generateReceipt(paymentId, transactionId) {
        try {
            const paymentData = await this.getPaymentStatus(transactionId);
            if (!paymentData.success || !paymentData.rawResponse) {
                throw new error_1.AppError('Failed to get payment data for receipt', 400);
            }
            const payment = paymentData.rawResponse;
            return {
                paymentId,
                receiptNumber: `IN-${transactionId}`,
                issuedAt: new Date(),
                amount: parseInt(payment.amt),
                currency: 'KRW',
                taxAmount: parseInt(payment.tax || '0'),
                items: [{
                        name: payment.goodsName || 'Order',
                        quantity: 1,
                        unitPrice: parseInt(payment.amt),
                        totalPrice: parseInt(payment.amt),
                    }],
                customerInfo: {
                    name: payment.buyerName || 'Unknown',
                    email: payment.buyerEmail || '',
                    phone: payment.buyerTel,
                },
                paymentInfo: {
                    method: payment.payMethod,
                    transactionId,
                    approvalNumber: payment.authCode,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Inicis generate receipt error:', error);
            throw new error_1.AppError('Failed to generate receipt', 500);
        }
    }
    getSupportedMethods() {
        return [
            'Card', // 신용카드
            'DirectBank', // 실시간계좌이체
            'VBank', // 가상계좌
            'HPP', // 휴대폰
            'Culture', // 문화상품권
            'HPMN', // 해피머니
            'BCSH', // 도서문화상품권
            'POINT', // 포인트
            'EasyPay', // 간편결제
        ];
    }
    getSupportedCurrencies() {
        return ['KRW']; // Inicis primarily supports KRW
    }
}
exports.InicisGateway = InicisGateway;
//# sourceMappingURL=inicisGateway.js.map