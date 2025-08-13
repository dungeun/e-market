/// <reference types="node" />
/// <reference types="node" />
import sharp from 'sharp';
export interface ImageProcessingOptions {
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    maxWidth?: number;
    maxHeight?: number;
}
export interface ThumbnailConfig {
    width: number;
    height: number;
    suffix: string;
}
export interface ProcessedImage {
    originalPath: string;
    thumbnails: Array<{
        path: string;
        width: number;
        height: number;
        size: number;
    }>;
    metadata: {
        width: number;
        height: number;
        format: string;
        size: number;
    };
}
export declare class ImageService {
    private readonly uploadDir;
    private readonly thumbnailConfigs;
    constructor();
    private ensureUploadDirExists;
    processImage(buffer: Buffer, _filename: string, options?: ImageProcessingOptions): Promise<ProcessedImage>;
    deleteImage(imagePath: string): Promise<void>;
    getImageInfo(imagePath: string): Promise<sharp.Metadata>;
    validateImageFile(file: any): boolean;
    getImageUrl(imagePath: string): string;
    getThumbnailUrl(imagePath: string, size: 'thumb' | 'small' | 'medium' | 'large'): string;
}
export declare const imageService: ImageService;
//# sourceMappingURL=imageService.d.ts.map