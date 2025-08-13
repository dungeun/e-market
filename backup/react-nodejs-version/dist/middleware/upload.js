"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleImages = exports.uploadSingleImage = exports.imageUpload = exports.deleteFile = exports.getFileUrl = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config/config");
const error_1 = require("./error");
const imageService_1 = require("../services/imageService");
const logger_1 = require("../utils/logger");
// Ensure upload directory exists
const uploadDir = config_1.config.upload.uploadPath;
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        // Create subdirectories based on file type
        const subDir = file.mimetype.startsWith('image/') ? 'images' : 'files';
        const fullPath = path_1.default.join(uploadDir, subDir);
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, fullPath);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
    },
});
// File filter
const fileFilter = (_req, file, cb) => {
    if (config_1.config.upload.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new error_1.AppError(`File type ${file.mimetype} is not allowed`, 400));
    }
};
// Create multer instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: config_1.config.upload.maxFileSize,
        files: 10, // Maximum 10 files per request
    },
});
// Upload middleware for single file
const uploadSingle = (fieldName) => exports.upload.single(fieldName);
exports.uploadSingle = uploadSingle;
// Upload middleware for multiple files
const uploadMultiple = (fieldName, maxCount = 10) => exports.upload.array(fieldName, maxCount);
exports.uploadMultiple = uploadMultiple;
// Upload middleware for multiple fields
const uploadFields = (fields) => exports.upload.fields(fields);
exports.uploadFields = uploadFields;
// Helper function to get file URL
const getFileUrl = (req, filePath) => {
    const relativePath = path_1.default.relative(config_1.config.upload.uploadPath, filePath);
    return `${req.protocol}://${req.get('host')}/uploads/${relativePath.replace(/\\/g, '/')}`;
};
exports.getFileUrl = getFileUrl;
// Helper function to delete file
const deleteFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        logger_1.logger.error('Error deleting file:', error);
    }
};
exports.deleteFile = deleteFile;
// Memory storage for image processing
const memoryStorage = multer_1.default.memoryStorage();
// Create multer instance for image processing (memory storage)
exports.imageUpload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: (_req, file, cb) => {
        try {
            imageService_1.imageService.validateImageFile(file);
            cb(null, true);
        }
        catch (error) {
            cb(error);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10, // Maximum 10 files per request
    },
});
// Image upload middleware for single image
const uploadSingleImage = (fieldName) => exports.imageUpload.single(fieldName);
exports.uploadSingleImage = uploadSingleImage;
// Image upload middleware for multiple images
const uploadMultipleImages = (fieldName, maxCount = 10) => exports.imageUpload.array(fieldName, maxCount);
exports.uploadMultipleImages = uploadMultipleImages;
//# sourceMappingURL=upload.js.map