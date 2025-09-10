import { relations } from "drizzle-orm/relations";
import { wishlists, wishlistItems, products, orders, orderItems, posts, comments, users, boards, postLikes, postAttachments, commentLikes, languagePackKeys, languagePackTranslations, productImages, categories, carts, cartItems } from "./schema";

export const wishlistItemsRelations = relations(wishlistItems, ({one}) => ({
	wishlist: one(wishlists, {
		fields: [wishlistItems.wishlistId],
		references: [wishlists.id]
	}),
	product: one(products, {
		fields: [wishlistItems.productId],
		references: [products.id]
	}),
}));

export const wishlistsRelations = relations(wishlists, ({many}) => ({
	wishlistItems: many(wishlistItems),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	wishlistItems: many(wishlistItems),
	orderItems: many(orderItems),
	productImages: many(productImages),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	cartItems: many(cartItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	comment: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: "comments_parentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentId_comments_id"
	}),
	commentLikes: many(commentLikes),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	comments: many(comments),
	board: one(boards, {
		fields: [posts.boardId],
		references: [boards.id]
	}),
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
	postLikes: many(postLikes),
	postAttachments: many(postAttachments),
}));

export const usersRelations = relations(users, ({many}) => ({
	comments: many(comments),
	posts: many(posts),
	postLikes: many(postLikes),
	commentLikes: many(commentLikes),
	orders: many(orders),
}));

export const boardsRelations = relations(boards, ({many}) => ({
	posts: many(posts),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	post: one(posts, {
		fields: [postLikes.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postLikes.userId],
		references: [users.id]
	}),
}));

export const postAttachmentsRelations = relations(postAttachments, ({one}) => ({
	post: one(posts, {
		fields: [postAttachments.postId],
		references: [posts.id]
	}),
}));

export const commentLikesRelations = relations(commentLikes, ({one}) => ({
	comment: one(comments, {
		fields: [commentLikes.commentId],
		references: [comments.id]
	}),
	user: one(users, {
		fields: [commentLikes.userId],
		references: [users.id]
	}),
}));

export const languagePackTranslationsRelations = relations(languagePackTranslations, ({one}) => ({
	languagePackKey: one(languagePackKeys, {
		fields: [languagePackTranslations.keyId],
		references: [languagePackKeys.id]
	}),
}));

export const languagePackKeysRelations = relations(languagePackKeys, ({many}) => ({
	languagePackTranslations: many(languagePackTranslations),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
}));

export const cartsRelations = relations(carts, ({many}) => ({
	cartItems: many(cartItems),
}));