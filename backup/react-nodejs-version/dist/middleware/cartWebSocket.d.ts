import { Request, Response, NextFunction } from 'express';
import { CartEvent } from '../types/cart';
export interface CartEventRequest extends Request {
    cartEvent?: Partial<CartEvent>;
}
export declare const cartWebSocketMiddleware: (eventType: CartEvent['type']) => (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cartUpdatedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const itemAddedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const itemUpdatedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const itemRemovedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cartClearedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const couponAppliedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const couponRemovedMiddleware: (req: CartEventRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addCartEventData: (data: Partial<CartEvent['data']>) => (req: CartEventRequest, _res: Response, next: NextFunction) => void;
export declare const stockWarningMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cartExpirationMiddleware: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=cartWebSocket.d.ts.map