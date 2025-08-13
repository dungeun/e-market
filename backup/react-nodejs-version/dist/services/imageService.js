"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageService = exports.ImageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const error_1 = require("../middleware/error");
const logger_1 = require("../utils/logger");
class ImageService {
    constructor() {
        this.thumbnailConfigs = [
            { width: 150, height: 150, suffix: 'thumb' },
            { width: 300, height: 300, suffix: 'small' },
            { width: 600, height: 600, suffix: 'medium' },
            { width: 1200, height: 1200, suffix: 'large' },
        ];
        this.uploadDir = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads');
        this.ensureUploadDirExists();
    }
    async ensureUploadDirExists() {
        try {
            await fs_1.promises.access(this.uploadDir);
        }
        catch {
            await fs_1.promises.mkdir(this.uploadDir, { recursive: true });
            logger_1.logger.info(`Created upload directory: ${this.uploadDir}`);
        }
    }
    async processImage(buffer, _filename, options = {}) {
        try {
            const { quality = 80, format = 'jpeg', maxWidth = 2048, maxHeight = 2048, } = options;
            // Generate unique filename
            const ext = format === 'jpeg' ? 'jpg' : format;
            const uniqueFilename = `${(0, uuid_1.v4)()}-${Date.now()}.${ext}`;
            const originalPath = path_1.default.join(this.uploadDir, uniqueFilename);
            // Process main image
            const sharpInstance = (0, sharp_1.default)(buffer);
            const metadata = await sharpInstance.metadata();
            if (!metadata.width || !metadata.height) {
                throw new error_1.AppError('Invalid image metadata', 400);
            }
            // Resize if necessary and save original
            await sharpInstance
                .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            })
                .jpeg({ quality })
                .toFile(originalPath);
            // Generate thumbnails
            const thumbnails = await Promise.all(this.thumbnailConfigs.map(async (config) => {
                const thumbnailFilename = `${path_1.default.parse(uniqueFilename).name}-${config.suffix}.${ext}`;
                const thumbnailPath = path_1.default.join(this.uploadDir, thumbnailFilename);
                await (0, sharp_1.default)(buffer)
                    .resize(config.width, config.height, {
                    fit: 'cover',
                    position: 'center',
                })
                    .jpeg({ quality })
                    .toFile(thumbnailPath);
                const stats = await fs_1.promises.stat(thumbnailPath);
                return {
                    path: thumbnailPath,
                    width: config.width,
                    height: config.height,
                    size: stats.size,
                };
            }));
            const originalStats = await fs_1.promises.stat(originalPath);
            return {
                originalPath,
                thumbnails,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format || 'unknown',
                    size: originalStats.size,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Image processing failed:', error);
            throw new error_1.AppError('Failed to process image', 500);
        }
    }
    async deleteImage(imagePath) {
        try {
            // Delete original image
            await fs_1.promises.unlink(imagePath);
            // Delete thumbnails
            const parsedPath = path_1.default.parse(imagePath);
            const baseFilename = parsedPath.name.split('-')[0]; // Remove timestamp
            for (const config of this.thumbnailConfigs) {
                const thumbnailPath = path_1.default.join(parsedPath.dir, `${baseFilename}-${config.suffix}${parsedPath.ext}`);
                try {
                    await fs_1.promises.unlink(thumbnailPath);
                }
                catch (error) {
                    // Log but don't throw if thumbnail doesn't exist
                    logger_1.logger.warn(`Failed to delete thumbnail: ${thumbnailPath}`, error);
                }
            }
            logger_1.logger.info(`Deleted image and thumbnails: ${imagePath}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to delete image:', error);
            throw new error_1.AppError('Failed to delete image', 500);
        }
    }
    async getImageInfo(imagePath) {
        try {
            return await (0, sharp_1.default)(imagePath).metadata();
        }
        catch (error) {
            logger_1.logger.error('Failed to get image info:', error);
            throw new error_1.AppError('Failed to get image information', 500);
        }
    }
    validateImageFile(file) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new error_1.AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400);
        }
        if (file.size > maxSize) {
            throw new error_1.AppError('File size too large. Maximum size is 10MB.', 400);
        }
        return true;
    }
    getImageUrl(imagePath) {
        const relativePath = path_1.default.relative(this.uploadDir, imagePath);
        return `/uploads/${relativePath}`;
    }
    getThumbnailUrl(imagePath, size) {
        const parsedPath = path_1.default.parse(imagePath);
        const baseFilename = parsedPath.name.split('-')[0]; // Remove timestamp
        const thumbnailFilename = `${baseFilename}-${size}${parsedPath.ext}`;
        return `/uploads/${thumbnailFilename}`;
    }
}
exports.ImageService = ImageService;
exports.imageService = new ImageService();
//# sourceMappingURL=imageService.js.map