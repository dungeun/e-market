import { CalculateRatesInput, CreateShipmentInput, UpdateShipmentInput, TrackShipmentInput, ShipmentQueryInput, CarrierWebhookInput, ShippingRate, ShipmentWithDetails, ShipmentTracking, ShippingAnalytics, ShippingSummary } from '../types/shipping';
export declare class ShippingService {
    private readonly DEFAULT_CURRENCY;
    private readonly MAX_PACKAGE_WEIGHT;
    private readonly MIN_PACKAGE_WEIGHT;
    private readonly carriers;
    calculateRates(data: CalculateRatesInput): Promise<ShippingRate[]>;
    createShipment(data: CreateShipmentInput): Promise<ShipmentWithDetails>;
    updateShipment(id: string, data: UpdateShipmentInput): Promise<ShipmentWithDetails>;
    getShipmentById(id: string): Promise<ShipmentWithDetails>;
    trackShipment(data: TrackShipmentInput): Promise<ShipmentTracking>;
    getShipments(query: ShipmentQueryInput): Promise<{
        shipments: ShippingSummary[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    handleCarrierWebhook(carrier: string, data: CarrierWebhookInput): Promise<void>;
    getAnalytics(): Promise<ShippingAnalytics>;
    private validatePackages;
    private validatePackageInfo;
    private getBaseRates;
    private applyShippingRules;
    private getActiveShippingRules;
    private doesRuleApply;
    private calculateDistance;
    private calculateEstimatedDelivery;
    private generateTrackingNumber;
    private getWarehouseAddress;
    private convertAddressToShippingAddress;
    private transformShipmentToDetails;
    private generateTrackingUrl;
    private getServiceName;
    private getStatusDescription;
    private normalizeCarrierStatus;
}
export declare const shippingService: ShippingService;
//# sourceMappingURL=shippingService.d.ts.map