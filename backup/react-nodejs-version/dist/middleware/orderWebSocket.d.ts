import { Request, Response, NextFunction } from 'express';
export interface OrderEventRequest extends Request {
    orderEvent?: {
        orderId?: string;
        userId?: string;
        previousStatus?: string;
        newStatus?: string;
        trackingInfo?: any;
        refundAmount?: number;
        isFullRefund?: boolean;
    };
}
export declare const orderCreatedMiddleware: (_req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const orderUpdatedMiddleware: (req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const orderCancelledMiddleware: (req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const orderShippedMiddleware: (_req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const orderDeliveredMiddleware: (_req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const orderRefundedMiddleware: (req: OrderEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addOrderEventData: (data: Partial<OrderEventRequest['orderEvent']>) => (req: OrderEventRequest, _res: Response, next: NextFunction) => void;
export declare const trackStatusChange: (req: OrderEventRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=orderWebSocket.d.ts.map