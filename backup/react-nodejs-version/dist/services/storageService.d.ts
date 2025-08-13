/// <reference types="node" />
/// <reference types="node" />
export interface CloudStorageConfig {
    provider: 'aws' | 'local';
    aws?: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        endpoint?: string;
    };
    local?: {
        uploadPath: string;
        baseUrl: string;
    };
}
export interface UploadResult {
    url: string;
    key: string;
    provider: string;
}
export declare class StorageService {
    private s3?;
    private config;
    constructor(config: CloudStorageConfig);
    uploadFile(buffer: Buffer, filename: string, contentType: string, folder?: string): Promise<UploadResult>;
    private uploadToS3;
    private uploadToLocal;
    deleteFile(key: string): Promise<void>;
    private deleteFromS3;
    private deleteFromLocal;
    copyFile(sourceKey: string, destinationKey: string): Promise<UploadResult>;
    private copyInS3;
    private copyInLocal;
    getFileUrl(key: string): string;
}
export declare const storageService: StorageService;
//# sourceMappingURL=storageService.d.ts.map