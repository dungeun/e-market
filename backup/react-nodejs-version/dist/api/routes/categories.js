"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', categoryController_1.categoryController.getCategories);
router.get('/search', categoryController_1.categoryController.searchCategories);
router.get('/tag/:tagId', categoryController_1.categoryController.getCategoriesByTag);
router.get('/:id', categoryController_1.categoryController.getCategoryById);
router.get('/slug/:slug', categoryController_1.categoryController.getCategoryBySlug);
router.get('/:id/tree', categoryController_1.categoryController.getCategoryTree);
router.get('/:id/breadcrumb', categoryController_1.categoryController.getCategoryBreadcrumb);
// Admin routes
router.post('/', auth_1.authMiddleware, categoryController_1.categoryController.createCategory);
router.put('/:id', auth_1.authMiddleware, categoryController_1.categoryController.updateCategory);
router.delete('/:id', auth_1.authMiddleware, categoryController_1.categoryController.deleteCategory);
router.post('/reorder', auth_1.authMiddleware, categoryController_1.categoryController.reorderCategories);
exports.default = router;
//# sourceMappingURL=categories.js.map