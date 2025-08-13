"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const error_1 = require("../middleware/error");
const orderService_1 = require("./orderService");
const paymentGatewayFactory_1 = require("./payment/paymentGatewayFactory");
class PaymentService {
    // Initiate payment for order
    async initiatePayment(data) {
        try {
            // Get order details
            const order = await orderService_1.orderService.getOrderById(data.orderId);
            if (!order) {
                throw new error_1.AppError('Order not found', 404);
            }
            if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
                throw new error_1.AppError('Order is not in payable status', 400);
            }
            // Check if payment already exists
            const existingPayment = await database_1.prisma.payment.findFirst({
                where: {
                    orderId: data.orderId,
                    status: {
                        in: ['PENDING', 'PROCESSING', 'COMPLETED'],
                    },
                },
            });
            if (existingPayment) {
                throw new error_1.AppError('Payment already initiated for this order', 409);
            }
            // Get user info
            const user = await database_1.prisma.user.findUnique({
                where: { id: order.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            });
            if (!user) {
                throw new error_1.AppError('User not found', 404);
            }
            // Get payment gateway
            const gateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(data.gateway);
            // Create payment record
            const payment = await database_1.prisma.$transaction(async (tx) => {
                const createdPayment = await tx.payment.create({
                    data: {
                        orderId: data.orderId,
                        amount: order.totals.total,
                        currency: order.totals.currency,
                        status: 'PENDING',
                        method: this.mapGatewayToPaymentMethod(data.gateway),
                        gateway: data.gateway,
                    },
                });
                // Store session data in payment gatewayResponse for now since paymentSession table doesn't exist
                await tx.payment.update({
                    where: { id: createdPayment.id },
                    data: {
                        gatewayResponse: {
                            sessionId: `session_${createdPayment.id}`,
                            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                        },
                    },
                });
                return createdPayment;
            });
            // Initiate payment with gateway
            const paymentRequest = {
                orderId: order.orderNumber,
                amount: order.totals.total,
                currency: order.totals.currency,
                customerName: `${user.firstName} ${user.lastName}`,
                customerEmail: user.email,
                customerPhone: user.phone || undefined,
                returnUrl: data.returnUrl,
                cancelUrl: data.cancelUrl,
                metadata: {
                    paymentId: payment.id,
                    ...data.metadata,
                },
            };
            const gatewayResponse = await gateway.initiatePayment(paymentRequest);
            // Update payment with gateway session data
            await database_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    gatewayResponse: {
                        ...gatewayResponse.sessionData,
                        expiresAt: gatewayResponse.expiresAt?.toISOString(),
                    },
                },
            });
            logger_1.logger.info(`Payment initiated: ${payment.id} for order: ${data.orderId}`);
            return {
                ...gatewayResponse,
                paymentId: payment.id,
            };
        }
        catch (error) {
            logger_1.logger.error('Error initiating payment:', error);
            throw error;
        }
    }
    // Confirm payment after return from gateway
    async confirmPayment(data) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id: data.paymentId },
            include: {
                order: true,
            },
        });
        if (!payment) {
            throw new error_1.AppError('Payment not found', 404);
        }
        if (payment.status !== 'PENDING' && payment.status !== 'PROCESSING') {
            throw new error_1.AppError('Payment is not in confirmable status', 400);
        }
        // Get payment gateway
        const gateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(payment.gateway);
        // Confirm with gateway
        const gatewayResponse = await gateway.confirmPayment(data.transactionId, data.gatewayResponse);
        const updatedPayment = await database_1.prisma.$transaction(async (tx) => {
            if (gatewayResponse.success) {
                // Update payment as completed
                const updated = await tx.payment.update({
                    where: { id: data.paymentId },
                    data: {
                        status: 'COMPLETED',
                        transactionId: gatewayResponse.transactionId,
                        gatewayResponse: gatewayResponse.rawResponse,
                        processedAt: new Date(),
                    },
                });
                // Update order status
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'CONFIRMED',
                    },
                });
                // Create order status history event
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: payment.orderId,
                        status: 'CONFIRMED',
                        notes: `Payment completed via ${payment.gateway}`,
                    },
                });
                return updated;
            }
            else {
                // Update payment as failed
                return await tx.payment.update({
                    where: { id: data.paymentId },
                    data: {
                        status: 'FAILED',
                        gatewayResponse: {
                            errorCode: gatewayResponse.errorCode,
                            errorMessage: gatewayResponse.errorMessage,
                            ...(gatewayResponse.rawResponse || {}),
                        },
                    },
                });
            }
        });
        logger_1.logger.info(`Payment confirmed: ${data.paymentId}, status: ${updatedPayment.status}`);
        return this.getPaymentWithOrder(updatedPayment.id);
    }
    // Cancel payment
    async cancelPayment(id, data) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new error_1.AppError('Payment not found', 404);
        }
        if (!['PENDING', 'PROCESSING'].includes(payment.status)) {
            throw new error_1.AppError('Payment cannot be cancelled in current status', 400);
        }
        // Get payment gateway
        const gateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(payment.gateway);
        // Cancel with gateway if transaction exists
        if (payment.transactionId) {
            await gateway.cancelPayment(payment.transactionId, data.reason);
        }
        await database_1.prisma.$transaction(async (tx) => {
            const updated = await tx.payment.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    gatewayResponse: {
                        cancellationReason: data.reason,
                        cancellationDescription: data.description,
                        cancelledAt: new Date().toISOString(),
                    },
                },
            });
            // Create order status history event
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    status: 'CANCELLED',
                    notes: `Payment cancelled: ${data.reason}`,
                },
            });
            return updated;
        });
        logger_1.logger.info(`Payment cancelled: ${id}, reason: ${data.reason}`);
        return this.getPaymentWithOrder(id);
    }
    // Process refund
    async refundPayment(id, data) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new error_1.AppError('Payment not found', 404);
        }
        if (payment.status !== 'COMPLETED') {
            throw new error_1.AppError('Only completed payments can be refunded', 400);
        }
        if (!payment.transactionId) {
            throw new error_1.AppError('No transaction ID found for refund', 400);
        }
        // Calculate refundable amount
        const maxRefundAmount = payment.amount.toNumber();
        if (data.amount > maxRefundAmount) {
            throw new error_1.AppError(`Maximum refundable amount is ${maxRefundAmount}`, 400);
        }
        // Get payment gateway
        const gateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(payment.gateway);
        // Process refund with gateway
        const refundRequest = {
            paymentId: payment.id,
            transactionId: payment.transactionId,
            amount: data.amount,
            reason: data.description || data.reason,
            metadata: {
                originalPaymentId: payment.id,
                refundReason: data.reason,
            },
        };
        const gatewayResponse = await gateway.refundPayment(refundRequest);
        if (!gatewayResponse.success) {
            throw new error_1.AppError(gatewayResponse.errorMessage || 'Refund failed at payment gateway', 400);
        }
        await database_1.prisma.$transaction(async (tx) => {
            const isFullRefund = data.amount === maxRefundAmount;
            const updated = await tx.payment.update({
                where: { id },
                data: {
                    status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                    gatewayResponse: {
                        refunds: [
                            {
                                amount: data.amount,
                                reason: data.reason,
                                description: data.description,
                                transactionId: gatewayResponse.transactionId,
                                processedAt: new Date().toISOString(),
                            },
                        ],
                    },
                },
            });
            // Update order status if fully refunded
            if (isFullRefund) {
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: {
                        status: 'REFUNDED',
                    },
                });
            }
            // Create order status history event
            await tx.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    status: isFullRefund ? 'REFUNDED' : 'PENDING',
                    notes: isFullRefund
                        ? `Payment fully refunded: ${data.amount} ${payment.currency}`
                        : `Partial refund processed: ${data.amount} ${payment.currency}`,
                },
            });
            return updated;
        });
        logger_1.logger.info(`Payment refunded: ${id}, amount: ${data.amount}`);
        return this.getPaymentWithOrder(id);
    }
    // Get payment by ID
    async getPaymentById(id) {
        return this.getPaymentWithOrder(id);
    }
    // Get payments with filters
    async getPayments(query) {
        const { page, limit, orderId, userId, status, gateway, fromDate, toDate, sortBy, sortOrder } = query;
        const where = {};
        if (orderId) {
            where.orderId = orderId;
        }
        if (userId) {
            where.order = {
                userId,
            };
        }
        if (status) {
            where.status = status;
        }
        if (gateway) {
            where.gateway = gateway;
        }
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) {
                where.createdAt.gte = new Date(fromDate);
            }
            if (toDate) {
                where.createdAt.lte = new Date(toDate);
            }
        }
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            database_1.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    order: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            }),
            database_1.prisma.payment.count({ where }),
        ]);
        const paymentsWithOrder = payments.map(payment => this.formatPaymentWithOrder(payment));
        return {
            payments: paymentsWithOrder,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // Save payment method
    async savePaymentMethod(userId, data) {
        // If setting as default, unset other defaults
        if (data.isDefault) {
            await database_1.prisma.paymentMethod.updateMany({
                where: {
                    userId,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }
        const paymentMethod = await database_1.prisma.paymentMethod.create({
            data: {
                userId,
                type: this.mapToValidPaymentMethodType(data.type),
                provider: data.provider,
                last4: data.last4,
                expiryMonth: data.expiryMonth,
                expiryYear: data.expiryYear,
                brand: data.brand,
                isDefault: data.isDefault,
            },
        });
        logger_1.logger.info(`Payment method saved for user: ${userId}`);
        return this.formatPaymentMethod(paymentMethod);
    }
    // Get user payment methods
    async getUserPaymentMethods(userId) {
        const methods = await database_1.prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return methods.map(method => this.formatPaymentMethod(method));
    }
    // Delete payment method
    async deletePaymentMethod(id, userId) {
        const method = await database_1.prisma.paymentMethod.findFirst({
            where: { id, userId },
        });
        if (!method) {
            throw new error_1.AppError('Payment method not found', 404);
        }
        await database_1.prisma.paymentMethod.delete({
            where: { id },
        });
        logger_1.logger.info(`Payment method deleted: ${id}`);
    }
    // Generate payment receipt
    async generateReceipt(paymentId) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                        shippingAddress: true,
                        billingAddress: true,
                        user: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new error_1.AppError('Payment not found', 404);
        }
        if (payment.status !== 'COMPLETED' || !payment.transactionId) {
            throw new error_1.AppError('Receipt only available for completed payments', 400);
        }
        // Get gateway to generate receipt
        const gateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(payment.gateway);
        return gateway.generateReceipt(payment.id, payment.transactionId);
    }
    // Get payment analytics
    async getPaymentAnalytics(userId) {
        const where = userId
            ? { order: { userId } }
            : {};
        const [totalPayments, paymentStats] = await Promise.all([
            database_1.prisma.payment.count({ where }),
            database_1.prisma.payment.aggregate({
                where,
                _sum: {
                    amount: true,
                },
                _avg: {
                    amount: true,
                },
            }),
        ]);
        // Get payments by status
        const paymentsByStatus = await database_1.prisma.payment.groupBy({
            by: ['status'],
            where,
            _count: {
                status: true,
            },
            _sum: {
                amount: true,
            },
        });
        // Get payments by gateway
        const paymentsByGateway = await database_1.prisma.payment.groupBy({
            by: ['gateway'],
            where,
            _count: {
                gateway: true,
            },
            _sum: {
                amount: true,
            },
        });
        // Calculate success rates by gateway
        const gatewayStats = await Promise.all(paymentsByGateway.map(async (gw) => {
            const successCount = await database_1.prisma.payment.count({
                where: {
                    ...where,
                    gateway: gw.gateway,
                    status: 'COMPLETED',
                },
            });
            return {
                gateway: gw.gateway,
                count: gw._count.gateway,
                amount: gw._sum.amount?.toNumber() || 0,
                successRate: gw._count.gateway > 0
                    ? (successCount / gw._count.gateway) * 100
                    : 0,
            };
        }));
        // Get recent payments
        const recentPayments = await database_1.prisma.payment.findMany({
            where,
            take: 10,
            orderBy: { createdAt: 'desc' },
        });
        return {
            totalPayments,
            totalAmount: paymentStats._sum.amount?.toNumber() || 0,
            averagePaymentAmount: paymentStats._avg.amount?.toNumber() || 0,
            paymentsByStatus: paymentsByStatus.map(ps => ({
                status: ps.status,
                count: ps._count.status,
                amount: ps._sum.amount?.toNumber() || 0,
            })),
            paymentsByGateway: gatewayStats,
            recentPayments: recentPayments.map(payment => this.formatPaymentDetails(payment)),
        };
    }
    // Process webhook from payment gateway
    async processWebhook(gateway, payload, signature) {
        const paymentGateway = paymentGatewayFactory_1.PaymentGatewayFactory.getGateway(gateway);
        // Verify webhook signature
        if (signature && !paymentGateway.verifyWebhookSignature(payload, signature)) {
            throw new error_1.AppError('Invalid webhook signature', 401);
        }
        // Process webhook based on gateway type
        // Implementation depends on specific gateway webhook format
        logger_1.logger.info(`Webhook processed for gateway: ${gateway}`);
    }
    // Private helper methods
    async getPaymentWithOrder(paymentId) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            throw new error_1.AppError('Payment not found', 404);
        }
        return this.formatPaymentWithOrder(payment);
    }
    formatPaymentWithOrder(payment) {
        return {
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount.toNumber(),
            currency: payment.currency,
            status: payment.status,
            gateway: payment.gateway,
            method: payment.method || undefined,
            transactionId: payment.transactionId || undefined,
            gatewayResponse: payment.gatewayResponse,
            processedAt: payment.processedAt || undefined,
            metadata: payment.metadata,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            order: {
                id: payment.order.id,
                orderNumber: payment.order.orderNumber,
                userId: payment.order.userId,
                total: payment.order.total.toNumber(),
                status: payment.order.status,
                customer: {
                    id: payment.order.user.id,
                    firstName: payment.order.user.firstName || '',
                    lastName: payment.order.user.lastName || '',
                    email: payment.order.user.email,
                },
            },
        };
    }
    formatPaymentDetails(payment) {
        return {
            id: payment.id,
            orderId: payment.orderId,
            amount: payment.amount.toNumber(),
            currency: payment.currency,
            status: payment.status,
            gateway: payment.gateway,
            method: payment.method || undefined,
            transactionId: payment.transactionId || undefined,
            gatewayResponse: payment.gatewayResponse,
            processedAt: payment.processedAt || undefined,
            metadata: payment.metadata,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
    formatPaymentMethod(method) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const isExpired = method.expiryYear && method.expiryMonth
            ? method.expiryYear < currentYear ||
                (method.expiryYear === currentYear && method.expiryMonth < currentMonth)
            : false;
        return {
            id: method.id,
            userId: method.userId,
            type: method.type,
            provider: method.provider,
            last4: method.last4 || undefined,
            expiryMonth: method.expiryMonth || undefined,
            expiryYear: method.expiryYear || undefined,
            brand: method.brand || undefined,
            isDefault: method.isDefault,
            isExpired,
            createdAt: method.createdAt,
            updatedAt: method.updatedAt,
        };
    }
    /**
     * Map gateway name to PaymentMethodType enum
     */
    mapGatewayToPaymentMethod(gateway) {
        switch (gateway.toUpperCase()) {
            case 'PAYPAL':
                return 'PAYPAL';
            case 'STRIPE':
                return 'CREDIT_CARD';
            case 'APPLE_PAY':
                return 'APPLE_PAY';
            case 'GOOGLE_PAY':
                return 'GOOGLE_PAY';
            case 'BANK_TRANSFER':
                return 'BANK_TRANSFER';
            default:
                return 'CREDIT_CARD';
        }
    }
    /**
     * Map any payment method type to valid PaymentMethodType enum
     */
    mapToValidPaymentMethodType(type) {
        switch (type.toUpperCase()) {
            case 'CREDIT_CARD':
                return 'CREDIT_CARD';
            case 'DEBIT_CARD':
                return 'DEBIT_CARD';
            case 'PAYPAL':
                return 'PAYPAL';
            case 'BANK_TRANSFER':
                return 'BANK_TRANSFER';
            case 'APPLE_PAY':
                return 'APPLE_PAY';
            case 'GOOGLE_PAY':
                return 'GOOGLE_PAY';
            case 'DIGITAL_WALLET': // Map DIGITAL_WALLET to APPLE_PAY
                return 'APPLE_PAY';
            case 'CRYPTOCURRENCY':
                return 'CRYPTOCURRENCY';
            default:
                return 'CREDIT_CARD';
        }
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map