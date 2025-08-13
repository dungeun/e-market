import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
export declare class CustomerController {
    static getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static setDefaultAddress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getPaymentMethods(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getPaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static addPaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updatePaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deletePaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static setDefaultPaymentMethod(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getOrderHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static clearWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static getCustomerAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static searchCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static exportData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static adminGetCustomerProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    static adminUpdateCustomerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=customerController.d.ts.map