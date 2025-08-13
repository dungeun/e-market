/// <reference types="node" />
import { Server as HTTPServer } from 'http';
export declare class SocketServer {
    private io;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    broadcastCartUpdate(event: {
        type: string;
        cartId: string;
        userId?: string;
        sessionId?: string;
        data: any;
        timestamp: Date;
    }): void;
    broadcastCartItemCount(data: {
        cartId: string;
        userId?: string;
        sessionId?: string;
        itemCount: number;
    }): void;
    broadcastStockWarning(data: {
        cartId: string;
        userId?: string;
        sessionId?: string;
        productId: string;
        variantId?: string;
        availableQuantity: number;
        requestedQuantity: number;
    }): void;
    getConnectedClientsCount(): number;
    getClientsInRoom(room: string): number;
    sendToUser(userId: string, event: string, data: any): void;
    sendToSession(sessionId: string, event: string, data: any): void;
    close(): void;
}
export declare let socketServer: SocketServer;
export declare const initializeSocketServer: (server: HTTPServer) => SocketServer;
//# sourceMappingURL=socketServer.d.ts.map