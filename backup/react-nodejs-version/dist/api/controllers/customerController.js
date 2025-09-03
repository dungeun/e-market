"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customerService_1 = require("../../services/customerService");
const error_1 = require("../../middleware/error");
const customer_1 = require("../../types/customer");
const zod_1 = require("zod");
const auditLogService_1 = require("../../services/auditLogService");
const database_1 = require("../../utils/database");
class CustomerController {
    // Profile Management
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const profile = await customerService_1.CustomerService.getProfile(req.user.id);
            res.json(profile);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const validatedData = customer_1.UpdateCustomerProfileSchema.parse(req.body);
            const updated = await customerService_1.CustomerService.updateProfile(req.user.id, validatedData);
            res.json({
                message: 'Profile updated successfully',
                profile: updated,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    // Address Management
    static async getAddresses(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const addresses = await customerService_1.CustomerService.getAddresses(req.user.id);
            res.json(addresses);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAddress(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { addressId } = req.params;
            const address = await customerService_1.CustomerService.getAddress(req.user.id, addressId);
            res.json(address);
        }
        catch (error) {
            next(error);
        }
    }
    static async addAddress(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const validatedData = customer_1.CustomerAddressSchema.parse(req.body);
            const address = await customerService_1.CustomerService.addAddress(req.user.id, validatedData);
            res.status(201).json({
                message: 'Address added successfully',
                address,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async updateAddress(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { addressId } = req.params;
            const validatedData = customer_1.CustomerAddressSchema.partial().parse(req.body);
            const updated = await customerService_1.CustomerService.updateAddress(req.user.id, addressId, validatedData);
            res.json({
                message: 'Address updated successfully',
                address: updated,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async deleteAddress(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { addressId } = req.params;
            await customerService_1.CustomerService.deleteAddress(req.user.id, addressId);
            res.json({
                message: 'Address deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async setDefaultAddress(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { addressId } = req.params;
            const updated = await customerService_1.CustomerService.setDefaultAddress(req.user.id, addressId);
            res.json({
                message: 'Default address updated successfully',
                address: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Payment Method Management
    static async getPaymentMethods(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const methods = await customerService_1.CustomerService.getPaymentMethods(req.user.id);
            res.json(methods);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPaymentMethod(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { paymentMethodId } = req.params;
            const method = await customerService_1.CustomerService.getPaymentMethod(req.user.id, paymentMethodId);
            res.json(method);
        }
        catch (error) {
            next(error);
        }
    }
    static async addPaymentMethod(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const validatedData = customer_1.CustomerPaymentMethodSchema.parse(req.body);
            const method = await customerService_1.CustomerService.addPaymentMethod(req.user.id, validatedData);
            res.status(201).json({
                message: 'Payment method added successfully',
                paymentMethod: method,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async updatePaymentMethod(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { paymentMethodId } = req.params;
            const validatedData = customer_1.UpdatePaymentMethodSchema.parse(req.body);
            const updated = await customerService_1.CustomerService.updatePaymentMethod(req.user.id, paymentMethodId, validatedData);
            res.json({
                message: 'Payment method updated successfully',
                paymentMethod: updated,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async deletePaymentMethod(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { paymentMethodId } = req.params;
            await customerService_1.CustomerService.deletePaymentMethod(req.user.id, paymentMethodId);
            res.json({
                message: 'Payment method deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async setDefaultPaymentMethod(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { paymentMethodId } = req.params;
            const updated = await customerService_1.CustomerService.setDefaultPaymentMethod(req.user.id, paymentMethodId);
            res.json({
                message: 'Default payment method updated successfully',
                paymentMethod: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Order History
    static async getOrderHistory(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await customerService_1.CustomerService.getOrderHistory(req.user.id, page, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Wishlist Management
    static async getWishlist(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const query = customer_1.WishlistQuerySchema.parse(req.query);
            const result = await customerService_1.CustomerService.getWishlist(req.user.id, query);
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async addToWishlist(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { productId } = customer_1.AddToWishlistSchema.parse(req.body);
            const item = await customerService_1.CustomerService.addToWishlist(req.user.id, productId);
            res.status(201).json({
                message: 'Product added to wishlist',
                item,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    static async removeFromWishlist(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { productId } = req.params;
            await customerService_1.CustomerService.removeFromWishlist(req.user.id, productId);
            res.json({
                message: 'Product removed from wishlist',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async clearWishlist(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const result = await customerService_1.CustomerService.clearWishlist(req.user.id);
            res.json({
                message: 'Wishlist cleared successfully',
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Customer Preferences
    static async getPreferences(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const preferences = await customerService_1.CustomerService.getPreferences(req.user.id);
            res.json(preferences);
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePreferences(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const validatedData = customer_1.CustomerPreferencesSchema.partial().parse(req.body);
            const updated = await customerService_1.CustomerService.updatePreferences(req.user.id, validatedData);
            res.json({
                message: 'Preferences updated successfully',
                preferences: updated,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    // Customer Activity
    static async getActivity(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const query = customer_1.CustomerActivityQuerySchema.parse(req.query);
            const result = await customerService_1.CustomerService.getActivity(req.user.id, query);
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    // Customer Analytics (Admin only)
    static async getCustomerAnalytics(req, res, next) {
        try {
            if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
                throw new error_1.AppError('Admin access required', 403);
            }
            const { customerId } = req.params;
            const query = customer_1.CustomerAnalyticsQuerySchema.parse({
                customerId,
                ...req.query
            });
            const startDate = query.startDate ? new Date(query.startDate) : undefined;
            const endDate = query.endDate ? new Date(query.endDate) : undefined;
            const analytics = await customerService_1.CustomerService.getAnalytics(customerId, startDate, endDate);
            res.json(analytics);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    // Customer Search (Admin only)
    static async searchCustomers(req, res, next) {
        try {
            if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
                throw new error_1.AppError('Admin access required', 403);
            }
            const query = customer_1.CustomerSearchSchema.parse(req.query);
            const result = await customerService_1.CustomerService.searchCustomers(query);
            res.json(result);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return next(new error_1.AppError('Validation error', 400, true, 'VALIDATION_ERROR', undefined, error.errors));
            }
            next(error);
        }
    }
    // Customer Data Export (GDPR)
    static async exportData(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const data = await customerService_1.CustomerService.exportCustomerData(req.user.id);
            // Set headers for file download
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="customer-data-${req.user.id}.json"`);
            res.json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // Account Deletion (GDPR)
    static async deleteAccount(req, res, next) {
        try {
            if (!req.user) {
                throw new error_1.AppError('Authentication required', 401);
            }
            const { password } = req.body;
            if (!password) {
                throw new error_1.AppError('Password confirmation required', 400);
            }
            await customerService_1.CustomerService.deleteAccount(req.user.id, password);
            res.json({
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Admin: View customer profile
    static async adminGetCustomerProfile(req, res, next) {
        try {
            if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
                throw new error_1.AppError('Admin access required', 403);
            }
            const { customerId } = req.params;
            const profile = await customerService_1.CustomerService.getProfile(customerId);
            res.json(profile);
        }
        catch (error) {
            next(error);
        }
    }
    // Admin: Update customer status
    static async adminUpdateCustomerStatus(req, res, next) {
        try {
            if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
                throw new error_1.AppError('Admin access required', 403);
            }
            const { customerId } = req.params;
            const { isActive, reason } = req.body;
            if (typeof isActive !== 'boolean') {
                throw new error_1.AppError('isActive must be a boolean', 400);
            }
            await database_1.query({
                where: { id: customerId },
                data: { isActive },
            });
            await auditLogService_1.auditLogService.logAdminAction(isActive ? 'ACTIVATE_CUSTOMER' : 'DEACTIVATE_CUSTOMER', req.user.id, 'user', customerId, req, { reason, adminId: req.user.id });
            res.json({
                message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CustomerController = CustomerController;
//# sourceMappingURL=customerController.js.map