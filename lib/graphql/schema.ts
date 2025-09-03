import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar Date
  scalar JSON

  # Product Types
  type Product {
    id: ID!
    sku: String!
    name: String!
    slug: String!
    description: String
    price: Float!
    originalPrice: Float
    cost: Float
    stock: Int!
    images: [ProductImage!]!
    categories: [Category!]!
    metadata: JSON
    status: ProductStatus!
    featured: Boolean!
    new: Boolean!
    rating: Float
    reviewCount: Int
    inventory: Inventory
    createdAt: Date!
    updatedAt: Date!
  }

  type ProductImage {
    id: ID!
    url: String!
    alt: String
    orderIndex: Int!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    parentId: ID
    parent: Category
    children: [Category!]
    products(filter: ProductFilter): ProductConnection!
  }

  type Inventory {
    productId: ID!
    quantity: Int!
    reserved: Int!
    available: Int!
    warehouse: String
    lastRestocked: Date
  }

  enum ProductStatus {
    ACTIVE
    INACTIVE
    DRAFT
  }

  # Order Types
  type Order {
    id: ID!
    customerId: ID!
    customer: Customer
    items: [OrderItem!]!
    totalAmount: Float!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    discount: Float
    status: OrderStatus!
    payment: Payment
    shippingInfo: ShippingInfo!
    notes: String
    createdAt: Date!
    updatedAt: Date!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  type Customer {
    id: ID!
    email: String!
    name: String!
    phone: String
    orders: [Order!]!
  }

  type ShippingInfo {
    address: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
    trackingNumber: String
    carrier: String
    estimatedDelivery: Date
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    PAID
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  # Payment Types
  type Payment {
    id: ID!
    orderId: ID!
    amount: Float!
    currency: String!
    method: PaymentMethod!
    status: PaymentStatus!
    transactionId: String
    gateway: String!
    metadata: JSON
    createdAt: Date!
  }

  enum PaymentMethod {
    CARD
    TRANSFER
    VIRTUAL_ACCOUNT
    KAKAO_PAY
    TOSS_PAY
    NAVER_PAY
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    REFUNDED
    CANCELLED
  }

  # Cart Types
  type Cart {
    id: ID!
    userId: ID
    items: [CartItem!]!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    total: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  # Input Types
  input ProductFilter {
    category: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    featured: Boolean
    search: String
    sortBy: ProductSortBy
  }

  enum ProductSortBy {
    PRICE_ASC
    PRICE_DESC
    NAME
    CREATED
    RATING
  }

  input OrderInput {
    customerId: ID!
    items: [OrderItemInput!]!
    shippingInfo: ShippingInfoInput!
    paymentMethod: PaymentMethod!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input ShippingInfoInput {
    address: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  # Pagination Types
  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Query Types
  type Query {
    # Products
    products(filter: ProductFilter, first: Int, after: String): ProductConnection!
    product(id: ID, slug: String): Product
    searchProducts(query: String!, limit: Int): [Product!]!
    relatedProducts(productId: ID!, limit: Int): [Product!]!
    
    # Categories
    categories: [Category!]!
    category(id: ID, slug: String): Category
    
    # Orders
    orders(customerId: ID, status: OrderStatus, first: Int, after: String): [Order!]!
    order(id: ID!): Order
    
    # Cart
    cart(userId: ID): Cart
    
    # Inventory
    inventory(productId: ID!): Inventory
    checkStock(productId: ID!, quantity: Int!): Boolean!
  }

  # Mutation Types
  type Mutation {
    # Cart
    addToCart(input: CartItemInput!): Cart!
    updateCartItem(cartItemId: ID!, quantity: Int!): Cart!
    removeFromCart(cartItemId: ID!): Cart!
    clearCart(userId: ID): Boolean!
    
    # Orders
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!
    cancelOrder(orderId: ID!): Order!
    
    # Payments
    processPayment(orderId: ID!, paymentMethod: PaymentMethod!): Payment!
    refundPayment(paymentId: ID!, amount: Float): Payment!
    
    # Inventory
    updateStock(productId: ID!, quantity: Int!, operation: StockOperation!): Inventory!
    reserveStock(productId: ID!, quantity: Int!): Boolean!
    releaseStock(productId: ID!, quantity: Int!): Boolean!
  }

  enum StockOperation {
    INCREMENT
    DECREMENT
    SET
  }

  # Subscription Types
  type Subscription {
    orderStatusChanged(orderId: ID!): Order!
    inventoryUpdated(productId: ID!): Inventory!
    priceChanged(productId: ID!): Product!
  }
`