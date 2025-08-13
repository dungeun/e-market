import { CreateProductOptionInput, UpdateProductOptionInput, ProductOption, ProductWithOptions, SelectedProductOptions, OptionValidationResult, OptionPriceCalculation, BulkOptionOperation, OptionTemplate } from '../types/productOptions';
export declare class ProductOptionsService {
    createProductOption(data: CreateProductOptionInput): Promise<ProductOption>;
    getProductOptionById(optionId: string): Promise<ProductOption>;
    getProductOptions(productId: string): Promise<ProductOption[]>;
    updateProductOption(optionId: string, data: UpdateProductOptionInput): Promise<ProductOption>;
    deleteProductOption(optionId: string): Promise<void>;
    addOptionValue(optionId: string, valueData: any): Promise<void>;
    updateOptionValue(valueId: string, valueData: any): Promise<void>;
    deleteOptionValue(valueId: string): Promise<void>;
    getProductWithOptions(productId: string): Promise<ProductWithOptions>;
    validateProductOptions(productId: string, selectedOptions: SelectedProductOptions): Promise<OptionValidationResult>;
    calculateOptionPricing(productId: string, selectedOptions: SelectedProductOptions): Promise<OptionPriceCalculation>;
    bulkOptionOperation(operation: BulkOptionOperation): Promise<void>;
    applyOptionTemplate(productId: string, templateId: string): Promise<void>;
    getOptionTemplates(): OptionTemplate[];
    cloneProductOptions(sourceProductId: string, targetProductId: string): Promise<void>;
}
export declare const productOptionsService: ProductOptionsService;
//# sourceMappingURL=productOptionsService.d.ts.map