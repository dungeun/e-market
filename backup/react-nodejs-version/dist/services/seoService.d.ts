export interface SEOConfig {
    maxSlugLength: number;
    maxMetaTitleLength: number;
    maxMetaDescriptionLength: number;
    defaultMetaTitle: string;
    defaultMetaDescription: string;
}
export interface SEOData {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword?: string;
}
export interface SlugOptions {
    maxLength?: number;
    suffix?: string;
    allowDuplicates?: boolean;
}
export declare class SEOService {
    private config;
    constructor(config?: Partial<SEOConfig>);
    /**
     * Generate a URL-friendly slug from a string
     */
    generateSlug(input: string, options?: SlugOptions): string;
    /**
     * Generate a unique slug by checking against existing slugs
     */
    generateUniqueSlug(input: string, existingSlugs: string[], options?: SlugOptions): string;
    /**
     * Generate meta title with proper length and formatting
     */
    generateMetaTitle(productName: string, categoryName?: string): string;
    /**
     * Generate meta description from product description
     */
    generateMetaDescription(productDescription?: string, productName?: string, price?: number): string;
    /**
     * Extract focus keyword from product name or description
     */
    extractFocusKeyword(productName: string, _description?: string): string;
    /**
     * Generate complete SEO data for a product
     */
    generateProductSEO(productName: string, description?: string, categoryName?: string, price?: number, existingSlugs?: string[]): SEOData;
    /**
     * Validate SEO data
     */
    validateSEOData(seoData: Partial<SEOData>): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Generate category slug
     */
    generateCategorySlug(categoryName: string, existingSlugs?: string[]): string;
    /**
     * Generate tag slug
     */
    generateTagSlug(tagName: string, existingSlugs?: string[]): string;
    /**
     * Generate breadcrumb schema
     */
    generateBreadcrumbSchema(breadcrumbs: Array<{
        name: string;
        url: string;
    }>): object;
    /**
     * Generate product schema markup
     */
    generateProductSchema(product: {
        name: string;
        description?: string;
        price: number;
        currency: string;
        brand?: string;
        sku: string;
        images?: string[];
        rating?: number;
        reviewCount?: number;
    }): object;
}
export declare const seoService: SEOService;
//# sourceMappingURL=seoService.d.ts.map