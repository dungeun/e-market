// Common type definitions to replace 'any' types

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'business';
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalizedText {
  ko?: string;
  en?: string;
  jp?: string;
  zh?: string;
  [key: string]: string | undefined;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DatabaseRow {
  [column: string]: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  description?: string;
  icon?: string;
  color?: string;
  imageUrl?: string;
  isActive: boolean;
  menuOrder: number;
  productCount?: number;
  children?: Category[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  category?: Category;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UISection {
  id: string;
  key: string;
  type: string;
  title?: string;
  content?: Record<string, unknown>;
  data?: Record<string, unknown>;
  translations?: LocalizedText;
  visible: boolean;
  isActive: boolean;
  order: number;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  discount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestContext {
  user?: User | AuthToken;
  isAdmin?: boolean;
  params?: Record<string, string>;
}

// Form data types
export interface FormData {
  [key: string]: string | number | boolean | File | null | undefined;
}

// Error types
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

// Config types
export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
}

// Environment configuration
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_API_URL: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  DB_HOST?: string;
  DB_PORT?: number;
  DB_NAME?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
}