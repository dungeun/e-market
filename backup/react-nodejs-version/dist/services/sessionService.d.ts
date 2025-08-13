export interface GuestSession {
    id: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    cartId?: string;
    lastActivity: Date;
    expiresAt: Date;
    metadata?: Record<string, any>;
}
export interface SessionActivity {
    type: 'page_view' | 'cart_action' | 'product_view' | 'search' | 'checkout_start' | 'other';
    data?: Record<string, any>;
}
export declare class SessionService {
    private readonly SESSION_EXPIRY_HOURS;
    generateSessionId(): string;
    getOrCreateGuestSession(sessionId?: string, ipAddress?: string, userAgent?: string): Promise<GuestSession>;
    getGuestSession(sessionId: string): Promise<GuestSession | null>;
    updateSessionActivity(sessionId: string, activity: SessionActivity): Promise<GuestSession>;
    isSessionExpired(session: GuestSession): boolean;
    extendSession(sessionId: string, additionalHours?: number): Promise<GuestSession | null>;
    transferSessionToUser(sessionId: string, userId: string): Promise<boolean>;
    cleanupExpiredSessions(): Promise<number>;
    getSessionStats(hours?: number): Promise<{
        activeGuestSessions: number;
        activeCarts: number;
        averageSessionDuration: number;
        newSessionsInPeriod: number;
    }>;
    associateCartWithSession(sessionId: string, cartId: string): Promise<void>;
    getSessionInfo(sessionId: string): Promise<{
        session: GuestSession | null;
        cart: any;
        itemCount: number;
        isExpired: boolean;
        lastActivity: string;
    }>;
}
export declare const sessionService: SessionService;
//# sourceMappingURL=sessionService.d.ts.map