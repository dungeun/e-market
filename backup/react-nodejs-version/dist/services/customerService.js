"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const error_1 = require("../middleware/error");
class CustomerService {
    // Profile Management
    static async getProfile(userId) {
        try {
            const user = await database_1.query({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
            });
            if (!user) {
                throw new error_1.AppError('User not found', 404);
            }
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error fetching customer profile:', error);
            throw error;
        }
    }
    static async updateProfile(userId, data) {
        try {
            const updated = await database_1.query({
                where: { id: userId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error updating customer profile:', error);
            throw error;
        }
    }
    // Address Management
    static async getAddresses(userId) {
        return database_1.query({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    static async getAddress(userId, addressId) {
        const address = await database_1.query({
            where: {
                id: addressId,
                userId,
            },
        });
        if (!address) {
            throw new error_1.AppError('Address not found', 404);
        }
        return address;
    }
    static async addAddress(userId, data) {
        try {
            // If this is set as default, unset other defaults
            if (data.isDefault) {
                await database_1.queryMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const address = await database_1.query({
                data: {
                    ...data,
                    userId,
                },
            });
            return address;
        }
        catch (error) {
            logger_1.logger.error('Error adding customer address:', error);
            throw error;
        }
    }
    static async updateAddress(userId, addressId, data) {
        try {
            // Verify ownership
            const existing = await this.getAddress(userId, addressId);
            // If setting as default, unset others
            if (data.isDefault && !existing.isDefault) {
                await database_1.queryMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const updated = await database_1.query({
                where: { id: addressId },
                data,
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error updating customer address:', error);
            throw error;
        }
    }
    static async deleteAddress(userId, addressId) {
        try {
            // Verify ownership
            await this.getAddress(userId, addressId);
            // Check if address is used in any pending orders
            const pendingOrders = await database_1.query({
                where: {
                    userId,
                    status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
                    OR: [
                        { shippingAddressId: addressId },
                        { billingAddressId: addressId },
                    ],
                },
            });
            if (pendingOrders > 0) {
                throw new error_1.AppError('Cannot delete address used in pending orders', 400);
            }
            await database_1.query({
                where: { id: addressId },
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting customer address:', error);
            throw error;
        }
    }
    static async setDefaultAddress(userId, addressId) {
        try {
            await this.getAddress(userId, addressId);
            await database_1.queryMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            const updated = await database_1.query({
                where: { id: addressId },
                data: { isDefault: true },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error setting default address:', error);
            throw error;
        }
    }
    static async getPaymentMethods(userId) {
        return database_1.query({
            where: { userId },
            select: {
                id: true,
                type: true,
                provider: true,
                last4: true,
                brand: true,
                expiryMonth: true,
                expiryYear: true,
                isDefault: true,
                createdAt: true,
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    }
    static async getPaymentMethod(userId, paymentMethodId) {
        const method = await database_1.query({
            where: {
                id: paymentMethodId,
                userId,
            },
            select: {
                id: true,
                type: true,
                provider: true,
                last4: true,
                brand: true,
                expiryMonth: true,
                expiryYear: true,
                isDefault: true,
                createdAt: true,
            },
        });
        if (!method) {
            throw new error_1.AppError('Payment method not found', 404);
        }
        return method;
    }
    static async addPaymentMethod(userId, data) {
        try {
            if (data.isDefault) {
                await database_1.queryMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const method = await database_1.query({
                data: {
                    ...data,
                    userId,
                },
                select: {
                    id: true,
                    type: true,
                    provider: true,
                    last4: true,
                    brand: true,
                    expiryMonth: true,
                    expiryYear: true,
                    isDefault: true,
                    createdAt: true,
                },
            });
            return method;
        }
        catch (error) {
            logger_1.logger.error('Error adding payment method:', error);
            throw error;
        }
    }
    static async updatePaymentMethod(userId, paymentMethodId, data) {
        try {
            await this.getPaymentMethod(userId, paymentMethodId);
            if (data.isDefault) {
                await database_1.queryMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            const updated = await database_1.query({
                where: { id: paymentMethodId },
                data: {
                    isDefault: data.isDefault,
                },
                select: {
                    id: true,
                    type: true,
                    provider: true,
                    last4: true,
                    brand: true,
                    expiryMonth: true,
                    expiryYear: true,
                    isDefault: true,
                    createdAt: true,
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error updating payment method:', error);
            throw error;
        }
    }
    static async deletePaymentMethod(userId, paymentMethodId) {
        try {
            await this.getPaymentMethod(userId, paymentMethodId);
            await database_1.query({
                where: { id: paymentMethodId },
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting payment method:', error);
            throw error;
        }
    }
    static async setDefaultPaymentMethod(userId, paymentMethodId) {
        try {
            await this.getPaymentMethod(userId, paymentMethodId);
            await database_1.queryMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
            const updated = await database_1.query({
                where: { id: paymentMethodId },
                data: { isDefault: true },
                select: {
                    id: true,
                    type: true,
                    provider: true,
                    last4: true,
                    brand: true,
                    expiryMonth: true,
                    expiryYear: true,
                    isDefault: true,
                    createdAt: true,
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error setting default payment method:', error);
            throw error;
        }
    }
    static async getOrderHistory(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [orders, total] = await Promise.all([
                database_1.query({
                    where: { userId },
                    include: {
                        items: true,
                        shippingAddress: true,
                        shipments: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                database_1.query({ where: { userId } }),
            ]);
            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching order history:', error);
            throw error;
        }
    }
    static async getWishlist(userId, query) {
        try {
            const skip = (query.page - 1) * query.limit;
            const where = { userId };
            const [items, total] = await Promise.all([
                database_1.query({
                    where,
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isMain: true },
                                    take: 1,
                                },
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: query.limit,
                }),
                database_1.query({ where }),
            ]);
            return {
                items,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total,
                    totalPages: Math.ceil(total / query.limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching wishlist:', error);
            throw error;
        }
    }
    static async addToWishlist(userId, productId) {
        try {
            const product = await database_1.query({
                where: { id: productId },
            });
            if (!product) {
                throw new error_1.AppError('Product not found', 404);
            }
            const existing = await database_1.query({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
            });
            if (existing) {
                throw new error_1.AppError('Product already in wishlist', 400);
            }
            const item = await database_1.query({
                data: {
                    userId,
                    productId,
                },
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isMain: true },
                                take: 1,
                            },
                        },
                    },
                },
            });
            return item;
        }
        catch (error) {
            logger_1.logger.error('Error adding to wishlist:', error);
            throw error;
        }
    }
    static async removeFromWishlist(userId, productId) {
        try {
            const deleted = await database_1.queryMany({
                where: {
                    userId,
                    productId,
                },
            });
            if (deleted.count === 0) {
                throw new error_1.AppError('Product not in wishlist', 404);
            }
        }
        catch (error) {
            logger_1.logger.error('Error removing from wishlist:', error);
            throw error;
        }
    }
    static async clearWishlist(userId) {
        try {
            const deleted = await database_1.queryMany({
                where: { userId },
            });
            return { deleted: deleted.count };
        }
        catch (error) {
            logger_1.logger.error('Error clearing wishlist:', error);
            throw error;
        }
    }
    static async getPreferences(userId) {
        try {
            const setting = await database_1.query({
                where: { key: `user_preferences_${userId}` },
            });
            if (!setting) {
                return {
                    language: 'en',
                    currency: 'USD',
                    emailNotifications: true,
                    smsNotifications: false,
                    marketingEmails: false,
                    orderUpdates: true,
                    newsletter: false,
                    theme: 'auto',
                };
            }
            return setting.value;
        }
        catch (error) {
            logger_1.logger.error('Error fetching customer preferences:', error);
            throw error;
        }
    }
    static async updatePreferences(userId, preferences) {
        try {
            const current = await this.getPreferences(userId);
            const updated = { ...current, ...preferences };
            await database_1.query({
                where: { key: `user_preferences_${userId}` },
                update: { value: updated },
                create: {
                    key: `user_preferences_${userId}`,
                    value: updated,
                    category: 'user_preferences',
                    isPublic: false,
                },
            });
            return updated;
        }
        catch (error) {
            logger_1.logger.error('Error updating customer preferences:', error);
            throw error;
        }
    }
    static async getActivity(userId, query) {
        try {
            const skip = (query.page - 1) * query.limit;
            const where = { userId };
            if (query.type) {
                where.action = { contains: query.type.toUpperCase() };
            }
            if (query.startDate) {
                where.createdAt = { gte: new Date(query.startDate) };
            }
            if (query.endDate) {
                where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };
            }
            const [activities, total] = await Promise.all([
                database_1.query({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: query.limit,
                }),
                database_1.query({ where }),
            ]);
            return {
                activities,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total,
                    totalPages: Math.ceil(total / query.limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching customer activity:', error);
            throw error;
        }
    }
    static async getAnalytics(customerId, startDate, endDate) {
        try {
            const user = await database_1.query({
                where: { id: customerId },
                include: {
                    orders: {
                        where: {
                            createdAt: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    },
                    reviews: true,
                    wishlistItems: true,
                },
            });
            if (!user) {
                throw new error_1.AppError('Customer not found', 404);
            }
            const totalOrders = user.orders.length;
            const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.total), 0);
            const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
            return {
                overview: {
                    totalOrders,
                    totalSpent,
                    averageOrderValue,
                    lastOrderDate: user.orders[0]?.createdAt,
                    customerSince: user.createdAt,
                    lifetimeValue: totalSpent,
                },
                orders: {
                    count: totalOrders,
                    statuses: {},
                    monthlySpend: [],
                },
                products: {
                    topCategories: [],
                    topProducts: [],
                    recentlyViewed: [],
                },
                engagement: {
                    reviewCount: user.reviews.length,
                    averageRating: 0,
                    wishlistCount: user.wishlistItems.length,
                    lastLoginAt: user.lastLoginAt || undefined,
                    loginCount: 0,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching customer analytics:', error);
            throw error;
        }
    }
    static async searchCustomers(query) {
        try {
            const skip = (query.page - 1) * query.limit;
            const where = {
                role: query.role || 'CUSTOMER',
            };
            if (query.search) {
                where.OR = [
                    { email: { contains: query.search, mode: 'insensitive' } },
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const [customers, total] = await Promise.all([
                database_1.query({
                    where,
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        isActive: true,
                        isVerified: true,
                        createdAt: true,
                        lastLoginAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: query.limit,
                }),
                database_1.query({ where }),
            ]);
            return {
                customers,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total,
                    totalPages: Math.ceil(total / query.limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error searching customers:', error);
            throw error;
        }
    }
    static async deleteAccount(userId, _password) {
        try {
            const user = await database_1.query({
                where: { id: userId },
                select: { password: true },
            });
            if (!user) {
                throw new error_1.AppError('User not found', 404);
            }
            await database_1.query({
                where: { id: userId },
                data: {
                    deletedAt: new Date(),
                    email: `deleted_${userId}@deleted.com`,
                    firstName: 'Deleted',
                    lastName: 'User',
                    phone: null,
                    isActive: false,
                },
            });
            await Promise.all([
                database_1.queryMany({ where: { userId } }),
                database_1.queryMany({ where: { userId } }),
                database_1.queryMany({ where: { userId } }),
                database_1.queryMany({ where: { userId } }),
                database_1.queryMany({ where: { userId } }),
            ]);
            logger_1.logger.info(`Customer account deleted: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting customer account:', error);
            throw error;
        }
    }
    static async exportCustomerData(userId) {
        try {
            const data = await database_1.query({
                where: { id: userId },
                include: {
                    addresses: true,
                    orders: {
                        include: {
                            items: true,
                            payments: true,
                            shipments: true,
                        },
                    },
                    reviews: true,
                    wishlistItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    sku: true,
                                },
                            },
                        },
                    },
                    carts: {
                        include: {
                            items: {
                                include: {
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                            sku: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!data) {
                throw new error_1.AppError('Customer not found', 404);
            }
            const { password: _password, ...customerData } = data;
            return customerData;
        }
        catch (error) {
            logger_1.logger.error('Error exporting customer data:', error);
            throw error;
        }
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=customerService.js.map