"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withQueryCache = exports.QueryOptimizationService = void 0;
const logger_1 = require("../utils/logger");
class QueryOptimizationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create database indexes for optimal performance
     */
    async createIndexes() {
        try {
            logger_1.logger.info('Creating database indexes for performance optimization...');
            // Product indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_products_slug ON "Product"(slug);
        CREATE INDEX IF NOT EXISTS idx_products_status ON "Product"(status);
        CREATE INDEX IF NOT EXISTS idx_products_price ON "Product"(price);
        CREATE INDEX IF NOT EXISTS idx_products_created ON "Product"("createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_products_category ON "Product"("categoryId");
        CREATE INDEX IF NOT EXISTS idx_products_composite ON "Product"(status, "categoryId", price);
      `);
            // Category indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON "Category"(slug);
        CREATE INDEX IF NOT EXISTS idx_categories_parent ON "Category"("parentId");
        CREATE INDEX IF NOT EXISTS idx_categories_active ON "Category"("isActive");
      `);
            // Order indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_orders_user ON "Order"("userId");
        CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"(status);
        CREATE INDEX IF NOT EXISTS idx_orders_created ON "Order"("createdAt" DESC);
        CREATE INDEX IF NOT EXISTS idx_orders_composite ON "Order"("userId", status, "createdAt" DESC);
      `);
            // Cart indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_carts_session ON "Cart"("sessionId");
        CREATE INDEX IF NOT EXISTS idx_carts_user ON "Cart"("userId");
        CREATE INDEX IF NOT EXISTS idx_carts_updated ON "Cart"("updatedAt" DESC);
      `);
            // CartItem indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON "CartItem"("cartId");
        CREATE INDEX IF NOT EXISTS idx_cart_items_product ON "CartItem"("productId");
      `);
            // Inventory indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_inventory_product ON "ProductInventory"("productId");
        CREATE INDEX IF NOT EXISTS idx_inventory_sku ON "ProductInventory"(sku);
        CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON "ProductInventory"(quantity);
      `);
            // Search optimization - Full text search indexes
            await this.prisma.$executeRawUnsafe(`
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON "Product" USING gin(name gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON "Product" USING gin(description gin_trgm_ops);
      `);
            logger_1.logger.info('Database indexes created successfully');
        }
        catch (error) {
            logger_1.logger.error('Error creating database indexes:', error);
            throw error;
        }
    }
    /**
     * Analyze query performance
     */
    async analyzeQuery(query) {
        try {
            const result = await this.prisma.$executeRawUnsafe(`EXPLAIN ANALYZE ${query}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error analyzing query:', error);
            throw error;
        }
    }
    /**
     * Get slow queries from pg_stat_statements
     */
    async getSlowQueries(limit = 10) {
        try {
            // Enable pg_stat_statements extension if not enabled
            await this.prisma.$executeRawUnsafe(`
        CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
      `);
            const slowQueries = await this.prisma.$queryRaw `
        SELECT 
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          min_exec_time,
          max_exec_time,
          stddev_exec_time
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_exec_time DESC
        LIMIT ${limit}
      `;
            return slowQueries;
        }
        catch (error) {
            logger_1.logger.error('Error getting slow queries:', error);
            return [];
        }
    }
    /**
     * Optimize common queries with query hints
     */
    getOptimizedQueries() {
        return {
            // Product listing with pagination
            productList: (limit, offset, categoryId) => {
                const baseQuery = this.prisma.product.findMany({
                    where: {
                        status: 'PUBLISHED',
                        ...(categoryId && { categoryId }),
                    },
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        images: {
                            select: {
                                id: true,
                                url: true,
                                alt: true,
                                sortOrder: true,
                            },
                            orderBy: {
                                sortOrder: 'asc',
                            },
                        },
                        _count: {
                            select: {
                                reviews: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: limit,
                    skip: offset,
                });
                return baseQuery;
            },
            // Product search with full-text search
            productSearch: (searchTerm, limit = 20) => {
                return this.prisma.$queryRaw `
          SELECT 
            p.*,
            ts_rank(
              to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
              plainto_tsquery('english', ${searchTerm})
            ) as rank
          FROM "Product" p
          WHERE 
            p.status = 'PUBLISHED' AND
            to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ 
            plainto_tsquery('english', ${searchTerm})
          ORDER BY rank DESC
          LIMIT ${limit}
        `;
            },
            // Category tree with recursive CTE
            categoryTree: () => {
                return this.prisma.$queryRaw `
          WITH RECURSIVE category_tree AS (
            SELECT 
              id, name, slug, "parentId", "isActive", 0 as depth,
              ARRAY[id] as path,
              name::text as full_path
            FROM "Category"
            WHERE "parentId" IS NULL AND "isActive" = true
            
            UNION ALL
            
            SELECT 
              c.id, c.name, c.slug, c."parentId", c."isActive", ct.depth + 1,
              ct.path || c.id,
              ct.full_path || ' > ' || c.name
            FROM "Category" c
            INNER JOIN category_tree ct ON c."parentId" = ct.id
            WHERE c."isActive" = true
          )
          SELECT * FROM category_tree
          ORDER BY path
        `;
            },
            // Order with all related data (optimized joins)
            orderWithDetails: (orderId) => {
                return this.prisma.order.findUnique({
                    where: { id: orderId },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        images: {
                                            take: 1,
                                            orderBy: {
                                                sortOrder: 'asc',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        payments: true,
                    },
                });
            },
        };
    }
    /**
     * Database connection pooling stats
     */
    async getConnectionPoolStats() {
        try {
            const stats = await this.prisma.$queryRaw `
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
          max(backend_start) as oldest_connection
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Error getting connection pool stats:', error);
            return null;
        }
    }
    /**
     * Vacuum and analyze tables for performance
     */
    async performMaintenance() {
        try {
            logger_1.logger.info('Starting database maintenance...');
            const tables = [
                'Product', 'Category', 'Order', 'Cart', 'CartItem',
                'ProductInventory', 'User', 'Review',
            ];
            for (const table of tables) {
                await this.prisma.$executeRawUnsafe(`VACUUM ANALYZE "${table}"`);
                logger_1.logger.info(`Vacuum and analyze completed for table: ${table}`);
            }
            logger_1.logger.info('Database maintenance completed');
        }
        catch (error) {
            logger_1.logger.error('Error during database maintenance:', error);
        }
    }
}
exports.QueryOptimizationService = QueryOptimizationService;
/**
 * Query result cache wrapper
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function withQueryCache(fn, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
getCacheKey, ttl) {
    return (async (...args) => {
        const { cacheService } = await Promise.resolve().then(() => __importStar(require('./cacheService')));
        const cacheKey = getCacheKey(...args);
        return cacheService.getOrSet(cacheKey, () => fn(...args), { ttl });
    });
}
exports.withQueryCache = withQueryCache;
//# sourceMappingURL=queryOptimizationService.js.map