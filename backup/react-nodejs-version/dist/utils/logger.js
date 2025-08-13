"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config/config");
const { combine, timestamp, errors, json, colorize, printf } = winston_1.default.format;
// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.log.level,
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'commerce-base-plugin' },
    transports: [
        // Write all logs to console in development
        new winston_1.default.transports.Console({
            format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        }),
    ],
});
// Add file transport in production
if (config_1.config.nodeEnv === 'production') {
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: config_1.config.log.file,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map