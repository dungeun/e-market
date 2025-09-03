"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingService = exports.ShippingService = void 0;
const client_1 = require("@prisma/client");
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const error_1 = require("../middleware/error");
// Type for shipment with all relations (currently unused)
/*
type ShipmentWithRelations = Shipment & {
  order: {
    id: string
    orderNumber: string
    status: string
    userId: string
    items: Array<{
      id: string
      quantity: number
      product: {
        id: string
        name: string
        weight?: number
        dimensions?: any
      }
    }>
  }
}
*/
class ShippingService {
    constructor() {
        this.DEFAULT_CURRENCY = 'USD';
        // private readonly DEFAULT_WEIGHT_UNIT = 'kg'
        // private readonly DEFAULT_DIMENSION_UNIT = 'cm'
        this.MAX_PACKAGE_WEIGHT = 68; // kg (150 lbs)
        this.MIN_PACKAGE_WEIGHT = 0.1; // kg
        // Carrier configurations
        this.carriers = {
            UPS: {
                name: 'UPS',
                trackingUrlPattern: 'https://www.ups.com/track?trackingNumber={TRACKING_NUMBER}',
                services: {
                    STANDARD: { name: 'UPS Ground', estimatedDays: 3 },
                    EXPRESS: { name: 'UPS 2nd Day Air', estimatedDays: 2 },
                    OVERNIGHT: { name: 'UPS Next Day Air', estimatedDays: 1 },
                },
            },
            FEDEX: {
                name: 'FedEx',
                trackingUrlPattern: 'https://www.fedex.com/fedextrack/?trackingNumber={TRACKING_NUMBER}',
                services: {
                    STANDARD: { name: 'FedEx Ground', estimatedDays: 3 },
                    EXPRESS: { name: 'FedEx Express Saver', estimatedDays: 2 },
                    OVERNIGHT: { name: 'FedEx Standard Overnight', estimatedDays: 1 },
                },
            },
            DHL: {
                name: 'DHL',
                trackingUrlPattern: 'https://www.dhl.com/track?trackingNumber={TRACKING_NUMBER}',
                services: {
                    STANDARD: { name: 'DHL Express Worldwide', estimatedDays: 4 },
                    EXPRESS: { name: 'DHL Express 12:00', estimatedDays: 2 },
                    OVERNIGHT: { name: 'DHL Express 9:00', estimatedDays: 1 },
                },
            },
            USPS: {
                name: 'USPS',
                trackingUrlPattern: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={TRACKING_NUMBER}',
                services: {
                    STANDARD: { name: 'USPS Ground Advantage', estimatedDays: 3 },
                    EXPRESS: { name: 'USPS Priority Mail', estimatedDays: 2 },
                    OVERNIGHT: { name: 'USPS Priority Mail Express', estimatedDays: 1 },
                },
            },
        };
    }
    // Calculate shipping rates
    async calculateRates(data) {
        try {
            logger_1.logger.info('Calculating shipping rates', {
                origin: data.origin.city,
                destination: data.destination.city,
                packages: data.packages.length,
            });
            // Validate packages
            this.validatePackages(data.packages);
            // Calculate total weight and dimensions
            const totalWeight = data.packages.reduce((sum, pkg) => sum + pkg.weight, 0);
            const totalValue = data.packages.reduce((sum, pkg) => sum + pkg.value, 0);
            // Get base rates from database or external APIs
            const baseRates = await this.getBaseRates(data.origin, data.destination, totalWeight);
            // Apply shipping rules
            const adjustedRates = await this.applyShippingRules(baseRates, {
                totalWeight,
                totalValue,
                destination: data.destination,
                packages: data.packages,
            });
            // Filter by requested services
            const filteredRates = data.services?.length
                ? adjustedRates.filter(rate => data.services.includes(rate.service))
                : adjustedRates;
            // Sort by cost (ascending)
            return filteredRates.sort((a, b) => a.cost - b.cost);
        }
        catch (error) {
            logger_1.logger.error('Error calculating shipping rates', { error: error instanceof Error ? error.message : String(error), data });
            throw new error_1.AppError('Failed to calculate shipping rates', 500);
        }
    }
    // Create shipment
    async createShipment(data) {
        try {
            logger_1.logger.info('Creating shipment', { orderId: data.orderId, carrier: data.carrier });
            // Get order details
            const order = await database_1.query({
                where: { id: data.orderId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    shippingAddress: true,
                },
            });
            if (!order) {
                throw new error_1.AppError('Order not found', 404);
            }
            if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
                throw new error_1.AppError('Cannot create shipment for cancelled or refunded order', 400);
            }
            // Validate package info
            this.validatePackageInfo(data.packageInfo);
            // Calculate shipping cost
            const rates = await this.calculateRates({
                origin: await this.getWarehouseAddress(),
                destination: this.convertAddressToShippingAddress(order.shippingAddress),
                packages: [data.packageInfo],
                services: [data.service],
            });
            if (rates.length === 0) {
                throw new error_1.AppError('No shipping rates available for this destination', 400);
            }
            const selectedRate = rates.find(rate => rate.carrier === data.carrier && rate.service === data.service);
            if (!selectedRate) {
                throw new error_1.AppError('Selected shipping option not available', 400);
            }
            // Generate tracking number
            const trackingNumber = await this.generateTrackingNumber(data.carrier);
            // Create shipment in database
            const shipment = await database_1.prisma.$transaction(async (tx) => {
                const createdShipment = await tx.shipment.create({
                    data: {
                        orderId: data.orderId,
                        trackingNumber,
                        carrier: data.carrier,
                        method: data.service,
                        status: 'PENDING',
                        cost: new client_1.Prisma.Decimal(selectedRate.cost),
                        currency: selectedRate.currency,
                        estimatedDelivery: selectedRate.estimatedDelivery,
                        notes: `Package: ${data.packageInfo.weight}${data.packageInfo.weightUnit}`,
                        metadata: {
                            packageInfo: data.packageInfo,
                            labelFormat: data.labelFormat,
                            insurance: data.insurance,
                            signature: data.signature,
                            saturdayDelivery: data.saturdayDelivery,
                            ...data.metadata,
                        },
                    },
                });
                // Create initial tracking event
                await tx.trackingEvent.create({
                    data: {
                        shipmentId: createdShipment.id,
                        status: 'PENDING',
                        description: 'Shipment created',
                        timestamp: new Date(),
                    },
                });
                // Update order status
                await tx.order.update({
                    where: { id: data.orderId },
                    data: {
                        status: 'PROCESSING',
                    },
                });
                logger_1.logger.info('Shipment created successfully', {
                    orderId: data.orderId,
                    shipmentId: createdShipment.id,
                    trackingNumber,
                    carrier: data.carrier,
                });
                return createdShipment;
            });
            // Get full shipment details
            return await this.getShipmentById(shipment.id);
        }
        catch (error) {
            logger_1.logger.error('Error creating shipment', { error: error instanceof Error ? error.message : String(error), data });
            if (error instanceof error_1.AppError)
                throw error;
            throw new error_1.AppError('Failed to create shipment', 500);
        }
    }
    // Update shipment
    async updateShipment(id, data) {
        try {
            logger_1.logger.info('Updating shipment', { id, updates: Object.keys(data) });
            const existingShipment = await database_1.query({
                where: { id },
                include: { order: true },
            });
            if (!existingShipment) {
                throw new error_1.AppError('Shipment not found', 404);
            }
            const shipment = await database_1.prisma.$transaction(async (tx) => {
                // Update shipment
                const updatedShipment = await tx.shipment.update({
                    where: { id },
                    data: {
                        ...(data.status && { status: data.status }),
                        ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
                        ...(data.estimatedDelivery && { estimatedDelivery: new Date(data.estimatedDelivery) }),
                        ...(data.actualDelivery && { actualDelivery: new Date(data.actualDelivery) }),
                        ...(data.notes && { notes: data.notes }),
                        ...(data.metadata && {
                            metadata: {
                                ...(existingShipment.metadata || {}),
                                ...data.metadata,
                            },
                        }),
                    },
                });
                // Create tracking event if status changed
                if (data.status && data.status !== existingShipment.status) {
                    await tx.trackingEvent.create({
                        data: {
                            shipmentId: id,
                            status: data.status,
                            description: this.getStatusDescription(data.status),
                            timestamp: new Date(),
                        },
                    });
                    // Update order status if shipment is delivered
                    if (data.status === 'DELIVERED') {
                        await tx.order.update({
                            where: { id: existingShipment.orderId },
                            data: { status: 'DELIVERED' },
                        });
                        logger_1.logger.info('Package delivered', {
                            orderId: existingShipment.orderId,
                            shipmentId: id,
                            trackingNumber: existingShipment.trackingNumber,
                            deliveryDate: data.actualDelivery || new Date(),
                        });
                    }
                }
                return updatedShipment;
            });
            return await this.getShipmentById(shipment.id);
        }
        catch (error) {
            logger_1.logger.error('Error updating shipment', { error: error instanceof Error ? error.message : String(error), id, data });
            if (error instanceof error_1.AppError)
                throw error;
            throw new error_1.AppError('Failed to update shipment', 500);
        }
    }
    // Get shipment by ID
    async getShipmentById(id) {
        try {
            const shipment = await database_1.query({
                where: { id },
                include: {
                    order: {
                        select: {
                            id: true,
                            orderNumber: true,
                            status: true,
                        },
                    },
                },
            });
            if (!shipment) {
                throw new error_1.AppError('Shipment not found', 404);
            }
            return this.transformShipmentToDetails(shipment);
        }
        catch (error) {
            logger_1.logger.error('Error getting shipment by ID', { error: error instanceof Error ? error.message : String(error), id });
            if (error instanceof error_1.AppError)
                throw error;
            throw new error_1.AppError('Failed to get shipment', 500);
        }
    }
    // Track shipment
    async trackShipment(data) {
        try {
            logger_1.logger.info('Tracking shipment', { trackingNumber: data.trackingNumber });
            // Find shipment in database
            const shipment = await database_1.query({
                where: { trackingNumber: data.trackingNumber },
                include: {
                    trackingEvents: {
                        orderBy: { timestamp: 'desc' },
                    },
                },
            });
            if (!shipment) {
                throw new error_1.AppError('Shipment not found', 404);
            }
            // Get tracking events
            const events = shipment.trackingEvents.map((event) => ({
                id: event.id,
                shipmentId: event.shipmentId,
                status: event.status,
                location: event.location || undefined,
                description: event.description || undefined,
                timestamp: event.timestamp,
                metadata: event.metadata,
                createdAt: event.createdAt,
            }));
            return {
                trackingNumber: shipment.trackingNumber,
                carrier: shipment.carrier,
                status: shipment.status,
                estimatedDelivery: shipment.estimatedDelivery || undefined,
                actualDelivery: shipment.actualDelivery || undefined,
                events,
                lastUpdated: events[0]?.timestamp || shipment.updatedAt,
            };
        }
        catch (error) {
            logger_1.logger.error('Error tracking shipment', { error: error instanceof Error ? error.message : String(error), data });
            if (error instanceof error_1.AppError)
                throw error;
            throw new error_1.AppError('Failed to track shipment', 500);
        }
    }
    // Get shipments with pagination
    async getShipments(query) {
        try {
            const { page, limit, orderId, carrier, status, fromDate, toDate, sortBy, sortOrder } = query;
            const where = {
                ...(orderId && { orderId }),
                ...(carrier && { carrier }),
                ...(status && { status: status }),
                ...(fromDate || toDate) && {
                    createdAt: {
                        ...(fromDate && { gte: new Date(fromDate) }),
                        ...(toDate && { lte: new Date(toDate) }),
                    },
                },
            };
            const [shipments, total] = await Promise.all([
                database_1.query({
                    where,
                    include: {
                        order: {
                            select: {
                                orderNumber: true,
                            },
                        },
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                database_1.query({ where }),
            ]);
            const summaries = shipments.map(shipment => ({
                id: shipment.id,
                orderId: shipment.orderId,
                orderNumber: shipment.order.orderNumber,
                trackingNumber: shipment.trackingNumber || undefined,
                carrier: shipment.carrier,
                service: shipment.method,
                status: shipment.status,
                cost: Number(shipment.cost),
                currency: shipment.currency,
                estimatedDelivery: shipment.estimatedDelivery || undefined,
                createdAt: shipment.createdAt,
            }));
            return {
                shipments: summaries,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting shipments', { error: error instanceof Error ? error.message : String(error), query });
            throw new error_1.AppError('Failed to get shipments', 500);
        }
    }
    // Handle carrier webhook
    async handleCarrierWebhook(carrier, data) {
        try {
            logger_1.logger.info('Handling carrier webhook', { carrier, trackingNumber: data.trackingNumber });
            const shipment = await database_1.query({
                where: {
                    trackingNumber: data.trackingNumber,
                    carrier: carrier.toUpperCase(),
                },
            });
            if (!shipment) {
                logger_1.logger.warn('Shipment not found for webhook', { carrier, trackingNumber: data.trackingNumber });
                return;
            }
            await database_1.prisma.$transaction(async (tx) => {
                // Create tracking event
                await tx.trackingEvent.create({
                    data: {
                        shipmentId: shipment.id,
                        status: this.normalizeCarrierStatus(data.status),
                        location: data.location,
                        description: data.description || this.getStatusDescription(data.status),
                        timestamp: new Date(data.timestamp),
                        metadata: data.metadata,
                    },
                });
                // Update shipment status if needed
                const normalizedStatus = this.normalizeCarrierStatus(data.status);
                if (normalizedStatus !== shipment.status) {
                    await tx.shipment.update({
                        where: { id: shipment.id },
                        data: {
                            status: normalizedStatus,
                            ...(normalizedStatus === 'DELIVERED' && { actualDelivery: new Date() }),
                        },
                    });
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error handling carrier webhook', { error: error instanceof Error ? error.message : String(error), carrier, data });
            throw new error_1.AppError('Failed to handle carrier webhook', 500);
        }
    }
    // Get analytics
    async getAnalytics() {
        try {
            const [totalShipments, shipmentStats, statusCounts, carrierCounts, recentShipments,] = await Promise.all([
                // Total shipments count
                database_1.query(),
                // Total and average cost
                database_1.prisma.shipment.aggregate({
                    _sum: { cost: true },
                    _avg: { cost: true },
                }),
                // Status counts
                database_1.prisma.shipment.groupBy({
                    by: ['status'],
                    _count: { status: true },
                    _sum: { cost: true },
                }),
                // Carrier counts
                database_1.prisma.shipment.groupBy({
                    by: ['carrier'],
                    _count: { carrier: true },
                    _sum: { cost: true },
                    _avg: { cost: true },
                }),
                // Recent shipments
                database_1.query({
                    include: {
                        order: {
                            select: {
                                orderNumber: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
            ]);
            return {
                totalShipments,
                totalCost: Number(shipmentStats._sum.cost || 0),
                averageCost: Number(shipmentStats._avg.cost || 0),
                statusCounts: statusCounts.map(item => ({
                    status: item.status,
                    count: item._count.status,
                    totalCost: Number(item._sum.cost || 0),
                })),
                carrierCounts: carrierCounts.map(item => ({
                    carrier: item.carrier,
                    count: item._count.carrier,
                    totalCost: Number(item._sum.cost || 0),
                    averageCost: Number(item._avg.cost || 0),
                })),
                recentShipments: recentShipments.map(shipment => ({
                    id: shipment.id,
                    orderId: shipment.orderId,
                    orderNumber: shipment.order.orderNumber,
                    trackingNumber: shipment.trackingNumber || undefined,
                    carrier: shipment.carrier,
                    service: shipment.method,
                    status: shipment.status,
                    cost: Number(shipment.cost),
                    currency: shipment.currency,
                    estimatedDelivery: shipment.estimatedDelivery || undefined,
                    createdAt: shipment.createdAt,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting shipping analytics', { error: error instanceof Error ? error.message : String(error) });
            throw new error_1.AppError('Failed to get shipping analytics', 500);
        }
    }
    // Private helper methods
    validatePackages(packages) {
        for (const pkg of packages) {
            if (pkg.weight < this.MIN_PACKAGE_WEIGHT || pkg.weight > this.MAX_PACKAGE_WEIGHT) {
                throw new error_1.AppError(`Package weight must be between ${this.MIN_PACKAGE_WEIGHT} and ${this.MAX_PACKAGE_WEIGHT} ${pkg.weightUnit}`, 400);
            }
            if (pkg.length <= 0 || pkg.width <= 0 || pkg.height <= 0) {
                throw new error_1.AppError('Package dimensions must be positive values', 400);
            }
            if (pkg.value <= 0) {
                throw new error_1.AppError('Package value must be positive', 400);
            }
        }
    }
    validatePackageInfo(packageInfo) {
        this.validatePackages([packageInfo]);
    }
    async getBaseRates(origin, destination, weight) {
        // Mock implementation - in real scenario, this would call external APIs
        const distance = this.calculateDistance(origin, destination);
        const baseRate = Math.max(5, distance * 0.1 + weight * 0.5);
        const rates = [];
        Object.entries(this.carriers).forEach(([carrierCode, carrier]) => {
            Object.entries(carrier.services).forEach(([serviceCode, service]) => {
                const multiplier = serviceCode === 'OVERNIGHT' ? 3 : serviceCode === 'EXPRESS' ? 2 : 1;
                const cost = baseRate * multiplier;
                rates.push({
                    carrier: carrierCode,
                    service: serviceCode,
                    serviceName: service.name,
                    cost,
                    currency: this.DEFAULT_CURRENCY,
                    estimatedDays: service.estimatedDays,
                    estimatedDelivery: this.calculateEstimatedDelivery(service.estimatedDays),
                    guaranteed: serviceCode !== 'STANDARD',
                    insurance: { available: true, cost: cost * 0.02 },
                    signature: { available: true, cost: 5 },
                    saturdayDelivery: { available: true, cost: 15 },
                });
            });
        });
        return rates;
    }
    async applyShippingRules(rates, context) {
        // Mock implementation - apply shipping rules like free shipping, discounts, etc.
        const rules = await this.getActiveShippingRules();
        return rates.map(rate => {
            let adjustedCost = rate.cost;
            for (const rule of rules) {
                if (this.doesRuleApply(rule, context)) {
                    if (rule.actions.freeShipping) {
                        adjustedCost = 0;
                    }
                    else if (rule.actions.flatRate) {
                        adjustedCost = rule.actions.flatRate;
                    }
                    else if (rule.actions.percentageDiscount) {
                        adjustedCost *= (1 - rule.actions.percentageDiscount / 100);
                    }
                    else if (rule.actions.fixedDiscount) {
                        adjustedCost = Math.max(0, adjustedCost - rule.actions.fixedDiscount);
                    }
                }
            }
            return { ...rate, cost: adjustedCost };
        });
    }
    async getActiveShippingRules() {
        // Mock implementation - get from database
        return [];
    }
    doesRuleApply(_rule, _context) {
        // Mock implementation - check if rule conditions match context
        return true;
    }
    calculateDistance(_origin, _destination) {
        // Mock implementation - calculate distance between addresses
        return Math.random() * 1000 + 100; // Random distance between 100-1100 km
    }
    calculateEstimatedDelivery(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }
    async generateTrackingNumber(carrier) {
        const prefix = carrier.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }
    async getWarehouseAddress() {
        // Mock warehouse address - in real scenario, get from configuration
        return {
            street1: '123 Warehouse St',
            city: 'Seoul',
            state: 'Seoul',
            postalCode: '12345',
            country: 'KR',
        };
    }
    convertAddressToShippingAddress(address) {
        return {
            street1: address.street1,
            street2: address.street2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            company: address.company,
            contact: {
                name: `${address.firstName} ${address.lastName}`,
                phone: address.phone,
                email: address.email,
            },
        };
    }
    transformShipmentToDetails(shipment) {
        const metadata = shipment.metadata || {};
        return {
            id: shipment.id,
            orderId: shipment.orderId,
            trackingNumber: shipment.trackingNumber || undefined,
            trackingUrl: shipment.trackingNumber
                ? this.generateTrackingUrl(shipment.carrier, shipment.trackingNumber)
                : undefined,
            carrier: shipment.carrier,
            service: shipment.method,
            serviceName: this.getServiceName(shipment.carrier, shipment.method),
            status: shipment.status,
            cost: Number(shipment.cost),
            currency: shipment.currency,
            estimatedDelivery: shipment.estimatedDelivery || undefined,
            actualDelivery: shipment.actualDelivery || undefined,
            packageInfo: metadata.packageInfo || {},
            labelUrl: metadata.labelUrl,
            labelFormat: metadata.labelFormat,
            insurance: metadata.insurance || false,
            signature: metadata.signature || false,
            saturdayDelivery: metadata.saturdayDelivery || false,
            notes: shipment.notes || undefined,
            metadata: metadata,
            createdAt: shipment.createdAt,
            updatedAt: shipment.updatedAt,
            order: shipment.order,
        };
    }
    generateTrackingUrl(carrier, trackingNumber) {
        const carrierConfig = this.carriers[carrier];
        return carrierConfig?.trackingUrlPattern.replace('{TRACKING_NUMBER}', trackingNumber) || '';
    }
    getServiceName(carrier, service) {
        const carrierConfig = this.carriers[carrier];
        return carrierConfig?.services[service]?.name || service;
    }
    getStatusDescription(status) {
        const descriptions = {
            PENDING: 'Shipment is being prepared',
            PROCESSING: 'Shipment is being processed',
            SHIPPED: 'Package has been shipped',
            IN_TRANSIT: 'Package is in transit',
            OUT_FOR_DELIVERY: 'Package is out for delivery',
            DELIVERED: 'Package has been delivered',
            FAILED_DELIVERY: 'Delivery attempt failed',
            RETURNED: 'Package has been returned to sender',
            CANCELLED: 'Shipment has been cancelled',
        };
        return descriptions[status] || status;
    }
    normalizeCarrierStatus(carrierStatus) {
        // Map carrier-specific statuses to our standard statuses
        const statusMap = {
            'LABEL_CREATED': 'PENDING',
            'PICKED_UP': 'SHIPPED',
            'IN_TRANSIT': 'IN_TRANSIT',
            'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
            'DELIVERED': 'DELIVERED',
            'EXCEPTION': 'FAILED_DELIVERY',
            'RETURNED_TO_SENDER': 'RETURNED',
        };
        return statusMap[carrierStatus.toUpperCase()] || carrierStatus;
    }
}
exports.ShippingService = ShippingService;
exports.shippingService = new ShippingService();
//# sourceMappingURL=shippingService.js.map