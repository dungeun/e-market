import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    sessionId?: string;
    isAuthenticated: boolean;
}
export declare const authMiddleware: (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void) => void;
export type { AuthenticatedSocket };
//# sourceMappingURL=auth.d.ts.map