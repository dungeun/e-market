import { CreateCartInput, UpdateCartInput, AddCartItemInput, UpdateCartItemInput, CartQueryInput, ApplyCouponInput, MergeCartsInput, TransferCartInput, CartWithDetails, StockValidationResult } from '../types/cart';
export declare class CartService {
    private readonly CART_EXPIRY_HOURS;
    private readonly MAX_CART_ITEMS;
    private readonly MIN_QUANTITY;
    private readonly MAX_QUANTITY;
    createCart(data: CreateCartInput): Promise<CartWithDetails>;
    getCartById(id: string): Promise<CartWithDetails>;
    getCartByUserOrSession(userId?: string, sessionId?: string): Promise<CartWithDetails | null>;
    getCarts(query: CartQueryInput): Promise<{
        carts: CartWithDetails[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateCart(id: string, data: UpdateCartInput): Promise<CartWithDetails>;
    deleteCart(id: string): Promise<void>;
    addItemToCart(cartId: string, itemData: AddCartItemInput): Promise<CartWithDetails>;
    private performAddItemToCart;
    updateCartItem(cartId: string, itemId: string, data: UpdateCartItemInput & {
        options?: Record<string, any>;
    }): Promise<CartWithDetails>;
    removeCartItem(cartId: string, itemId: string): Promise<CartWithDetails>;
    clearCart(cartId: string): Promise<CartWithDetails>;
    applyCoupon(cartId: string, data: ApplyCouponInput): Promise<CartWithDetails>;
    removeCoupon(cartId: string, couponId: string): Promise<CartWithDetails>;
    mergeCarts(data: MergeCartsInput): Promise<CartWithDetails>;
    transferCart(data: TransferCartInput): Promise<CartWithDetails>;
    validateCartStock(cartId: string): Promise<StockValidationResult>;
    cleanupExpiredCarts(): Promise<number>;
    private getCartWithDetails;
    private calculateCartTotals;
    private calculateCouponDiscount;
    private getStockStatus;
    private isCartExpired;
}
export declare const cartService: CartService;
//# sourceMappingURL=cartService.d.ts.map