import { productService } from '../services/product-service'
import { orderService } from '../services/order-service'
import { paymentService } from '../services/payment-service'
import { inventoryService } from '../services/inventory-service'
import { cartService } from '../services/cart-service'
// import { categoryService } from '../services/category-service' // TODO: implement category service

export const resolvers = {
  Query: {
    // Product queries
    products: async (_: unknown, args: unknown) => {
      const { filter = {}, first = 20, after } = args
      
      const page = after ? parseInt(Buffer.from(after, 'base64').toString()) : 1
      
      const result = await productService.getProducts({
        ...filter,
        page,
        limit: first,
        sortBy: filter.sortBy?.toLowerCase()
      })
      
      const edges = result.products.map((product, index) => ({
        node: product,
        cursor: Buffer.from(`${page}:${index}`).toString('base64')
      }))
      
      return {
        edges,
        pageInfo: {
          hasNextPage: page * first < result.total,
          hasPreviousPage: page > 1,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor
        },
        totalCount: result.total
      }
    },
    
    product: async (_: unknown, args: { id?: string; slug?: string }) => {
      const identifier = args.id || args.slug
      if (!identifier) return null
      
      return await productService.getProduct(identifier)
    },
    
    searchProducts: async (_: unknown, args: { query: string; limit?: number }) => {
      return await productService.searchProducts(args.query, args.limit || 10)
    },
    
    relatedProducts: async (_: unknown, args: { productId: string; limit?: number }) => {
      return await productService.getRelatedProducts(args.productId, args.limit || 4)
    },
    
    // Category queries
    categories: async () => {
      // TODO: implement category service
      return []
    },
    
    category: async (_: unknown, args: { id?: string; slug?: string }) => {
      // TODO: implement category service
      return null
    },
    
    // Order queries
    orders: async (_: unknown, args: unknown, context: unknown) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.getOrders({
        customerId: args.customerId || context.user.id,
        status: args.status,
        limit: args.first,
        page: args.after ? parseInt(Buffer.from(args.after, 'base64').toString()) : 1
      })
    },
    
    order: async (_: unknown, args: { id: string }, context: unknown) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.getOrder(args.id, context.user.id)
    },
    
    // Cart queries
    cart: async (_: unknown, args: { userId?: string }, context: unknown) => {
      const userId = args.userId || context.user?.id || context.sessionId
      return await cartService.getCart(userId)
    },
    
    // Inventory queries
    inventory: async (_: unknown, args: { productId: string }) => {
      return await inventoryService.getInventory(args.productId)
    },
    
    checkStock: async (_: unknown, args: { productId: string; quantity: number }) => {
      return await inventoryService.checkStock(args.productId, args.quantity)
    }
  },
  
  Mutation: {
    // Cart mutations
    addToCart: async (_: unknown, args: { input: any }, context: unknown) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.addToCart(userId, args.input.productId, args.input.quantity)
    },
    
    updateCartItem: async (_: unknown, args: { cartItemId: string; quantity: number }, context: unknown) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.updateCartItem(userId, args.cartItemId, args.quantity)
    },
    
    removeFromCart: async (_: unknown, args: { cartItemId: string }, context: unknown) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.removeFromCart(userId, args.cartItemId)
    },
    
    clearCart: async (_: unknown, args: { userId?: string }, context: unknown) => {
      const userId = args.userId || context.user?.id || context.sessionId
      return await cartService.clearCart(userId)
    },
    
    // Order mutations
    createOrder: async (_: unknown, args: { input: any }, context: unknown) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.createOrder({
        ...args.input,
        customerId: args.input.customerId || context.user.id
      })
    },
    
    updateOrderStatus: async (_: unknown, args: { orderId: string; status: string }, context: unknown) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await orderService.updateOrderStatus(args.orderId, args.status)
    },
    
    cancelOrder: async (_: unknown, args: { orderId: string }, context: unknown) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.cancelOrder(args.orderId, context.user.id)
    },
    
    // Payment mutations
    processPayment: async (_: unknown, args: { orderId: string; paymentMethod: string }, context: unknown) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await paymentService.processPayment(args.orderId, args.paymentMethod, context.user.id)
    },
    
    refundPayment: async (_: unknown, args: { paymentId: string; amount?: number }, context: unknown) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await paymentService.refundPayment(args.paymentId, args.amount)
    },
    
    // Inventory mutations
    updateStock: async (_: unknown, args: unknown, context: unknown) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await inventoryService.updateStock(
        args.productId,
        args.quantity,
        args.operation.toLowerCase()
      )
    },
    
    reserveStock: async (_: unknown, args: { productId: string; quantity: number }) => {
      return await inventoryService.reserveStock(args.productId, args.quantity)
    },
    
    releaseStock: async (_: unknown, args: { productId: string; quantity: number }) => {
      return await inventoryService.releaseStock(args.productId, args.quantity)
    }
  },
  
  Subscription: {
    orderStatusChanged: {
      subscribe: (_: unknown, args: { orderId: string }) => {
        return pubsub.asyncIterator([`ORDER_STATUS_${args.orderId}`])
      }
    },
    
    inventoryUpdated: {
      subscribe: (_: unknown, args: { productId: string }) => {
        return pubsub.asyncIterator([`INVENTORY_${args.productId}`])
      }
    },
    
    priceChanged: {
      subscribe: (_: unknown, args: { productId: string }) => {
        return pubsub.asyncIterator([`PRICE_${args.productId}`])
      }
    }
  },
  
  // Type resolvers
  Product: {
    inventory: async (product: unknown) => {
      return await inventoryService.getInventory(product.id)
    }
  },
  
  Category: {
    parent: async (category: unknown) => {
      if (!category.parentId) return null
      return await categoryService.getCategory(category.parentId)
    },
    
    children: async (category: unknown) => {
      return await categoryService.getChildCategories(category.id)
    },
    
    products: async (category: unknown, args: unknown) => {
      return await productService.getProducts({
        ...args.filter,
        category: category.slug
      })
    }
  },
  
  Order: {
    customer: async (order: unknown) => {
      return await customerService.getCustomer(order.customerId)
    },
    
    payment: async (order: unknown) => {
      return await paymentService.getPaymentByOrderId(order.id)
    }
  },
  
  OrderItem: {
    product: async (item: unknown) => {
      return await productService.getProduct(item.productId)
    },
    
    total: (item: unknown) => {
      return item.quantity * item.price
    }
  },
  
  CartItem: {
    product: async (item: unknown) => {
      return await productService.getProduct(item.productId)
    },
    
    total: (item: unknown) => {
      return item.quantity * item.price
    }
  },
  
  Cart: {
    subtotal: (cart: unknown) => {
      return cart.items.reduce((sum: number, item: unknown) => {
        return sum + (item.quantity * item.price)
      }, 0)
    },
    
    tax: (cart: unknown) => {
      const subtotal = cart.items.reduce((sum: number, item: unknown) => {
        return sum + (item.quantity * item.price)
      }, 0)
      return subtotal * 0.1 // 10% tax
    },
    
    shipping: (cart: unknown) => {
      const subtotal = cart.items.reduce((sum: number, item: unknown) => {
        return sum + (item.quantity * item.price)
      }, 0)
      return subtotal >= 50000 ? 0 : 3000 // Free shipping over 50,000
    },
    
    total: (cart: unknown) => {
      const subtotal = cart.items.reduce((sum: number, item: unknown) => {
        return sum + (item.quantity * item.price)
      }, 0)
      const tax = subtotal * 0.1
      const shipping = subtotal >= 50000 ? 0 : 3000
      return subtotal + tax + shipping
    }
  }
}

// Placeholder services (to be implemented)
const categoryService = {
  getAllCategories: async () => [],
  getCategory: async (id: string) => null,
  getChildCategories: async (parentId: string) => []
}

const customerService = {
  getCustomer: async (id: string) => null
}

// PubSub for subscriptions
import { PubSub } from 'graphql-subscriptions'
const pubsub = new PubSub()