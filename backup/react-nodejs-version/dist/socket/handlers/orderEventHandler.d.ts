export declare class OrderEventHandler {
    handleOrderCreated(orderId: string, userId: string): Promise<void>;
    handleOrderStatusUpdate(orderId: string, previousStatus: string, newStatus: string): Promise<void>;
    handleOrderCancelled(orderId: string, reason: string): Promise<void>;
    handleOrderShipped(orderId: string, trackingInfo: any): Promise<void>;
    handleOrderDelivered(orderId: string): Promise<void>;
    handleOrderRefunded(orderId: string, refundAmount: number, isFullRefund: boolean): Promise<void>;
    private broadcastToAdmins;
    private getStatusUpdateMessage;
}
export declare const orderEventHandler: OrderEventHandler;
//# sourceMappingURL=orderEventHandler.d.ts.map