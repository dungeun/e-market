"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.CategoryController = void 0;
const zod_1 = require("zod");
const categoryService_1 = require("../../services/categoryService");
// Validation schemas
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    slug: zod_1.z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().url().optional(),
    parentId: zod_1.z.string().optional(),
    sortOrder: zod_1.z.number().int().min(0).default(0),
    isActive: zod_1.z.boolean().default(true),
});
const updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    slug: zod_1.z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string().url().optional().nullable(),
    parentId: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const reorderCategoriesSchema = zod_1.z.array(zod_1.z.object({
    id: zod_1.z.string(),
    sortOrder: zod_1.z.number().int().min(0),
}));
class CategoryController {
    /**
     * Create a new category
     */
    async createCategory(req, res, next) {
        try {
            const validatedData = createCategorySchema.parse(req.body);
            const category = await categoryService_1.categoryService.createCategory(validatedData);
            res.status(201).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * Get all categories
     */
    async getCategories(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const categories = await categoryService_1.categoryService.getAllCategories(includeInactive);
            res.json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get category by ID
     */
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await categoryService_1.categoryService.getCategoryById(id);
            if (!category) {
                res.status(404).json({
                    success: false,
                    error: 'Category not found',
                });
                return;
            }
            res.json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get category by slug
     */
    async getCategoryBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const category = await categoryService_1.categoryService.getCategoryBySlug(slug);
            if (!category) {
                res.status(404).json({
                    success: false,
                    error: 'Category not found',
                });
                return;
            }
            res.json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update category
     */
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = updateCategorySchema.parse(req.body);
            const category = await categoryService_1.categoryService.updateCategory(id, validatedData);
            res.json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                });
            }
            else if (error instanceof Error && error.message.includes('Circular reference')) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * Delete category
     */
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            await categoryService_1.categoryService.deleteCategory(id);
            res.json({
                success: true,
                message: 'Category deleted successfully',
            });
        }
        catch (error) {
            if (error instanceof Error &&
                (error.message.includes('Cannot delete category with children') ||
                    error.message.includes('Cannot delete category with products'))) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                next(error);
            }
        }
    }
    /**
     * Get category tree
     */
    async getCategoryTree(req, res, next) {
        try {
            const { id } = req.params;
            const tree = await categoryService_1.categoryService.getCategoryTree(id);
            if (!tree) {
                res.status(404).json({
                    success: false,
                    error: 'Category not found',
                });
                return;
            }
            res.json({
                success: true,
                data: tree,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get category breadcrumb
     */
    async getCategoryBreadcrumb(req, res, next) {
        try {
            const { id } = req.params;
            const breadcrumb = await categoryService_1.categoryService.getCategoryBreadcrumb(id);
            res.json({
                success: true,
                data: breadcrumb,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Search categories
     */
    async searchCategories(req, res, next) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Query parameter "q" is required',
                });
                return;
            }
            const categories = await categoryService_1.categoryService.searchCategories(q);
            res.json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get categories by tag
     */
    async getCategoriesByTag(req, res, next) {
        try {
            const { tagId } = req.params;
            const categories = await categoryService_1.categoryService.getCategoriesByTag(tagId);
            res.json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reorder categories
     */
    async reorderCategories(req, res, next) {
        try {
            const validatedData = reorderCategoriesSchema.parse(req.body);
            await categoryService_1.categoryService.reorderCategories(validatedData);
            res.json({
                success: true,
                message: 'Categories reordered successfully',
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                });
            }
            else {
                next(error);
            }
        }
    }
}
exports.CategoryController = CategoryController;
exports.categoryController = new CategoryController();
//# sourceMappingURL=categoryController.js.map