import { AuthenticatedSocket } from '../middleware/auth';
import { CartEvent } from '../../types/cart';
export declare class CartEventHandler {
    handleSyncRequest(socket: AuthenticatedSocket, data: {
        cartId: string;
        lastSyncAt?: string;
    }): Promise<void>;
    handleCartUpdate(event: CartEvent): Promise<void>;
    handleCartItemCountUpdate(cartId: string, userId?: string, sessionId?: string): Promise<void>;
    handleStockWarning(data: {
        cartId: string;
        userId?: string;
        sessionId?: string;
        productId: string;
        variantId?: string;
        availableQuantity: number;
        requestedQuantity: number;
    }): Promise<void>;
    private verifyCartAccess;
    handleCartExpiration(cartId: string, userId?: string, sessionId?: string): Promise<void>;
    handleCartMerge(data: {
        sourceCartId: string;
        targetCartId: string;
        userId?: string;
        sessionId?: string;
    }): Promise<void>;
}
export declare const cartEventHandler: CartEventHandler;
//# sourceMappingURL=cartEventHandler.d.ts.map