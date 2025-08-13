import { Product, ProductImage, ProductVariant, ProductAttribute, ProductTag } from '@prisma/client';
import { CreateProductInput, UpdateProductInput, ProductQueryInput, InventoryAdjustmentInput } from '../types/product';
type ProductWithRelations = Product & {
    category?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    images: ProductImage[];
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    tags: (ProductTag & {
        tag: {
            id: string;
            name: string;
            slug: string;
        };
    })[];
    _count?: {
        reviews: number;
        orderItems: number;
    };
};
export declare class ProductService {
    createProduct(data: CreateProductInput): Promise<ProductWithRelations>;
    getProductById(id: string): Promise<ProductWithRelations>;
    getProducts(query: ProductQueryInput): Promise<{
        products: ProductWithRelations[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateProduct(id: string, data: Omit<UpdateProductInput, 'id'>): Promise<ProductWithRelations>;
    deleteProduct(id: string): Promise<void>;
    adjustInventory(data: InventoryAdjustmentInput): Promise<void>;
    getLowStockProducts(): Promise<Product[]>;
    getProductBySlug(slug: string): Promise<ProductWithRelations>;
    generateSEOPreview(productData: {
        name: string;
        description?: string;
        categoryId?: string;
        price: number;
    }): Promise<{
        slug: string;
        metaTitle: string;
        metaDescription: string;
        focusKeyword: string;
    }>;
    validateProductSEO(seoData: {
        slug?: string;
        metaTitle?: string;
        metaDescription?: string;
        focusKeyword?: string;
    }): {
        isValid: boolean;
        errors: string[];
    };
    private generateSlug;
    private logInventoryChange;
}
export declare const productService: ProductService;
export {};
//# sourceMappingURL=productService.d.ts.map