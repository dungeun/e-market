import { productService } from '../services/product-service'
import { orderService } from '../services/order-service'
import { paymentService } from '../services/payment-service'
import { inventoryService } from '../services/inventory-service'
import { cartService } from '../services/cart-service'
// import { categoryService } from '../services/category-service' // TODO: implement category service

export const resolvers = {
  Query: {
    // Product queries
    products: async (_: any, args: any) => {
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
    
    product: async (_: any, args: { id?: string; slug?: string }) => {
      const identifier = args.id || args.slug
      if (!identifier) return null
      
      return await productService.getProduct(identifier)
    },
    
    searchProducts: async (_: any, args: { query: string; limit?: number }) => {
      return await productService.searchProducts(args.query, args.limit || 10)
    },
    
    relatedProducts: async (_: any, args: { productId: string; limit?: number }) => {
      return await productService.getRelatedProducts(args.productId, args.limit || 4)
    },
    
    // Category queries
    categories: async () => {
      // TODO: implement category service
      return []
    },
    
    category: async (_: any, args: { id?: string; slug?: string }) => {
      // TODO: implement category service
      return null
    },
    
    // Order queries
    orders: async (_: any, args: any, context: any) => {
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
    
    order: async (_: any, args: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.getOrder(args.id, context.user.id)
    },
    
    // Cart queries
    cart: async (_: any, args: { userId?: string }, context: any) => {
      const userId = args.userId || context.user?.id || context.sessionId
      return await cartService.getCart(userId)
    },
    
    // Inventory queries
    inventory: async (_: any, args: { productId: string }) => {
      return await inventoryService.getInventory(args.productId)
    },
    
    checkStock: async (_: any, args: { productId: string; quantity: number }) => {
      return await inventoryService.checkStock(args.productId, args.quantity)
    }
  },
  
  Mutation: {
    // Cart mutations
    addToCart: async (_: any, args: { input: any }, context: any) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.addToCart(userId, args.input.productId, args.input.quantity)
    },
    
    updateCartItem: async (_: any, args: { cartItemId: string; quantity: number }, context: any) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.updateCartItem(userId, args.cartItemId, args.quantity)
    },
    
    removeFromCart: async (_: any, args: { cartItemId: string }, context: any) => {
      const userId = context.user?.id || context.sessionId
      return await cartService.removeFromCart(userId, args.cartItemId)
    },
    
    clearCart: async (_: any, args: { userId?: string }, context: any) => {
      const userId = args.userId || context.user?.id || context.sessionId
      return await cartService.clearCart(userId)
    },
    
    // Order mutations
    createOrder: async (_: any, args: { input: any }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.createOrder({
        ...args.input,
        customerId: args.input.customerId || context.user.id
      })
    },
    
    updateOrderStatus: async (_: any, args: { orderId: string; status: string }, context: any) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await orderService.updateOrderStatus(args.orderId, args.status)
    },
    
    cancelOrder: async (_: any, args: { orderId: string }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await orderService.cancelOrder(args.orderId, context.user.id)
    },
    
    // Payment mutations
    processPayment: async (_: any, args: { orderId: string; paymentMethod: string }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required')
      }
      
      return await paymentService.processPayment(args.orderId, args.paymentMethod, context.user.id)
    },
    
    refundPayment: async (_: any, args: { paymentId: string; amount?: number }, context: any) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await paymentService.refundPayment(args.paymentId, args.amount)
    },
    
    // Inventory mutations
    updateStock: async (_: any, args: any, context: any) => {
      if (!context.user || !context.user.isAdmin) {
        throw new Error('Admin access required')
      }
      
      return await inventoryService.updateStock(
        args.productId,
        args.quantity,
        args.operation.toLowerCase()
      )
    },
    
    reserveStock: async (_: any, args: { productId: string; quantity: number }) => {
      return await inventoryService.reserveStock(args.productId, args.quantity)
    },
    
    releaseStock: async (_: any, args: { productId: string; quantity: number }) => {
      return await inventoryService.releaseStock(args.productId, args.quantity)
    }
  },
  
  Subscription: {
    orderStatusChanged: {
      subscribe: (_: any, args: { orderId: string }) => {
        return pubsub.asyncIterator([`ORDER_STATUS_${args.orderId}`])
      }
    },
    
    inventoryUpdated: {
      subscribe: (_: any, args: { productId: string }) => {
        return pubsub.asyncIterator([`INVENTORY_${args.productId}`])
      }
    },
    
    priceChanged: {
      subscribe: (_: any, args: { productId: string }) => {
        return pubsub.asyncIterator([`PRICE_${args.productId}`])
      }
    }
  },
  
  // Type resolvers
  Product: {
    inventory: async (product: any) => {
      return await inventoryService.getInventory(product.id)
    }
  },
  
  Category: {
    parent: async (category: any) => {
      if (!category.parentId) return null
      return await categoryService.getCategory(category.parentId)
    },
    
    children: async (category: any) => {
      return await categoryService.getChildCategories(category.id)
    },
    
    products: async (category: any, args: any) => {
      return await productService.getProducts({
        ...args.filter,
        category: category.slug
      })
    }
  },
  
  Order: {
    customer: async (order: any) => {
      return await customerService.getCustomer(order.customerId)
    },
    
    payment: async (order: any) => {
      return await paymentService.getPaymentByOrderId(order.id)
    }
  },
  
  OrderItem: {
    product: async (item: any) => {
      return await productService.getProduct(item.productId)
    },
    
    total: (item: any) => {
      return item.quantity * item.price
    }
  },
  
  CartItem: {
    product: async (item: any) => {
      return await productService.getProduct(item.productId)
    },
    
    total: (item: any) => {
      return item.quantity * item.price
    }
  },
  
  Cart: {
    subtotal: (cart: any) => {
      return cart.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price)
      }, 0)
    },
    
    tax: (cart: any) => {
      const subtotal = cart.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price)
      }, 0)
      return subtotal * 0.1 // 10% tax
    },
    
    shipping: (cart: any) => {
      const subtotal = cart.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price)
      }, 0)
      return subtotal >= 50000 ? 0 : 3000 // Free shipping over 50,000
    },
    
    total: (cart: any) => {
      const subtotal = cart.items.reduce((sum: number, item: any) => {
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