"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// import { logger } from './logger'
class DatabaseConnection {
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new client_1.PrismaClient({
                log: [
                    {
                        emit: 'event',
                        level: 'query',
                    },
                    {
                        emit: 'event',
                        level: 'error',
                    },
                    {
                        emit: 'event',
                        level: 'info',
                    },
                    {
                        emit: 'event',
                        level: 'warn',
                    },
                ],
            });
            // Database logging is handled through Prisma configuration
            // Note: Prisma event listeners have strict typing that may cause issues
            // Consider using external logging configuration instead
        }
        return DatabaseConnection.instance;
    }
    static async disconnect() {
        if (DatabaseConnection.instance) {
            await DatabaseConnection.instance.$disconnect();
            DatabaseConnection.instance = null;
        }
    }
}
DatabaseConnection.instance = null;
exports.prisma = DatabaseConnection.getInstance();
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await DatabaseConnection.disconnect();
});
process.on('SIGINT', async () => {
    await DatabaseConnection.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await DatabaseConnection.disconnect();
    process.exit(0);
});
//# sourceMappingURL=database.js.map