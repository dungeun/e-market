/// <reference types="node" />
/// <reference types="node" />
/**
 * Service for handling sensitive data encryption (PCI DSS & GDPR compliance)
 */
export declare class EncryptionService {
    /**
     * Encrypt payment method data before storing
     */
    encryptPaymentMethod(data: {
        cardNumber?: string;
        cvv?: string;
        accountNumber?: string;
        routingNumber?: string;
    }): Promise<{
        encryptedData: Record<string, string>;
        maskedData: Record<string, string>;
    }>;
    /**
     * Decrypt payment method data
     */
    decryptPaymentMethod(encryptedData: Record<string, string>): Promise<Record<string, string>>;
    /**
     * Encrypt personal data (GDPR requirement)
     */
    encryptPersonalData(data: {
        email?: string;
        phone?: string;
        ssn?: string;
        taxId?: string;
        dateOfBirth?: string;
        passport?: string;
    }): Promise<Record<string, string>>;
    /**
     * Encrypt sensitive order data
     */
    encryptOrderData(orderId: string): Promise<void>;
    /**
     * Anonymize user data (GDPR right to be forgotten)
     */
    anonymizeUserData(userId: string): Promise<void>;
    /**
     * Export user data (GDPR right to data portability)
     */
    exportUserData(userId: string): Promise<any>;
    /**
     * Check if data needs re-encryption (key rotation)
     */
    checkReencryptionNeeded(_encryptedData: string, encryptionVersion?: string): Promise<boolean>;
    /**
     * Re-encrypt data with new key (key rotation)
     */
    reencryptData(oldEncryptedData: string, oldKeyVersion: string): Promise<string>;
    /**
     * Encrypt file/document
     */
    encryptFile(buffer: Buffer, metadata: Record<string, any>): Promise<{
        encryptedBuffer: Buffer;
        encryptedMetadata: string;
    }>;
    /**
     * Generate data retention report
     */
    generateDataRetentionReport(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        dataToBeDeleted: number;
        oldestData: Date | null;
    }>;
}
export declare const encryptionService: EncryptionService;
//# sourceMappingURL=encryptionService.d.ts.map