import { z } from 'zod';
export declare const ProductOptionTypeSchema: z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>;
export declare const ProductOptionValueSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    value: z.ZodString;
    displayValue: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priceAdjustment: z.ZodOptional<z.ZodNumber>;
    sku: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    hexColor: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    isActive: boolean;
    sortOrder: number;
    displayValue: string;
    image?: string | undefined;
    id?: string | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    priceAdjustment?: number | undefined;
    hexColor?: string | undefined;
}, {
    value: string;
    displayValue: string;
    image?: string | undefined;
    id?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    sortOrder?: number | undefined;
    priceAdjustment?: number | undefined;
    hexColor?: string | undefined;
}>;
export declare const ProductOptionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    values: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        value: z.ZodString;
        displayValue: z.ZodString;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        priceAdjustment: z.ZodOptional<z.ZodNumber>;
        sku: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
        hexColor: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        isActive: boolean;
        sortOrder: number;
        displayValue: string;
        image?: string | undefined;
        id?: string | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }, {
        value: string;
        displayValue: string;
        image?: string | undefined;
        id?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        sortOrder?: number | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
    name: string;
    isActive: boolean;
    sortOrder: number;
    productId: string;
    displayName: string;
    isRequired: boolean;
    values?: {
        value: string;
        isActive: boolean;
        sortOrder: number;
        displayValue: string;
        image?: string | undefined;
        id?: string | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }[] | undefined;
    id?: string | undefined;
    config?: Record<string, any> | undefined;
}, {
    name: string;
    productId: string;
    displayName: string;
    type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
    values?: {
        value: string;
        displayValue: string;
        image?: string | undefined;
        id?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        sortOrder?: number | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }[] | undefined;
    id?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    isRequired?: boolean | undefined;
    config?: Record<string, any> | undefined;
}>;
export declare const CreateProductOptionSchema: z.ZodObject<{
    productId: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    values: z.ZodArray<z.ZodObject<Omit<{
        id: z.ZodOptional<z.ZodString>;
        value: z.ZodString;
        displayValue: z.ZodString;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        priceAdjustment: z.ZodOptional<z.ZodNumber>;
        sku: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
        hexColor: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "id">, "strip", z.ZodTypeAny, {
        value: string;
        isActive: boolean;
        sortOrder: number;
        displayValue: string;
        image?: string | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }, {
        value: string;
        displayValue: string;
        image?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        sortOrder?: number | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
    values: {
        value: string;
        isActive: boolean;
        sortOrder: number;
        displayValue: string;
        image?: string | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }[];
    name: string;
    sortOrder: number;
    productId: string;
    displayName: string;
    isRequired: boolean;
    config?: Record<string, any> | undefined;
}, {
    values: {
        value: string;
        displayValue: string;
        image?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        sku?: string | undefined;
        sortOrder?: number | undefined;
        priceAdjustment?: number | undefined;
        hexColor?: string | undefined;
    }[];
    name: string;
    productId: string;
    displayName: string;
    type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
    sortOrder?: number | undefined;
    isRequired?: boolean | undefined;
    config?: Record<string, any> | undefined;
}>;
export declare const UpdateProductOptionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    displayName?: string | undefined;
    isRequired?: boolean | undefined;
    config?: Record<string, any> | undefined;
}, {
    type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
    name?: string | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
    displayName?: string | undefined;
    isRequired?: boolean | undefined;
    config?: Record<string, any> | undefined;
}>;
export declare const SelectedProductOptionsSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>>;
export declare const CartItemWithOptionsSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    productId: string;
    options?: Record<string, string | number | boolean | string[]> | undefined;
    variantId?: string | undefined;
}, {
    quantity: number;
    productId: string;
    options?: Record<string, string | number | boolean | string[]> | undefined;
    variantId?: string | undefined;
}>;
export declare const ValidateProductOptionsSchema: z.ZodObject<{
    productId: z.ZodString;
    selectedOptions: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodNumber, z.ZodBoolean]>>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    selectedOptions: Record<string, string | number | boolean | string[]>;
}, {
    productId: string;
    selectedOptions: Record<string, string | number | boolean | string[]>;
}>;
export declare const SelectOptionConfigSchema: z.ZodObject<{
    multiSelect: z.ZodDefault<z.ZodBoolean>;
    maxSelections: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    multiSelect: boolean;
    maxSelections?: number | undefined;
}, {
    multiSelect?: boolean | undefined;
    maxSelections?: number | undefined;
}>;
export declare const NumberOptionConfigSchema: z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    step: z.ZodOptional<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    unit?: string | undefined;
}, {
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    unit?: string | undefined;
}>;
export declare const TextOptionConfigSchema: z.ZodObject<{
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    placeholder: z.ZodOptional<z.ZodString>;
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pattern?: string | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    placeholder?: string | undefined;
}, {
    pattern?: string | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    placeholder?: string | undefined;
}>;
export declare const FileOptionConfigSchema: z.ZodObject<{
    allowedTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxSize: z.ZodOptional<z.ZodNumber>;
    maxFiles: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxFiles: number;
    allowedTypes?: string[] | undefined;
    maxSize?: number | undefined;
}, {
    allowedTypes?: string[] | undefined;
    maxFiles?: number | undefined;
    maxSize?: number | undefined;
}>;
export declare const RangeOptionConfigSchema: z.ZodObject<{
    min: z.ZodNumber;
    max: z.ZodNumber;
    step: z.ZodDefault<z.ZodNumber>;
    unit: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    max: number;
    min: number;
    step: number;
    unit?: string | undefined;
}, {
    max: number;
    min: number;
    step?: number | undefined;
    unit?: string | undefined;
}>;
export type ProductOptionType = z.infer<typeof ProductOptionTypeSchema>;
export type ProductOptionValue = z.infer<typeof ProductOptionValueSchema>;
export type ProductOption = z.infer<typeof ProductOptionSchema>;
export type CreateProductOptionInput = z.infer<typeof CreateProductOptionSchema>;
export type UpdateProductOptionInput = z.infer<typeof UpdateProductOptionSchema>;
export type SelectedProductOptions = z.infer<typeof SelectedProductOptionsSchema>;
export type CartItemWithOptions = z.infer<typeof CartItemWithOptionsSchema>;
export type ValidateProductOptionsInput = z.infer<typeof ValidateProductOptionsSchema>;
export type SelectOptionConfig = z.infer<typeof SelectOptionConfigSchema>;
export type NumberOptionConfig = z.infer<typeof NumberOptionConfigSchema>;
export type TextOptionConfig = z.infer<typeof TextOptionConfigSchema>;
export type FileOptionConfig = z.infer<typeof FileOptionConfigSchema>;
export type RangeOptionConfig = z.infer<typeof RangeOptionConfigSchema>;
export interface ProductWithOptions {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    comparePrice?: number;
    status: string;
    type: string;
    description?: string;
    images: Array<{
        id: string;
        url: string;
        alt?: string;
        isMain: boolean;
    }>;
    variants: Array<{
        id: string;
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
        quantity: number;
    }>;
    options: Array<{
        id: string;
        name: string;
        displayName: string;
        type: ProductOptionType;
        isRequired: boolean;
        sortOrder: number;
        config?: Record<string, any>;
        values: Array<{
            id: string;
            value: string;
            displayValue: string;
            priceAdjustment?: number;
            sku?: string;
            image?: string;
            hexColor?: string;
            description?: string;
        }>;
    }>;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}
