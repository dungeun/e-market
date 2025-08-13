"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const error_1 = require("../middleware/error");
class StorageService {
    constructor(config) {
        this.config = config;
        if (config.provider === 'aws' && config.aws) {
            aws_sdk_1.default.config.update({
                region: config.aws.region,
                accessKeyId: config.aws.accessKeyId,
                secretAccessKey: config.aws.secretAccessKey,
            });
            this.s3 = new aws_sdk_1.default.S3({
                endpoint: config.aws.endpoint,
            });
        }
    }
    async uploadFile(buffer, filename, contentType, folder = 'images') {
        const key = `${folder}/${Date.now()}-${filename}`;
        if (this.config.provider === 'aws' && this.s3 && this.config.aws) {
            return this.uploadToS3(buffer, key, contentType);
        }
        else {
            return this.uploadToLocal(buffer, key, contentType);
        }
    }
    async uploadToS3(buffer, key, contentType) {
        if (!this.s3 || !this.config.aws) {
            throw new error_1.AppError('S3 not configured', 500);
        }
        try {
            const uploadParams = {
                Bucket: this.config.aws.bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                ACL: 'public-read',
                CacheControl: 'max-age=31536000', // 1 year
            };
            const result = await this.s3.upload(uploadParams).promise();
            logger_1.logger.info(`File uploaded to S3: ${key}`);
            return {
                url: result.Location,
                key,
                provider: 'aws',
            };
        }
        catch (error) {
            logger_1.logger.error('S3 upload failed:', error);
            throw new error_1.AppError('Failed to upload file to S3', 500);
        }
    }
    async uploadToLocal(buffer, key, _contentType) {
        if (!this.config.local) {
            throw new error_1.AppError('Local storage not configured', 500);
        }
        try {
            const filePath = path_1.default.join(this.config.local.uploadPath, key);
            const dir = path_1.default.dirname(filePath);
            // Ensure directory exists
            await fs_1.promises.mkdir(dir, { recursive: true });
            // Write file
            await fs_1.promises.writeFile(filePath, buffer);
            const url = `${this.config.local.baseUrl}/${key}`;
            logger_1.logger.info(`File uploaded locally: ${key}`);
            return {
                url,
                key,
                provider: 'local',
            };
        }
        catch (error) {
            logger_1.logger.error('Local upload failed:', error);
            throw new error_1.AppError('Failed to upload file locally', 500);
        }
    }
    async deleteFile(key) {
        if (this.config.provider === 'aws' && this.s3 && this.config.aws) {
            return this.deleteFromS3(key);
        }
        else {
            return this.deleteFromLocal(key);
        }
    }
    async deleteFromS3(key) {
        if (!this.s3 || !this.config.aws) {
            throw new error_1.AppError('S3 not configured', 500);
        }
        try {
            await this.s3
                .deleteObject({
                Bucket: this.config.aws.bucket,
                Key: key,
            })
                .promise();
            logger_1.logger.info(`File deleted from S3: ${key}`);
        }
        catch (error) {
            logger_1.logger.error('S3 deletion failed:', error);
            throw new error_1.AppError('Failed to delete file from S3', 500);
        }
    }
    async deleteFromLocal(key) {
        if (!this.config.local) {
            throw new error_1.AppError('Local storage not configured', 500);
        }
        try {
            const filePath = path_1.default.join(this.config.local.uploadPath, key);
            await fs_1.promises.unlink(filePath);
            logger_1.logger.info(`File deleted locally: ${key}`);
        }
        catch (error) {
            logger_1.logger.error('Local deletion failed:', error);
            throw new error_1.AppError('Failed to delete file locally', 500);
        }
    }
    async copyFile(sourceKey, destinationKey) {
        if (this.config.provider === 'aws' && this.s3 && this.config.aws) {
            return this.copyInS3(sourceKey, destinationKey);
        }
        else {
            return this.copyInLocal(sourceKey, destinationKey);
        }
    }
    async copyInS3(sourceKey, destinationKey) {
        if (!this.s3 || !this.config.aws) {
            throw new error_1.AppError('S3 not configured', 500);
        }
        try {
            await this.s3
                .copyObject({
                Bucket: this.config.aws.bucket,
                CopySource: `${this.config.aws.bucket}/${sourceKey}`,
                Key: destinationKey,
                ACL: 'public-read',
            })
                .promise();
            const url = `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com/${destinationKey}`;
            logger_1.logger.info(`File copied in S3: ${sourceKey} -> ${destinationKey}`);
            return {
                url,
                key: destinationKey,
                provider: 'aws',
            };
        }
        catch (error) {
            logger_1.logger.error('S3 copy failed:', error);
            throw new error_1.AppError('Failed to copy file in S3', 500);
        }
    }
    async copyInLocal(sourceKey, destinationKey) {
        if (!this.config.local) {
            throw new error_1.AppError('Local storage not configured', 500);
        }
        try {
            const sourcePath = path_1.default.join(this.config.local.uploadPath, sourceKey);
            const destinationPath = path_1.default.join(this.config.local.uploadPath, destinationKey);
            const dir = path_1.default.dirname(destinationPath);
            // Ensure directory exists
            await fs_1.promises.mkdir(dir, { recursive: true });
            // Copy file
            await fs_1.promises.copyFile(sourcePath, destinationPath);
            const url = `${this.config.local.baseUrl}/${destinationKey}`;
            logger_1.logger.info(`File copied locally: ${sourceKey} -> ${destinationKey}`);
            return {
                url,
                key: destinationKey,
                provider: 'local',
            };
        }
        catch (error) {
            logger_1.logger.error('Local copy failed:', error);
            throw new error_1.AppError('Failed to copy file locally', 500);
        }
    }
    getFileUrl(key) {
        if (this.config.provider === 'aws' && this.config.aws) {
            return `https://${this.config.aws.bucket}.s3.${this.config.aws.region}.amazonaws.com/${key}`;
        }
        else if (this.config.local) {
            return `${this.config.local.baseUrl}/${key}`;
        }
        else {
            throw new error_1.AppError('Storage not configured', 500);
        }
    }
}
exports.StorageService = StorageService;
// Create storage service instance based on environment
const storageConfig = {
    provider: process.env.STORAGE_PROVIDER || 'local',
    aws: process.env.AWS_S3_BUCKET
        ? {
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            bucket: process.env.AWS_S3_BUCKET,
            endpoint: process.env.AWS_S3_ENDPOINT,
        }
        : undefined,
    local: {
        uploadPath: process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads'),
        baseUrl: process.env.BASE_URL || 'http://localhost:3000/uploads',
    },
};
exports.storageService = new StorageService(storageConfig);
//# sourceMappingURL=storageService.js.map