/**
 * Payment Security Service for PCI DSS compliance
 */
export declare class PaymentSecurityService {
    /**
     * Tokenize payment card (PCI DSS requirement)
     */
    tokenizeCard(cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv?: string;
    }): Promise<{
        token: string;
        last4: string;
        brand: string;
        fingerprint: string;
    }>;
    /**
     * Validate card number using Luhn algorithm
     */
    private isValidCardNumber;
    /**
     * Detect card brand
     */
    private detectCardBrand;
    /**
     * Validate payment request for fraud
     */
    validatePaymentRequest(data: {
        userId: string;
        amount: number;
        currency: string;
        ipAddress: string;
        userAgent: string;
        cardToken?: string;
    }): Promise<{
        isValid: boolean;
        riskScore: number;
        reasons: string[];
    }>;
    /**
     * Secure payment data for transmission
     */
    prepareSecurePaymentData(paymentData: any): Promise<{
        secureData: any;
        signature: string;
    }>;
    /**
     * Monitor suspicious payment patterns
     */
    monitorPaymentPatterns(userId: string): Promise<void>;
    /**
     * Create security alert
     */
    private createSecurityAlert;
    /**
     * Clean up expired payment tokens
     */
    cleanupExpiredTokens(): Promise<number>;
    /**
     * Generate PCI compliance report
     */
    generatePCIComplianceReport(): Promise<{
        compliant: boolean;
        issues: string[];
        recommendations: string[];
    }>;
}
export declare const paymentSecurityService: PaymentSecurityService;
//# sourceMappingURL=paymentSecurityService.d.ts.map