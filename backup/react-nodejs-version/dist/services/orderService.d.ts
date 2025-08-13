import { CreateOrderInput, UpdateOrderInput, OrderQueryInput, CancelOrderInput, RefundOrderInput, UpdateShippingInput, OrderWithDetails, OrderTimeline, OrderAnalytics } from '../types/order';
export declare class OrderService {
    private readonly ORDER_NUMBER_PREFIX;
    private readonly MAX_REFUND_DAYS;
    private generateOrderNumber;
    createOrderFromCart(data: CreateOrderInput): Promise<OrderWithDetails>;
    getOrderById(id: string): Promise<OrderWithDetails>;
    getOrderByNumber(orderNumber: string): Promise<OrderWithDetails>;
    getUserOrders(userId: string, query: OrderQueryInput): Promise<{
        orders: OrderWithDetails[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getOrders(query: OrderQueryInput): Promise<{
        orders: OrderWithDetails[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrder(id: string, data: UpdateOrderInput): Promise<OrderWithDetails>;
    cancelOrder(id: string, data: CancelOrderInput): Promise<OrderWithDetails>;
    processRefund(id: string, data: RefundOrderInput): Promise<OrderWithDetails>;
    updateShipping(id: string, data: UpdateShippingInput): Promise<OrderWithDetails>;
    markAsDelivered(id: string): Promise<OrderWithDetails>;
    getOrderTimeline(orderId: string): Promise<OrderTimeline[]>;
    getOrderAnalytics(userId?: string): Promise<OrderAnalytics>;
    private getOrderWithDetails;
    private validateStatusTransition;
    private createTimelineEvent;
}
export declare const orderService: OrderService;
//# sourceMappingURL=orderService.d.ts.map