export interface OptionValidationResult {
    isValid: boolean;
    errors: Array<{
        optionName: string;
        message: string;
        code: string;
    }>;
    warnings: Array<{
        optionName: string;
        message: string;
    }>;
}
export interface OptionPriceCalculation {
    basePrice: number;
    optionAdjustments: Record<string, number>;
    totalAdjustment: number;
    finalPrice: number;
    breakdown: Array<{
        optionName: string;
        optionValue: string;
        adjustment: number;
    }>;
}
export interface OptionDisplayConfig {
    showPriceAdjustment: boolean;
    showImages: boolean;
    showDescriptions: boolean;
    groupSimilarOptions: boolean;
    sortBy: 'sortOrder' | 'name' | 'price';
    layout: 'grid' | 'list' | 'inline';
}
export declare const BulkOptionOperationSchema: z.ZodObject<{
    operation: z.ZodEnum<["create", "update", "delete", "reorder"]>;
    options: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        displayName: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>>;
        isRequired: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        values: z.ZodArray<z.ZodObject<Omit<{
            id: z.ZodOptional<z.ZodString>;
            value: z.ZodString;
            displayValue: z.ZodString;
            sortOrder: z.ZodDefault<z.ZodNumber>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            priceAdjustment: z.ZodOptional<z.ZodNumber>;
            sku: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
            hexColor: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "id">, "strip", z.ZodTypeAny, {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }, {
            value: string;
            displayValue: string;
            image?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
        values: {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[];
        name: string;
        sortOrder: number;
        productId: string;
        displayName: string;
        isRequired: boolean;
        config?: Record<string, any> | undefined;
    }, {
        values: {
            value: string;
            displayValue: string;
            image?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[];
        name: string;
        productId: string;
        displayName: string;
        type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        config?: Record<string, any> | undefined;
    }>, z.ZodObject<{
        productId: z.ZodString;
        name: z.ZodString;
        displayName: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["SELECT", "RADIO", "CHECKBOX", "TEXT", "TEXTAREA", "NUMBER", "COLOR", "DATE", "FILE", "RANGE"]>>;
        isRequired: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        values: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            value: z.ZodString;
            displayValue: z.ZodString;
            sortOrder: z.ZodDefault<z.ZodNumber>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            priceAdjustment: z.ZodOptional<z.ZodNumber>;
            sku: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
            hexColor: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }, {
            value: string;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }>, "many">>;
    } & {
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
        name: string;
        id: string;
        isActive: boolean;
        sortOrder: number;
        productId: string;
        displayName: string;
        isRequired: boolean;
        values?: {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[] | undefined;
        config?: Record<string, any> | undefined;
    }, {
        name: string;
        id: string;
        productId: string;
        displayName: string;
        type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
        values?: {
            value: string;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        config?: Record<string, any> | undefined;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    options: ({
        type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
        values: {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[];
        name: string;
        sortOrder: number;
        productId: string;
        displayName: string;
        isRequired: boolean;
        config?: Record<string, any> | undefined;
    } | {
        type: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE";
        name: string;
        id: string;
        isActive: boolean;
        sortOrder: number;
        productId: string;
        displayName: string;
        isRequired: boolean;
        values?: {
            value: string;
            isActive: boolean;
            sortOrder: number;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[] | undefined;
        config?: Record<string, any> | undefined;
    })[];
    operation: "update" | "create" | "delete" | "reorder";
}, {
    options: ({
        values: {
            value: string;
            displayValue: string;
            image?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[];
        name: string;
        productId: string;
        displayName: string;
        type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        config?: Record<string, any> | undefined;
    } | {
        name: string;
        id: string;
        productId: string;
        displayName: string;
        type?: "SELECT" | "RANGE" | "RADIO" | "CHECKBOX" | "TEXT" | "TEXTAREA" | "NUMBER" | "COLOR" | "DATE" | "FILE" | undefined;
        values?: {
            value: string;
            displayValue: string;
            image?: string | undefined;
            id?: string | undefined;
            isActive?: boolean | undefined;
            description?: string | undefined;
            sku?: string | undefined;
            sortOrder?: number | undefined;
            priceAdjustment?: number | undefined;
            hexColor?: string | undefined;
        }[] | undefined;
        isActive?: boolean | undefined;
        sortOrder?: number | undefined;
        isRequired?: boolean | undefined;
        config?: Record<string, any> | undefined;
    })[];
    operation: "update" | "create" | "delete" | "reorder";
}>;
export type BulkOptionOperation = z.infer<typeof BulkOptionOperationSchema>;
export interface OptionTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    options: Array<Omit<CreateProductOptionInput, 'productId'>>;
}
export declare const OPTION_TEMPLATES: OptionTemplate[];
//# sourceMappingURL=productOptions.d.ts.map