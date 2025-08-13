import { Category } from '@prisma/client';
export interface CategoryWithChildren extends Category {
    children?: CategoryWithChildren[];
}
export interface CreateCategoryInput {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export interface UpdateCategoryInput {
    name?: string;
    slug?: string;
    description?: string;
    image?: string | null;
    parentId?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class CategoryService {
    /**
     * Create a new category
     */
    createCategory(data: CreateCategoryInput): Promise<Category>;
    /**
     * Get all categories with hierarchical structure
     */
    getAllCategories(includeInactive?: boolean): Promise<CategoryWithChildren[]>;
    /**
     * Get category by ID
     */
    getCategoryById(id: string): Promise<Category | null>;
    /**
     * Get category by slug
     */
    getCategoryBySlug(slug: string): Promise<Category | null>;
    /**
     * Update category
     */
    updateCategory(id: string, data: UpdateCategoryInput): Promise<Category>;
    /**
     * Delete category
     */
    deleteCategory(id: string): Promise<void>;
    /**
     * Get category tree starting from a specific category
     */
    getCategoryTree(categoryId: string): Promise<CategoryWithChildren | null>;
    /**
     * Get all parent categories (breadcrumb)
     */
    getCategoryBreadcrumb(categoryId: string): Promise<Category[]>;
    /**
     * Search categories by name
     */
    searchCategories(query: string): Promise<Category[]>;
    /**
     * Get categories by tag
     */
    getCategoriesByTag(tagId: string): Promise<Category[]>;
    /**
     * Reorder categories
     */
    reorderCategories(updates: {
        id: string;
        sortOrder: number;
    }[]): Promise<void>;
    /**
     * Private helper methods
     */
    private buildCategoryTree;
    private buildCategoryBranch;
    private validateParentCategory;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=categoryService.d.ts.map