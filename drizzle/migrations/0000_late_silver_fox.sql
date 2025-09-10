-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."board_type" AS ENUM('COMMUNITY', 'FAQ', 'INQUIRY', 'NOTICE');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('PENDING', 'IN_PROGRESS', 'ANSWERED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('DRAFT', 'PUBLISHED', 'HIDDEN', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."post_visibility" AS ENUM('PUBLIC', 'PRIVATE', 'MEMBERS_ONLY');--> statement-breakpoint
CREATE TABLE "popup_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'info',
	"is_active" boolean DEFAULT true,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "products_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"data" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "products_cache_cache_key_key" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"parent_id" varchar(50),
	"level" integer DEFAULT 0,
	"path" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ui_sections" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(255),
	"data" text,
	"order" integer DEFAULT 0,
	"isActive" boolean DEFAULT true,
	"translations" text DEFAULT '{}',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" varchar(255) DEFAULT (gen_random_uuid()) NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlist_user_or_session" CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" varchar(255) DEFAULT (gen_random_uuid()) NOT NULL,
	"wishlist_id" varchar(255),
	"product_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "language_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"selected_languages" jsonb DEFAULT '["ko"]'::jsonb NOT NULL,
	"default_language" varchar(10) DEFAULT 'ko' NOT NULL,
	"max_languages" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial NOT NULL,
	"order_id" integer,
	"product_id" varchar(255),
	"product_name" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar(25) DEFAULT ('comment_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"post_id" varchar(25) NOT NULL,
	"user_id" varchar(25),
	"parent_id" varchar(25),
	"content" text NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"author_name" varchar(100),
	"author_email" varchar(255),
	"is_admin_reply" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ui_menus" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) DEFAULT 'header' NOT NULL,
	"sectionId" varchar(100) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"visible" boolean DEFAULT true,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" varchar(25) DEFAULT ('board_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" "board_type" NOT NULL,
	"visibility" "post_visibility" DEFAULT 'PUBLIC',
	"allow_comments" boolean DEFAULT true,
	"allow_attachments" boolean DEFAULT true,
	"require_login" boolean DEFAULT false,
	"allow_anonymous" boolean DEFAULT false,
	"max_attachment_size" integer DEFAULT 10485760,
	"allowed_file_types" text[] DEFAULT '{"RAY['jpg'::text","'jpeg'::text","'png'::text","'gif'::text","'pdf'::text","'doc'::text","'docx'::tex"}',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" varchar(25) DEFAULT ('post_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"board_id" varchar(25) NOT NULL,
	"user_id" varchar(25),
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"status" "post_status" DEFAULT 'PUBLISHED',
	"visibility" "post_visibility" DEFAULT 'PUBLIC',
	"is_pinned" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_anonymous" boolean DEFAULT false,
	"author_name" varchar(100),
	"author_email" varchar(255),
	"author_phone" varchar(20),
	"inquiry_status" "inquiry_status",
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"attachment_count" integer DEFAULT 0,
	"tags" text[],
	"metadata" jsonb,
	"published_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100),
	"type" varchar(20) DEFAULT 'customer',
	"role" varchar(20) DEFAULT 'user',
	"status" varchar(20) DEFAULT 'ACTIVE',
	"email_verified" boolean DEFAULT false,
	"phone" varchar(20),
	"address" text,
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" varchar(25) DEFAULT ('like_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"post_id" varchar(25) NOT NULL,
	"user_id" varchar(25) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_attachments" (
	"id" varchar(25) DEFAULT ('attach_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"post_id" varchar(25) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"mime_type" varchar(100),
	"download_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" varchar(25) DEFAULT ('clike_'::text || encode(gen_random_bytes(8), 'hex'::text)) NOT NULL,
	"comment_id" varchar(25) NOT NULL,
	"user_id" varchar(25) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_cache" (
	"id" serial NOT NULL,
	"source_text" text NOT NULL,
	"source_language" varchar(10) NOT NULL,
	"target_language" varchar(10) NOT NULL,
	"translated_text" text NOT NULL,
	"provider" varchar(50) DEFAULT 'google',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "ui_config" (
	"id" serial NOT NULL,
	"config_key" varchar(100) NOT NULL,
	"config_value" jsonb NOT NULL,
	"config_type" varchar(50),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "language_pack_keys" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"component_type" varchar(50) NOT NULL,
	"component_id" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "language_pack_translations" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key_id" uuid NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"translation" text NOT NULL,
	"is_auto_translated" boolean DEFAULT false,
	"translator_notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "public_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "public_settings_key_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"user_id" varchar(255),
	"customer_name" varchar(100) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(20),
	"shipping_address" text NOT NULL,
	"total_amount" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"payment_status" varchar(20) DEFAULT 'pending',
	"payment_method" varchar(50),
	"tracking_number" varchar(100),
	"delivery_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "orders_status_check" CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])),
	CONSTRAINT "orders_payment_status_check" CHECK ((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" varchar(50) NOT NULL,
	"product_id" varchar(50),
	"url" text NOT NULL,
	"webp_url" text,
	"file_name" varchar(255),
	"file_size" integer,
	"image_type" varchar(50) DEFAULT 'thumbnail',
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "language_metadata" (
	"id" serial NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100),
	"google_code" varchar(10) NOT NULL,
	"direction" varchar(5) DEFAULT 'ltr',
	"flag_emoji" varchar(10),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "language_metadata_direction_check" CHECK ((direction)::text = ANY ((ARRAY['ltr'::character varying, 'rtl'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"condition" varchar(20) DEFAULT 'GOOD',
	"category_id" varchar(50),
	"stock" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"new" boolean DEFAULT true,
	"status" varchar(20) DEFAULT 'ACTIVE',
	"discount_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"usage_period" text,
	"purchase_date" text,
	"detailed_description" text,
	"seller_name" text,
	"seller_location" text,
	"verified_seller" boolean DEFAULT false,
	"defects" text,
	"delivery_method" text
);
--> statement-breakpoint
CREATE TABLE "language_packs" (
	"key" varchar(255) NOT NULL,
	"ko" text DEFAULT '',
	"en" text DEFAULT '',
	"ja" text DEFAULT '',
	"zh" text DEFAULT '',
	"vi" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" varchar(255) DEFAULT (gen_random_uuid()) NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cart_user_or_session" CHECK ((user_id IS NOT NULL) OR (session_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar(255) DEFAULT (gen_random_uuid()) NOT NULL,
	"cart_id" varchar(255),
	"product_id" varchar(255),
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"category" varchar(50) DEFAULT 'general',
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "site_config_key_key" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language_pack_translations" ADD CONSTRAINT "language_pack_translations_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "public"."language_pack_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_created_at" ON "comments" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_parent_id" ON "comments" USING btree ("parent_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_post_id" ON "comments" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_user_id" ON "comments" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ui_menus_order" ON "ui_menus" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_ui_menus_type" ON "ui_menus" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_boards_active" ON "boards" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_boards_code" ON "boards" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_boards_type" ON "boards" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_board_id" ON "posts" USING btree ("board_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_board_status" ON "posts" USING btree ("board_id" text_ops,"status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_inquiry_status" ON "posts" USING btree ("inquiry_status" enum_ops) WHERE (inquiry_status IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_posts_is_pinned" ON "posts" USING btree ("is_pinned" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_published_at" ON "posts" USING btree ("published_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_status" ON "posts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_posts_user_id" ON "posts" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_post_likes_post_id" ON "post_likes" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_attachments_post_id" ON "post_attachments" USING btree ("post_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_comment_likes_comment_id" ON "comment_likes" USING btree ("comment_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pack_keys_active" ON "language_pack_keys" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_pack_keys_component" ON "language_pack_keys" USING btree ("component_type" text_ops,"component_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pack_translations_language" ON "language_pack_translations" USING btree ("language_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pack_translations_lookup" ON "language_pack_translations" USING btree ("key_id" text_ops,"language_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_created_at" ON "orders" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_payment_status" ON "orders" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_product_images_product" ON "product_images" USING btree ("product_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_products_featured" ON "products" USING btree ("featured" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_products_status" ON "products" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_site_config_key" ON "site_config" USING btree ("key" text_ops);
*/