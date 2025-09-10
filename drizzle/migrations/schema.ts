import { pgTable, uuid, varchar, text, boolean, timestamp, unique, jsonb, integer, check, foreignKey, serial, index, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const boardType = pgEnum("board_type", ['COMMUNITY', 'FAQ', 'INQUIRY', 'NOTICE'])
export const inquiryStatus = pgEnum("inquiry_status", ['PENDING', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'])
export const postStatus = pgEnum("post_status", ['DRAFT', 'PUBLISHED', 'HIDDEN', 'DELETED'])
export const postVisibility = pgEnum("post_visibility", ['PUBLIC', 'PRIVATE', 'MEMBERS_ONLY'])
export const reviewStatus = pgEnum("review_status", ['pending', 'approved', 'flagged', 'rejected'])


export const popupAlerts = pgTable("popup_alerts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).default('info'),
	isActive: boolean("is_active").default(true),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const productsCache = pgTable("products_cache", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cacheKey: varchar("cache_key", { length: 255 }).notNull(),
	data: jsonb(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("products_cache_cache_key_key").on(table.cacheKey),
]);

export const categories = pgTable("categories", {
	id: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	icon: varchar({ length: 50 }),
	parentId: varchar("parent_id", { length: 50 }),
	level: integer().default(0),
	path: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const uiSections = pgTable("ui_sections", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	key: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 255 }),
	data: text(),
	order: integer().default(0),
	isActive: boolean().default(true),
	translations: text().default('{}'),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export const wishlists = pgTable("wishlists", {
	id: varchar({ length: 255 }).default(sql`gen_random_uuid()`).notNull(),
	userId: varchar("user_id", { length: 255 }),
	sessionId: varchar("session_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	check("wishlist_user_or_session", sql`(user_id IS NOT NULL) OR (session_id IS NOT NULL)`),
]);

export const wishlistItems = pgTable("wishlist_items", {
	id: varchar({ length: 255 }).default(sql`gen_random_uuid()`).notNull(),
	wishlistId: varchar("wishlist_id", { length: 255 }),
	productId: varchar("product_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.wishlistId],
			foreignColumns: [wishlists.id],
			name: "wishlist_items_wishlist_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "wishlist_items_product_id_fkey"
		}).onDelete("cascade"),
]);

export const languageSettings = pgTable("language_settings", {
	id: serial().primaryKey().notNull(),
	selectedLanguages: jsonb("selected_languages").default(["ko"]).notNull(),
	defaultLanguage: varchar("default_language", { length: 10 }).default('ko').notNull(),
	maxLanguages: integer("max_languages").default(3).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = pgTable("order_items", {
	id: serial().notNull(),
	orderId: integer("order_id"),
	productId: varchar("product_id", { length: 255 }),
	productName: varchar("product_name", { length: 255 }).notNull(),
	quantity: integer().default(1).notNull(),
	price: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_order_items_order_id").using("btree", table.orderId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_fkey"
		}),
]);

export const comments = pgTable("comments", {
	id: varchar({ length: 25 }).default(sql`(\'comment_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	postId: varchar("post_id", { length: 25 }).notNull(),
	userId: varchar("user_id", { length: 25 }),
	parentId: varchar("parent_id", { length: 25 }),
	content: text().notNull(),
	isAnonymous: boolean("is_anonymous").default(false),
	authorName: varchar("author_name", { length: 100 }),
	authorEmail: varchar("author_email", { length: 255 }),
	isAdminReply: boolean("is_admin_reply").default(false),
	isDeleted: boolean("is_deleted").default(false),
	likeCount: integer("like_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_comments_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_comments_parent_id").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("idx_comments_post_id").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	index("idx_comments_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "comments_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "comments_parent_id_fkey"
		}).onDelete("cascade"),
]);

export const uiMenus = pgTable("ui_menus", {
	id: uuid().defaultRandom().notNull(),
	type: varchar({ length: 50 }).default('header').notNull(),
	sectionId: varchar({ length: 100 }).notNull(),
	content: jsonb().default({}).notNull(),
	visible: boolean().default(true),
	order: integer().default(0).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_ui_menus_order").using("btree", table.order.asc().nullsLast().op("int4_ops")),
	index("idx_ui_menus_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const boards = pgTable("boards", {
	id: varchar({ length: 25 }).default(sql`(\'board_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	type: boardType().notNull(),
	visibility: postVisibility().default('PUBLIC'),
	allowComments: boolean("allow_comments").default(true),
	allowAttachments: boolean("allow_attachments").default(true),
	requireLogin: boolean("require_login").default(false),
	allowAnonymous: boolean("allow_anonymous").default(false),
	maxAttachmentSize: integer("max_attachment_size").default(10485760),
	allowedFileTypes: text("allowed_file_types").array().default(["RAY['jpg'::text", "'jpeg'::text", "'png'::text", "'gif'::text", "'pdf'::text", "'doc'::text", "'docx'::tex"]),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_boards_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_boards_code").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("idx_boards_type").using("btree", table.type.asc().nullsLast().op("enum_ops")),
]);

export const posts = pgTable("posts", {
	id: varchar({ length: 25 }).default(sql`(\'post_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	boardId: varchar("board_id", { length: 25 }).notNull(),
	userId: varchar("user_id", { length: 25 }),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	summary: text(),
	status: postStatus().default('PUBLISHED'),
	visibility: postVisibility().default('PUBLIC'),
	isPinned: boolean("is_pinned").default(false),
	isFeatured: boolean("is_featured").default(false),
	isAnonymous: boolean("is_anonymous").default(false),
	authorName: varchar("author_name", { length: 100 }),
	authorEmail: varchar("author_email", { length: 255 }),
	authorPhone: varchar("author_phone", { length: 20 }),
	inquiryStatus: inquiryStatus("inquiry_status"),
	viewCount: integer("view_count").default(0),
	likeCount: integer("like_count").default(0),
	commentCount: integer("comment_count").default(0),
	attachmentCount: integer("attachment_count").default(0),
	tags: text().array(),
	metadata: jsonb(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_posts_board_id").using("btree", table.boardId.asc().nullsLast().op("text_ops")),
	index("idx_posts_board_status").using("btree", table.boardId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_posts_inquiry_status").using("btree", table.inquiryStatus.asc().nullsLast().op("enum_ops")).where(sql`(inquiry_status IS NOT NULL)`),
	index("idx_posts_is_pinned").using("btree", table.isPinned.asc().nullsLast().op("bool_ops")),
	index("idx_posts_published_at").using("btree", table.publishedAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_posts_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_posts_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [boards.id],
			name: "posts_board_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "posts_user_id_fkey"
		}).onDelete("set null"),
]);

export const users = pgTable("users", {
	id: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 100 }),
	type: varchar({ length: 20 }).default('customer'),
	role: varchar({ length: 20 }).default('user'),
	status: varchar({ length: 20 }).default('ACTIVE'),
	emailVerified: boolean("email_verified").default(false),
	phone: varchar({ length: 20 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
});

export const postLikes = pgTable("post_likes", {
	id: varchar({ length: 25 }).default(sql`(\'like_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	postId: varchar("post_id", { length: 25 }).notNull(),
	userId: varchar("user_id", { length: 25 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_post_likes_post_id").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_likes_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_likes_user_id_fkey"
		}).onDelete("cascade"),
]);

export const postAttachments = pgTable("post_attachments", {
	id: varchar({ length: 25 }).default(sql`(\'attach_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	postId: varchar("post_id", { length: 25 }).notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	filePath: varchar("file_path", { length: 500 }).notNull(),
	fileSize: integer("file_size").notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }),
	downloadCount: integer("download_count").default(0),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_attachments_post_id").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_attachments_post_id_fkey"
		}).onDelete("cascade"),
]);

export const commentLikes = pgTable("comment_likes", {
	id: varchar({ length: 25 }).default(sql`(\'clike_\'::text || encode(gen_random_bytes(8), \'hex\'::text))`).notNull(),
	commentId: varchar("comment_id", { length: 25 }).notNull(),
	userId: varchar("user_id", { length: 25 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_comment_likes_comment_id").using("btree", table.commentId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "comment_likes_comment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comment_likes_user_id_fkey"
		}).onDelete("cascade"),
]);

export const translationCache = pgTable("translation_cache", {
	id: serial().notNull(),
	sourceText: text("source_text").notNull(),
	sourceLanguage: varchar("source_language", { length: 10 }).notNull(),
	targetLanguage: varchar("target_language", { length: 10 }).notNull(),
	translatedText: text("translated_text").notNull(),
	provider: varchar({ length: 50 }).default('google'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const uiConfig = pgTable("ui_config", {
	id: serial().notNull(),
	configKey: varchar("config_key", { length: 100 }).notNull(),
	configValue: jsonb("config_value").notNull(),
	configType: varchar("config_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const systemSettings = pgTable("system_settings", {
	id: serial().notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const languagePackKeys = pgTable("language_pack_keys", {
	id: uuid().defaultRandom().notNull(),
	keyName: varchar("key_name", { length: 255 }).notNull(),
	componentType: varchar("component_type", { length: 50 }).notNull(),
	componentId: varchar("component_id", { length: 100 }),
	description: text(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_pack_keys_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_pack_keys_component").using("btree", table.componentType.asc().nullsLast().op("text_ops"), table.componentId.asc().nullsLast().op("text_ops")),
]);

export const languagePackTranslations = pgTable("language_pack_translations", {
	id: uuid().defaultRandom().notNull(),
	keyId: uuid("key_id").notNull(),
	languageCode: varchar("language_code", { length: 10 }).notNull(),
	translation: text().notNull(),
	isAutoTranslated: boolean("is_auto_translated").default(false),
	translatorNotes: text("translator_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_pack_translations_language").using("btree", table.languageCode.asc().nullsLast().op("text_ops")),
	index("idx_pack_translations_lookup").using("btree", table.keyId.asc().nullsLast().op("text_ops"), table.languageCode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.keyId],
			foreignColumns: [languagePackKeys.id],
			name: "language_pack_translations_key_id_fkey"
		}).onDelete("cascade"),
]);

export const publicSettings = pgTable("public_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("public_settings_key_key").on(table.key),
]);

export const orders = pgTable("orders", {
	id: serial().notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 255 }),
	customerName: varchar("customer_name", { length: 100 }).notNull(),
	customerEmail: varchar("customer_email", { length: 255 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 20 }),
	shippingAddress: text("shipping_address").notNull(),
	totalAmount: integer("total_amount").notNull(),
	status: varchar({ length: 20 }).default('pending'),
	paymentStatus: varchar("payment_status", { length: 20 }).default('pending'),
	paymentMethod: varchar("payment_method", { length: 50 }),
	trackingNumber: varchar("tracking_number", { length: 100 }),
	deliveryDate: timestamp("delivery_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_orders_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_orders_payment_status").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_fkey"
		}),
	check("orders_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])`),
	check("orders_payment_status_check", sql`(payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[])`),
]);

export const productImages = pgTable("product_images", {
	id: varchar({ length: 50 }).notNull(),
	productId: varchar("product_id", { length: 50 }),
	url: text().notNull(),
	webpUrl: text("webp_url"),
	fileName: varchar("file_name", { length: 255 }),
	fileSize: integer("file_size"),
	imageType: varchar("image_type", { length: 50 }).default('thumbnail'),
	orderIndex: integer("order_index").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_product_images_product").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_images_product_id_fkey"
		}).onDelete("cascade"),
]);

export const languageMetadata = pgTable("language_metadata", {
	id: serial().notNull(),
	code: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	nativeName: varchar("native_name", { length: 100 }),
	googleCode: varchar("google_code", { length: 10 }).notNull(),
	direction: varchar({ length: 5 }).default('ltr'),
	flagEmoji: varchar("flag_emoji", { length: 10 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	check("language_metadata_direction_check", sql`(direction)::text = ANY ((ARRAY['ltr'::character varying, 'rtl'::character varying])::text[])`),
]);

export const products = pgTable("products", {
	id: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	condition: varchar({ length: 20 }).default('GOOD'),
	categoryId: varchar("category_id", { length: 50 }),
	stock: integer().default(0),
	rating: numeric({ precision: 3, scale:  2 }).default('0'),
	reviewCount: integer("review_count").default(0),
	featured: boolean().default(false),
	new: boolean().default(true),
	status: varchar({ length: 20 }).default('ACTIVE'),
	discountRate: integer("discount_rate").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	usagePeriod: text("usage_period"),
	purchaseDate: text("purchase_date"),
	detailedDescription: text("detailed_description"),
	sellerName: text("seller_name"),
	sellerLocation: text("seller_location"),
	verifiedSeller: boolean("verified_seller").default(false),
	defects: text(),
	deliveryMethod: text("delivery_method"),
}, (table) => [
	index("idx_products_category").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("idx_products_featured").using("btree", table.featured.asc().nullsLast().op("bool_ops")),
	index("idx_products_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_fkey"
		}),
]);

export const languagePacks = pgTable("language_packs", {
	key: varchar({ length: 255 }).notNull(),
	ko: text().default(''),
	en: text().default(''),
	ja: text().default(''),
	zh: text().default(''),
	vi: text().default(''),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const carts = pgTable("carts", {
	id: varchar({ length: 255 }).default(sql`gen_random_uuid()`).notNull(),
	userId: varchar("user_id", { length: 255 }),
	sessionId: varchar("session_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	check("cart_user_or_session", sql`(user_id IS NOT NULL) OR (session_id IS NOT NULL)`),
]);

export const cartItems = pgTable("cart_items", {
	id: varchar({ length: 255 }).default(sql`gen_random_uuid()`).notNull(),
	cartId: varchar("cart_id", { length: 255 }),
	productId: varchar("product_id", { length: 255 }),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "cart_items_cart_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_items_product_id_fkey"
		}).onDelete("cascade"),
]);

export const siteConfig = pgTable("site_config", {
	id: serial().primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: text(),
	description: text(),
	category: varchar({ length: 50 }).default('general'),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_site_config_key").using("btree", table.key.asc().nullsLast().op("text_ops")),
	unique("site_config_key_key").on(table.key),
]);

// 재고 관리 테이블들
export const inventory = pgTable("inventory", {
	id: varchar({ length: 50 }).primaryKey().default(sql`('INV-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8)))`).notNull(),
	productId: varchar("product_id", { length: 50 }).notNull(),
	currentStock: integer("current_stock").default(0).notNull(),
	minStock: integer("min_stock").default(0).notNull(),
	maxStock: integer("max_stock").default(1000).notNull(),
	reorderPoint: integer("reorder_point").default(10).notNull(),
	reservedStock: integer("reserved_stock").default(0).notNull(),
	availableStock: integer("available_stock"),
	lastRestocked: timestamp("last_restocked", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	location: varchar({ length: 50 }),
	status: varchar({ length: 20 }).default('optimal'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_inventory_product_id").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("idx_inventory_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_inventory_available_stock").using("btree", table.availableStock.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "inventory_product_id_fkey"
	}).onDelete("cascade"),
	check("inventory_status_check", sql`status IN ('optimal', 'low', 'critical', 'out-of-stock')`),
]);

export const inventoryTransactions = pgTable("inventory_transactions", {
	id: serial().primaryKey().notNull(),
	inventoryId: varchar("inventory_id", { length: 50 }).notNull(),
	productId: varchar("product_id", { length: 50 }).notNull(),
	transactionType: varchar("transaction_type", { length: 20 }).notNull(),
	quantityChange: integer("quantity_change").notNull(),
	quantityBefore: integer("quantity_before").notNull(),
	quantityAfter: integer("quantity_after").notNull(),
	reason: varchar({ length: 255 }),
	referenceId: varchar("reference_id", { length: 50 }),
	userId: varchar("user_id", { length: 50 }),
	notes: text(),
	transactionDate: timestamp("transaction_date", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_inventory_transactions_inventory_id").using("btree", table.inventoryId.asc().nullsLast().op("text_ops")),
	index("idx_inventory_transactions_date").using("btree", table.transactionDate.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
		columns: [table.inventoryId],
		foreignColumns: [inventory.id],
		name: "inventory_transactions_inventory_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "inventory_transactions_product_id_fkey"
	}).onDelete("cascade"),
	check("inventory_transactions_type_check", sql`transaction_type IN ('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer')`),
]);

export const inventoryAlerts = pgTable("inventory_alerts", {
	id: serial().primaryKey().notNull(),
	inventoryId: varchar("inventory_id", { length: 50 }).notNull(),
	alertType: varchar("alert_type", { length: 20 }).notNull(),
	thresholdValue: integer("threshold_value"),
	isActive: boolean("is_active").default(true),
	lastTriggered: timestamp("last_triggered", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_inventory_alerts_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops"), table.alertType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.inventoryId],
		foreignColumns: [inventory.id],
		name: "inventory_alerts_inventory_id_fkey"
	}).onDelete("cascade"),
	check("inventory_alerts_type_check", sql`alert_type IN ('low_stock', 'out_of_stock', 'overstocked', 'reorder_needed')`),
]);

export const restockRequests = pgTable("restock_requests", {
	id: varchar({ length: 50 }).primaryKey().default(sql`('RST-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8)))`).notNull(),
	inventoryId: varchar("inventory_id", { length: 50 }).notNull(),
	productId: varchar("product_id", { length: 50 }).notNull(),
	requestedQuantity: integer("requested_quantity").notNull(),
	approvedQuantity: integer("approved_quantity"),
	supplier: varchar({ length: 255 }),
	expectedDate: timestamp("expected_date", { mode: 'string' }),
	actualDate: timestamp("actual_date", { mode: 'string' }),
	status: varchar({ length: 20 }).default('pending'),
	priority: varchar({ length: 10 }).default('medium'),
	requestedBy: varchar("requested_by", { length: 50 }),
	approvedBy: varchar("approved_by", { length: 50 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_restock_requests_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_restock_requests_priority").using("btree", table.priority.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
		columns: [table.inventoryId],
		foreignColumns: [inventory.id],
		name: "restock_requests_inventory_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "restock_requests_product_id_fkey"
	}).onDelete("cascade"),
	check("restock_requests_status_check", sql`status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')`),
	check("restock_requests_priority_check", sql`priority IN ('low', 'medium', 'high', 'urgent')`),
]);

// 리뷰 테이블
export const reviews = pgTable("reviews", {
	id: varchar({ length: 50 }).primaryKey().default(sql`('REV-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 8)))`).notNull(),
	productId: varchar("product_id", { length: 50 }).notNull(),
	productName: varchar("product_name", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 50 }),
	customerName: varchar("customer_name", { length: 100 }).notNull(),
	customerEmail: varchar("customer_email", { length: 255 }),
	rating: integer().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	images: jsonb().default('[]'),
	helpful: integer().default(0),
	status: reviewStatus().default('pending'),
	verified: boolean().default(false),
	reply: text(),
	replyDate: timestamp("reply_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reviews_product_id").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("idx_reviews_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_reviews_rating").using("btree", table.rating.asc().nullsLast().op("int4_ops")),
	index("idx_reviews_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
		columns: [table.productId],
		foreignColumns: [products.id],
		name: "reviews_product_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "reviews_user_id_fkey"
	}).onDelete("set null"),
	check("reviews_rating_check", sql`rating >= 1 AND rating <= 5`),
]);
