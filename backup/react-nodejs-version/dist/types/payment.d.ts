import { z } from 'zod';
export declare const InitiatePaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    gateway: z.ZodEnum<["TOSS_PAYMENTS", "INICIS", "KCP", "STRIPE", "PAYPAL"]>;
    savePaymentMethod: z.ZodDefault<z.ZodBoolean>;
    returnUrl: z.ZodString;
    cancelUrl: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    gateway: "PAYPAL" | "TOSS_PAYMENTS" | "INICIS" | "KCP" | "STRIPE";
    orderId: string;
    savePaymentMethod: boolean;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any> | undefined;
    paymentMethodId?: string | undefined;
}, {
    gateway: "PAYPAL" | "TOSS_PAYMENTS" | "INICIS" | "KCP" | "STRIPE";
    orderId: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any> | undefined;
    paymentMethodId?: string | undefined;
    savePaymentMethod?: boolean | undefined;
}>;
export declare const ConfirmPaymentSchema: z.ZodObject<{
    paymentId: z.ZodString;
    transactionId: z.ZodString;
    gatewayResponse: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    transactionId: string;
    gatewayResponse: Record<string, any>;
    paymentId: string;
}, {
    transactionId: string;
    gatewayResponse: Record<string, any>;
    paymentId: string;
}>;
export declare const CancelPaymentSchema: z.ZodObject<{
    reason: z.ZodEnum<["CUSTOMER_REQUEST", "FRAUD_DETECTED", "INSUFFICIENT_FUNDS", "TECHNICAL_ERROR", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "CUSTOMER_REQUEST" | "FRAUD_DETECTED" | "OTHER" | "INSUFFICIENT_FUNDS" | "TECHNICAL_ERROR";
    description?: string | undefined;
}, {
    reason: "CUSTOMER_REQUEST" | "FRAUD_DETECTED" | "OTHER" | "INSUFFICIENT_FUNDS" | "TECHNICAL_ERROR";
    description?: string | undefined;
}>;
export declare const RefundPaymentSchema: z.ZodObject<{
    amount: z.ZodNumber;
    reason: z.ZodEnum<["CUSTOMER_REQUEST", "DUPLICATE_PAYMENT", "FRAUDULENT_TRANSACTION", "PRODUCT_ISSUE", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    reason: "CUSTOMER_REQUEST" | "OTHER" | "DUPLICATE_PAYMENT" | "FRAUDULENT_TRANSACTION" | "PRODUCT_ISSUE";
    description?: string | undefined;
}, {
    amount: number;
    reason: "CUSTOMER_REQUEST" | "OTHER" | "DUPLICATE_PAYMENT" | "FRAUDULENT_TRANSACTION" | "PRODUCT_ISSUE";
    description?: string | undefined;
}>;
export declare const PaymentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    orderId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]>>;
    gateway: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "amount", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "status" | "createdAt" | "amount";
    status?: "PENDING" | "PROCESSING" | "CANCELLED" | "REFUNDED" | "COMPLETED" | "FAILED" | "PARTIALLY_REFUNDED" | undefined;
    userId?: string | undefined;
    gateway?: string | undefined;
    orderId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: "PENDING" | "PROCESSING" | "CANCELLED" | "REFUNDED" | "COMPLETED" | "FAILED" | "PARTIALLY_REFUNDED" | undefined;
    userId?: string | undefined;
    gateway?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "status" | "createdAt" | "amount" | undefined;
    orderId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const PaymentParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SavePaymentMethodSchema: z.ZodObject<{
    type: z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "DIGITAL_WALLET"]>;
    provider: z.ZodString;
    token: z.ZodString;
    last4: z.ZodOptional<z.ZodString>;
    expiryMonth: z.ZodOptional<z.ZodNumber>;
    expiryYear: z.ZodOptional<z.ZodNumber>;
    brand: z.ZodOptional<z.ZodString>;
    holderName: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";
    token: string;
    isDefault: boolean;
    provider: string;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
    holderName?: string | undefined;
}, {
    type: "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";
    token: string;
    provider: string;
    isDefault?: boolean | undefined;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
    holderName?: string | undefined;
}>;
export declare const WebhookPayloadSchema: z.ZodObject<{
    gateway: z.ZodString;
    event: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    event: string;
    data: Record<string, any>;
    gateway: string;
    signature?: string | undefined;
}, {
    event: string;
    data: Record<string, any>;
    gateway: string;
    signature?: string | undefined;
}>;
export declare const TossPaymentsRequestSchema: z.ZodObject<{
    amount: z.ZodNumber;
    orderId: z.ZodString;
    orderName: z.ZodString;
    successUrl: z.ZodString;
    failUrl: z.ZodString;
    customerName: z.ZodOptional<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerMobilePhone: z.ZodOptional<z.ZodString>;
    taxFreeAmount: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    metadata?: Record<string, any> | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    customerMobilePhone?: string | undefined;
    taxFreeAmount?: number | undefined;
}, {
    amount: number;
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    metadata?: Record<string, any> | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    customerMobilePhone?: string | undefined;
    taxFreeAmount?: number | undefined;
}>;
export declare const InicisRequestSchema: z.ZodObject<{
    amt: z.ZodNumber;
    mid: z.ZodString;
    oid: z.ZodString;
    goodsName: z.ZodString;
    buyerName: z.ZodString;
    buyerEmail: z.ZodString;
    buyerTel: z.ZodString;
    returnUrl: z.ZodString;
    closeUrl: z.ZodString;
    gopaymethod: z.ZodOptional<z.ZodString>;
    acceptmethod: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    returnUrl: string;
    amt: number;
    mid: string;
    oid: string;
    goodsName: string;
    buyerName: string;
    buyerEmail: string;
    buyerTel: string;
    closeUrl: string;
    gopaymethod?: string | undefined;
    acceptmethod?: string | undefined;
}, {
    returnUrl: string;
    amt: number;
    mid: string;
    oid: string;
    goodsName: string;
    buyerName: string;
    buyerEmail: string;
    buyerTel: string;
    closeUrl: string;
    gopaymethod?: string | undefined;
    acceptmethod?: string | undefined;
}>;
export declare const KCPRequestSchema: z.ZodObject<{
    site_cd: z.ZodString;
    ordr_idxx: z.ZodString;
    good_name: z.ZodString;
    good_mny: z.ZodNumber;
    buyr_name: z.ZodString;
    buyr_mail: z.ZodString;
    buyr_tel1: z.ZodString;
    buyr_tel2: z.ZodString;
    ret_url: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    site_cd: string;
    ordr_idxx: string;
    good_name: string;
    good_mny: number;
    buyr_name: string;
    buyr_mail: string;
    buyr_tel1: string;
    buyr_tel2: string;
    ret_url: string;
}, {
    site_cd: string;
    ordr_idxx: string;
    good_name: string;
    good_mny: number;
    buyr_name: string;
    buyr_mail: string;
    buyr_tel1: string;
    buyr_tel2: string;
    ret_url: string;
    currency?: string | undefined;
}>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type CancelPaymentInput = z.infer<typeof CancelPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof RefundPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof PaymentQuerySchema>;
export type PaymentParamsInput = z.infer<typeof PaymentParamsSchema>;
export type SavePaymentMethodInput = z.infer<typeof SavePaymentMethodSchema>;
export type WebhookPayloadInput = z.infer<typeof WebhookPayloadSchema>;
export type TossPaymentsRequestInput = z.infer<typeof TossPaymentsRequestSchema>;
export type InicisRequestInput = z.infer<typeof InicisRequestSchema>;
export type KCPRequestInput = z.infer<typeof KCPRequestSchema>;
export interface PaymentDetails {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    gateway: string;
    method?: string;
    transactionId?: string;
    gatewayResponse?: Record<string, any>;
    processedAt?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaymentWithOrder extends PaymentDetails {
    order: {
        id: string;
        orderNumber: string;
        userId: string;
        total: number;
        status: string;
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
}
export interface PaymentMethod {
    id: string;
    userId: string;
    type: string;
    provider: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    brand?: string;
    holderName?: string;
    isDefault: boolean;
    isExpired: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaymentGatewayConfig {
    gateway: string;
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    testMode: boolean;
    webhookSecret?: string;
    supportedMethods: string[];
    supportedCurrencies: string[];
}
export interface PaymentSession {
    id: string;
    paymentId: string;
    gateway: string;
    sessionData: Record<string, any>;
    expiresAt: Date;
    createdAt: Date;
}
export interface PaymentReceipt {
    paymentId: string;
    receiptNumber: string;
    issuedAt: Date;
    amount: number;
    currency: string;
    taxAmount: number;
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    customerInfo: {
        name: string;
        email: string;
        phone?: string;
    };
    paymentInfo: {
        method: string;
        transactionId: string;
        approvalNumber?: string;
    };
}
export interface PaymentAnalytics {
    totalPayments: number;
    totalAmount: number;
    averagePaymentAmount: number;
    paymentsByStatus: Array<{
        status: string;
        count: number;
        amount: number;
    }>;
    paymentsByGateway: Array<{
        gateway: string;
        count: number;
        amount: number;
        successRate: number;
    }>;
    recentPayments: PaymentDetails[];
}
export interface GatewayResponse {
    success: boolean;
    transactionId?: string;
    approvalNumber?: string;
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: Record<string, any>;
}
export interface PaymentInitiationResponse {
    paymentId: string;
    paymentUrl?: string;
    paymentKey?: string;
    sessionData?: Record<string, any>;
    expiresAt: Date;
}
export interface PaymentEvent {
    type: 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED' | 'PAYMENT_REFUNDED';
    paymentId: string;
    orderId: string;
    userId: string;
    data: any;
    timestamp: Date;
}
//# sourceMappingURL=payment.d.ts.map