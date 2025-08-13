-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateEnum
CREATE TYPE "public"."RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CARD', 'VIRTUAL_ACCOUNT', 'TRANSFER', 'MOBILE', 'CULTURE_GIFT', 'BOOK_GIFT', 'GAME_GIFT', 'TOSS_PAY', 'SAMSUNG_PAY', 'EASY_PAY');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PARTIAL_REFUND', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'REVIEW_REQUEST', 'COUPON_EXPIRE', 'POINT_EXPIRE', 'PRICE_DROP', 'BACK_IN_STOCK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."PointType" AS ENUM ('EARNED', 'USED', 'EXPIRED', 'CANCELLED', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."CouponType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."BusinessMode" AS ENUM ('B2C', 'B2B', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."BusinessTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'VIP');

-- CreateEnum
CREATE TYPE "public"."BusinessStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TaxInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'MODIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."InvoiceType" AS ENUM ('TAX_INVOICE', 'RECEIPT', 'CASH_RECEIPT', 'SIMPLIFIED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'ISSUED', 'SENT', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."PriceRuleType" AS ENUM ('PERCENTAGE_DISCOUNT', 'FIXED_DISCOUNT', 'FIXED_PRICE', 'TIERED_PRICING');

-- CreateEnum
CREATE TYPE "public"."BulkOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('WAREHOUSE', 'STORE', 'DROPSHIP', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "public"."TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SegmentType" AS ENUM ('RFM', 'DEMOGRAPHIC', 'BEHAVIORAL', 'GEOGRAPHIC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DisplayTemplateType" AS ENUM ('GRID', 'LIST', 'CAROUSEL', 'BANNER_GRID', 'MAGAZINE', 'CARD', 'TIMELINE', 'MASONRY', 'SPOTLIGHT', 'HERO_PRODUCTS');

-- CreateEnum
CREATE TYPE "public"."DisplayPosition" AS ENUM ('HOME_MAIN', 'HOME_SUB', 'CATEGORY_TOP', 'CATEGORY_MID', 'SEARCH_RESULT', 'RECOMMENDATION', 'EVENT', 'BRAND_SHOP');

-- CreateEnum
CREATE TYPE "public"."DisplayEventType" AS ENUM ('IMPRESSION', 'CLICK', 'CONVERSION', 'WISHLIST', 'CART_ADD');

-- CreateEnum
CREATE TYPE "public"."ABTestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AnalyticsType" AS ENUM ('SALES_SUMMARY', 'PRODUCT_PERFORMANCE', 'CUSTOMER_BEHAVIOR', 'CONVERSION_FUNNEL', 'REVENUE_FORECAST', 'INVENTORY_TURNOVER', 'MARKETING_ROI');

-- CreateEnum
CREATE TYPE "public"."CreditType" AS ENUM ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."BankAccountType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- CreateEnum
CREATE TYPE "public"."BankTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "public"."PaymentMatchingStatus" AS ENUM ('UNMATCHED', 'AUTO_MATCHED', 'MANUAL_MATCHED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "type" "public"."UserType" NOT NULL DEFAULT 'USER',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "provider" TEXT,
    "providerId" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ui_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB,
    "props" JSONB,
    "style" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ui_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ui_texts" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ko',
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ui_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."language_packs" (
    "id" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "language_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."translation_settings" (
    "id" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'ko',
    "fallbackLanguage" TEXT NOT NULL DEFAULT 'en',
    "enabledLanguages" TEXT[] DEFAULT ARRAY['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de', 'it', 'ru']::TEXT[],
    "autoTranslate" BOOLEAN NOT NULL DEFAULT false,
    "translationService" TEXT,
    "apiKey" TEXT,
    "cacheEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cacheTTL" INTEGER NOT NULL DEFAULT 3600,
    "showMissingKeys" BOOLEAN NOT NULL DEFAULT false,
    "missingKeyPrefix" TEXT NOT NULL DEFAULT '[MISSING]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."menu_items" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "parentId" TEXT,
    "label" JSONB NOT NULL,
    "href" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "target" TEXT,
    "requiredRole" "public"."UserType"[] DEFAULT ARRAY[]::"public"."UserType"[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "compareAt" INTEGER,
    "cost" INTEGER,
    "sku" TEXT,
    "barcode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "trackStock" BOOLEAN NOT NULL DEFAULT true,
    "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "categoryId" TEXT,
    "tags" TEXT[],
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[],

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "shipping" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "variant" JSONB,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "paymentKey" TEXT,
    "transactionId" TEXT,
    "approvalUrl" TEXT,
    "responseData" JSONB,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "failReason" TEXT,
    "cancelReason" TEXT,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."RefundStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "variant" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WishlistItem" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "images" TEXT[],
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "detail" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "alimtalkSent" BOOLEAN NOT NULL DEFAULT false,
    "alimtalkSentAt" TIMESTAMP(3),
    "alimtalkMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Point" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "type" "public"."PointType" NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minAmount" INTEGER,
    "maxDiscount" INTEGER,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCoupon" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_mode_config" (
    "id" TEXT NOT NULL,
    "businessMode" "public"."BusinessMode" NOT NULL DEFAULT 'B2C',
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_mode_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "representative" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "businessCategory" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "taxInvoiceEmail" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "creditLimit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currentCredit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentTerms" INTEGER NOT NULL DEFAULT 30,
    "discountRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tier" "public"."BusinessTier" NOT NULL DEFAULT 'BRONZE',
    "status" "public"."BusinessStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tax_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "orderId" TEXT,
    "supplierBusinessNo" TEXT NOT NULL,
    "supplierCompanyName" TEXT NOT NULL,
    "supplierCeoName" TEXT NOT NULL,
    "supplierAddress" TEXT NOT NULL,
    "supplierBusinessType" TEXT,
    "supplierBusinessCategory" TEXT,
    "buyerBusinessNo" TEXT NOT NULL,
    "buyerCompanyName" TEXT NOT NULL,
    "buyerCeoName" TEXT NOT NULL,
    "buyerAddress" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "buyerBusinessType" TEXT,
    "buyerBusinessCategory" TEXT,
    "supplyAmount" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "status" "public"."TaxInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL,
    "ntsSendDate" TIMESTAMP(3),
    "ntsResultCode" TEXT,
    "ntsResultMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessAccountId" TEXT,

    CONSTRAINT "tax_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tax_invoice_items" (
    "id" TEXT NOT NULL,
    "taxInvoiceId" TEXT NOT NULL,
    "itemDate" TIMESTAMP(3) NOT NULL,
    "itemName" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "supplyAmount" DECIMAL(65,30) NOT NULL,
    "taxAmount" DECIMAL(65,30) NOT NULL,
    "remark" TEXT,

    CONSTRAINT "tax_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_group_members" (
    "id" TEXT NOT NULL,
    "priceGroupId" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_rules" (
    "id" TEXT NOT NULL,
    "priceGroupId" TEXT NOT NULL,
    "productId" TEXT,
    "categoryId" TEXT,
    "type" "public"."PriceRuleType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bulk_orders" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "status" "public"."BulkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "estimatedAmount" DECIMAL(65,30),
    "finalAmount" DECIMAL(65,30),
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "confirmedDate" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bulk_order_items" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requestedPrice" DECIMAL(65,30),
    "approvedPrice" DECIMAL(65,30),
    "notes" TEXT,

    CONSTRAINT "bulk_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."LocationType" NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_transfers" (
    "id" TEXT NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "public"."TransferStatus" NOT NULL DEFAULT 'PENDING',
    "initiatedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_snapshots" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT,
    "quantity" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "inventory_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_reservations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "cartId" TEXT,
    "quantity" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL,
    "type" "public"."SegmentType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_segment_members" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DECIMAL(65,30),
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "customer_segment_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marketing_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "status" "public"."CampaignStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."display_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DisplayTemplateType" NOT NULL,
    "position" "public"."DisplayPosition" NOT NULL,
    "config" JSONB NOT NULL,
    "schedule" JSONB,
    "targeting" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."display_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."display_events" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" "public"."DisplayEventType" NOT NULL,
    "productId" TEXT,
    "userId" TEXT,
    "orderId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "display_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."display_ab_tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" "public"."DisplayPosition" NOT NULL,
    "status" "public"."ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "winnerVariantId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."display_ab_test_variants" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "display_ab_test_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ab_test_assignments" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" TEXT NOT NULL,
    "type" "public"."AnalyticsType" NOT NULL,
    "period" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credit_histories" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "type" "public"."CreditType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bank_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessAccountId" TEXT,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountType" "public"."BankAccountType" NOT NULL DEFAULT 'CORPORATE',
    "fintechUseNum" TEXT NOT NULL,
    "inquiryAgreeYn" BOOLEAN NOT NULL DEFAULT false,
    "inquiryAgreeDtime" TIMESTAMP(3),
    "transferAgreeYn" BOOLEAN NOT NULL DEFAULT false,
    "transferAgreeDtime" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(65,30),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bank_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "transactionTime" TEXT NOT NULL,
    "transactionType" "public"."BankTransactionType" NOT NULL,
    "transactionAmount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "counterpartyName" TEXT,
    "counterpartyAccount" TEXT,
    "counterpartyBankCode" TEXT,
    "transactionMemo" TEXT,
    "bankTransactionId" TEXT NOT NULL,
    "apiTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."corporate_payments" (
    "id" TEXT NOT NULL,
    "businessAccountId" TEXT,
    "bankCode" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "transactionType" "public"."BankTransactionType" NOT NULL DEFAULT 'DEPOSIT',
    "depositorName" TEXT NOT NULL,
    "depositorAccount" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "matchedOrderId" TEXT,
    "matchingStatus" "public"."PaymentMatchingStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchingScore" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "transactionMemo" TEXT,
    "bankTransactionId" TEXT NOT NULL,
    "rawData" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_matching_logs" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "matchingType" TEXT NOT NULL,
    "matchingScore" DECIMAL(65,30) NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_matching_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_DisplaySectionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DisplaySectionToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_provider_providerId_idx" ON "public"."User"("provider", "providerId");

-- CreateIndex
CREATE INDEX "User_type_status_idx" ON "public"."User"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "public"."user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ui_sections_key_key" ON "public"."ui_sections"("key");

-- CreateIndex
CREATE INDEX "ui_sections_key_idx" ON "public"."ui_sections"("key");

-- CreateIndex
CREATE INDEX "ui_sections_isActive_idx" ON "public"."ui_sections"("isActive");

-- CreateIndex
CREATE INDEX "ui_texts_language_idx" ON "public"."ui_texts"("language");

-- CreateIndex
CREATE UNIQUE INDEX "ui_texts_sectionId_key_language_key" ON "public"."ui_texts"("sectionId", "key", "language");

-- CreateIndex
CREATE INDEX "language_packs_languageCode_namespace_idx" ON "public"."language_packs"("languageCode", "namespace");

-- CreateIndex
CREATE INDEX "language_packs_languageCode_isActive_idx" ON "public"."language_packs"("languageCode", "isActive");

-- CreateIndex
CREATE INDEX "language_packs_category_idx" ON "public"."language_packs"("category");

-- CreateIndex
CREATE UNIQUE INDEX "language_packs_languageCode_namespace_key_key" ON "public"."language_packs"("languageCode", "namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_key_key" ON "public"."menu_items"("key");

-- CreateIndex
CREATE INDEX "menu_items_isActive_order_idx" ON "public"."menu_items"("isActive", "order");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "public"."Product"("slug");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "public"."Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "public"."Product"("status");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "public"."ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "public"."ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "public"."ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "public"."ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "public"."Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "public"."Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "public"."Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "public"."OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentKey_key" ON "public"."Payment"("paymentKey");

-- CreateIndex
CREATE INDEX "Payment_paymentKey_idx" ON "public"."Payment"("paymentKey");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_provider_idx" ON "public"."Payment"("provider");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "public"."Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "public"."Refund"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookLog_webhookId_key" ON "public"."WebhookLog"("webhookId");

-- CreateIndex
CREATE INDEX "WebhookLog_provider_idx" ON "public"."WebhookLog"("provider");

-- CreateIndex
CREATE INDEX "WebhookLog_processedAt_idx" ON "public"."WebhookLog"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "public"."Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "public"."Cart"("sessionId");

-- CreateIndex
CREATE INDEX "Cart_sessionId_idx" ON "public"."Cart"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "public"."CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "public"."CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "public"."CartItem"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "public"."Wishlist"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_wishlistId_idx" ON "public"."WishlistItem"("wishlistId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "public"."WishlistItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_key" ON "public"."WishlistItem"("wishlistId", "productId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "public"."Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "public"."Review"("userId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "public"."Review"("rating");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "public"."Address"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Point_userId_idx" ON "public"."Point"("userId");

-- CreateIndex
CREATE INDEX "Point_type_idx" ON "public"."Point"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "UserCoupon_userId_idx" ON "public"."UserCoupon"("userId");

-- CreateIndex
CREATE INDEX "UserCoupon_couponId_idx" ON "public"."UserCoupon"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCoupon_userId_couponId_key" ON "public"."UserCoupon"("userId", "couponId");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "public"."system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "public"."system_configs"("category");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "public"."system_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "site_config_key_key" ON "public"."site_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "business_accounts_userId_key" ON "public"."business_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "business_accounts_businessNumber_key" ON "public"."business_accounts"("businessNumber");

-- CreateIndex
CREATE INDEX "business_accounts_businessNumber_idx" ON "public"."business_accounts"("businessNumber");

-- CreateIndex
CREATE INDEX "business_accounts_status_idx" ON "public"."business_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_invoiceNumber_key" ON "public"."tax_invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_orderId_key" ON "public"."tax_invoices"("orderId");

-- CreateIndex
CREATE INDEX "tax_invoices_invoiceNumber_idx" ON "public"."tax_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "tax_invoices_status_idx" ON "public"."tax_invoices"("status");

-- CreateIndex
CREATE INDEX "tax_invoices_supplierBusinessNo_idx" ON "public"."tax_invoices"("supplierBusinessNo");

-- CreateIndex
CREATE INDEX "tax_invoices_buyerBusinessNo_idx" ON "public"."tax_invoices"("buyerBusinessNo");

-- CreateIndex
CREATE INDEX "tax_invoice_items_taxInvoiceId_idx" ON "public"."tax_invoice_items"("taxInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "price_groups_name_key" ON "public"."price_groups"("name");

-- CreateIndex
CREATE INDEX "price_groups_priority_idx" ON "public"."price_groups"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "price_group_members_priceGroupId_businessAccountId_key" ON "public"."price_group_members"("priceGroupId", "businessAccountId");

-- CreateIndex
CREATE INDEX "price_rules_priceGroupId_idx" ON "public"."price_rules"("priceGroupId");

-- CreateIndex
CREATE INDEX "price_rules_productId_idx" ON "public"."price_rules"("productId");

-- CreateIndex
CREATE INDEX "price_rules_categoryId_idx" ON "public"."price_rules"("categoryId");

-- CreateIndex
CREATE INDEX "bulk_orders_status_idx" ON "public"."bulk_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_locations_code_key" ON "public"."inventory_locations"("code");

-- CreateIndex
CREATE INDEX "inventory_snapshots_productId_timestamp_idx" ON "public"."inventory_snapshots"("productId", "timestamp");

-- CreateIndex
CREATE INDEX "inventory_reservations_expiresAt_idx" ON "public"."inventory_reservations"("expiresAt");

-- CreateIndex
CREATE INDEX "inventory_reservations_status_idx" ON "public"."inventory_reservations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_segments_name_key" ON "public"."customer_segments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_segment_members_segmentId_userId_key" ON "public"."customer_segment_members"("segmentId", "userId");

-- CreateIndex
CREATE INDEX "display_templates_position_isActive_idx" ON "public"."display_templates"("position", "isActive");

-- CreateIndex
CREATE INDEX "display_templates_priority_idx" ON "public"."display_templates"("priority");

-- CreateIndex
CREATE INDEX "display_sections_templateId_idx" ON "public"."display_sections"("templateId");

-- CreateIndex
CREATE INDEX "display_sections_priority_idx" ON "public"."display_sections"("priority");

-- CreateIndex
CREATE INDEX "display_events_templateId_type_idx" ON "public"."display_events"("templateId", "type");

-- CreateIndex
CREATE INDEX "display_events_createdAt_idx" ON "public"."display_events"("createdAt");

-- CreateIndex
CREATE INDEX "display_events_userId_idx" ON "public"."display_events"("userId");

-- CreateIndex
CREATE INDEX "display_ab_tests_position_status_idx" ON "public"."display_ab_tests"("position", "status");

-- CreateIndex
CREATE INDEX "display_ab_tests_startDate_endDate_idx" ON "public"."display_ab_tests"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "display_ab_test_variants_testId_name_key" ON "public"."display_ab_test_variants"("testId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testId_userId_key" ON "public"."ab_test_assignments"("testId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_assignments_testId_sessionId_key" ON "public"."ab_test_assignments"("testId", "sessionId");

-- CreateIndex
CREATE INDEX "analytics_type_period_idx" ON "public"."analytics"("type", "period");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_type_period_key" ON "public"."analytics"("type", "period");

-- CreateIndex
CREATE INDEX "credit_histories_businessAccountId_idx" ON "public"."credit_histories"("businessAccountId");

-- CreateIndex
CREATE INDEX "inventory_productId_idx" ON "public"."inventory"("productId");

-- CreateIndex
CREATE INDEX "inventory_locationId_idx" ON "public"."inventory"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_locationId_key" ON "public"."inventory"("productId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_fintechUseNum_key" ON "public"."bank_accounts"("fintechUseNum");

-- CreateIndex
CREATE INDEX "bank_accounts_userId_idx" ON "public"."bank_accounts"("userId");

-- CreateIndex
CREATE INDEX "bank_accounts_businessAccountId_idx" ON "public"."bank_accounts"("businessAccountId");

-- CreateIndex
CREATE INDEX "bank_accounts_bankCode_idx" ON "public"."bank_accounts"("bankCode");

-- CreateIndex
CREATE INDEX "bank_accounts_fintechUseNum_idx" ON "public"."bank_accounts"("fintechUseNum");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_bankCode_accountNumber_key" ON "public"."bank_accounts"("bankCode", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bank_transactions_bankTransactionId_key" ON "public"."bank_transactions"("bankTransactionId");

-- CreateIndex
CREATE INDEX "bank_transactions_accountId_idx" ON "public"."bank_transactions"("accountId");

-- CreateIndex
CREATE INDEX "bank_transactions_bankTransactionId_idx" ON "public"."bank_transactions"("bankTransactionId");

-- CreateIndex
CREATE INDEX "bank_transactions_transactionDate_idx" ON "public"."bank_transactions"("transactionDate");

-- CreateIndex
CREATE INDEX "bank_transactions_transactionType_idx" ON "public"."bank_transactions"("transactionType");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_payments_bankTransactionId_key" ON "public"."corporate_payments"("bankTransactionId");

-- CreateIndex
CREATE INDEX "corporate_payments_bankTransactionId_idx" ON "public"."corporate_payments"("bankTransactionId");

-- CreateIndex
CREATE INDEX "corporate_payments_matchingStatus_idx" ON "public"."corporate_payments"("matchingStatus");

-- CreateIndex
CREATE INDEX "corporate_payments_transactionDate_idx" ON "public"."corporate_payments"("transactionDate");

-- CreateIndex
CREATE INDEX "corporate_payments_businessAccountId_idx" ON "public"."corporate_payments"("businessAccountId");

-- CreateIndex
CREATE INDEX "corporate_payments_matchedOrderId_idx" ON "public"."corporate_payments"("matchedOrderId");

-- CreateIndex
CREATE INDEX "payment_matching_logs_paymentId_idx" ON "public"."payment_matching_logs"("paymentId");

-- CreateIndex
CREATE INDEX "payment_matching_logs_orderId_idx" ON "public"."payment_matching_logs"("orderId");

-- CreateIndex
CREATE INDEX "payment_matching_logs_createdAt_idx" ON "public"."payment_matching_logs"("createdAt");

-- CreateIndex
CREATE INDEX "_DisplaySectionToProduct_B_index" ON "public"."_DisplaySectionToProduct"("B");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ui_texts" ADD CONSTRAINT "ui_texts_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."ui_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "public"."Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCoupon" ADD CONSTRAINT "UserCoupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCoupon" ADD CONSTRAINT "UserCoupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_accounts" ADD CONSTRAINT "business_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_invoices" ADD CONSTRAINT "tax_invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_invoices" ADD CONSTRAINT "tax_invoices_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tax_invoice_items" ADD CONSTRAINT "tax_invoice_items_taxInvoiceId_fkey" FOREIGN KEY ("taxInvoiceId") REFERENCES "public"."tax_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_group_members" ADD CONSTRAINT "price_group_members_priceGroupId_fkey" FOREIGN KEY ("priceGroupId") REFERENCES "public"."price_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_group_members" ADD CONSTRAINT "price_group_members_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_rules" ADD CONSTRAINT "price_rules_priceGroupId_fkey" FOREIGN KEY ("priceGroupId") REFERENCES "public"."price_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_rules" ADD CONSTRAINT "price_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_rules" ADD CONSTRAINT "price_rules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_orders" ADD CONSTRAINT "bulk_orders_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_order_items" ADD CONSTRAINT "bulk_order_items_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "public"."bulk_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_order_items" ADD CONSTRAINT "bulk_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transfers" ADD CONSTRAINT "inventory_transfers_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transfers" ADD CONSTRAINT "inventory_transfers_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transfers" ADD CONSTRAINT "inventory_transfers_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_reservations" ADD CONSTRAINT "inventory_reservations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_reservations" ADD CONSTRAINT "inventory_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_reservations" ADD CONSTRAINT "inventory_reservations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_reservations" ADD CONSTRAINT "inventory_reservations_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_segment_members" ADD CONSTRAINT "customer_segment_members_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "public"."customer_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_segment_members" ADD CONSTRAINT "customer_segment_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "public"."customer_segments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_sections" ADD CONSTRAINT "display_sections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."display_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_events" ADD CONSTRAINT "display_events_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."display_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_events" ADD CONSTRAINT "display_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_events" ADD CONSTRAINT "display_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_events" ADD CONSTRAINT "display_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_ab_test_variants" ADD CONSTRAINT "display_ab_test_variants_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."display_ab_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."display_ab_test_variants" ADD CONSTRAINT "display_ab_test_variants_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."display_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."display_ab_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."display_ab_test_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ab_test_assignments" ADD CONSTRAINT "ab_test_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_histories" ADD CONSTRAINT "credit_histories_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credit_histories" ADD CONSTRAINT "credit_histories_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory" ADD CONSTRAINT "inventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_transactions" ADD CONSTRAINT "bank_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corporate_payments" ADD CONSTRAINT "corporate_payments_businessAccountId_fkey" FOREIGN KEY ("businessAccountId") REFERENCES "public"."business_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corporate_payments" ADD CONSTRAINT "corporate_payments_matchedOrderId_fkey" FOREIGN KEY ("matchedOrderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corporate_payments" ADD CONSTRAINT "corporate_payments_bankCode_accountNumber_fkey" FOREIGN KEY ("bankCode", "accountNumber") REFERENCES "public"."bank_accounts"("bankCode", "accountNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_matching_logs" ADD CONSTRAINT "payment_matching_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."corporate_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DisplaySectionToProduct" ADD CONSTRAINT "_DisplaySectionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."display_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DisplaySectionToProduct" ADD CONSTRAINT "_DisplaySectionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
