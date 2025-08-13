import { Request, Response, NextFunction } from 'express';
export declare class CategoryController {
    /**
     * Create a new category
     */
    createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all categories
     */
    getCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get category by ID
     */
    getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get category by slug
     */
    getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update category
     */
    updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete category
     */
    deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get category tree
     */
    getCategoryTree(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get category breadcrumb
     */
    getCategoryBreadcrumb(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search categories
     */
    searchCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get categories by tag
     */
    getCategoriesByTag(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reorder categories
     */
    reorderCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const categoryController: CategoryController;
//# sourceMappingURL=categoryController.d.ts.map