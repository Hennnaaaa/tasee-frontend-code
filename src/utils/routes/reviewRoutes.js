// src/utils/routes/reviewRoutes.js

// API routes for review management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ========================================
// CUSTOMER REVIEW ROUTES
// ========================================

// Create a new review
export const CREATE_REVIEW = `${BASE_URL}/api/reviews`;

// Get reviews for a specific product
export const GET_PRODUCT_REVIEWS = (productId) =>
  `${BASE_URL}/api/reviews/product/${productId}`;

// Update user's own review
export const UPDATE_REVIEW = (reviewId) =>
  `${BASE_URL}/api/reviews/${reviewId}`;

// Delete user's own review
export const DELETE_REVIEW = (reviewId) =>
  `${BASE_URL}/api/reviews/${reviewId}`;

// Mark review as helpful
export const MARK_REVIEW_HELPFUL = (reviewId) =>
  `${BASE_URL}/api/reviews/${reviewId}/helpful`;

// Get user's own reviews
export const GET_MY_REVIEWS = `${BASE_URL}/api/reviews/my-reviews`;

// Get products user can review from an order
export const GET_REVIEWABLE_PRODUCTS = (orderId) =>
  `${BASE_URL}/api/reviews/orders/${orderId}/reviewable-products`;

// ========================================
// PUBLIC REVIEW ROUTES (No Auth Required)
// ========================================

// Get public product reviews
export const GET_PUBLIC_PRODUCT_REVIEWS = (productId) =>
  `${BASE_URL}/api/reviews/public/product/${productId}`;

// Get product rating summary
export const GET_PRODUCT_RATING_SUMMARY = (productId) =>
  `${BASE_URL}/api/reviews/public/products/${productId}/rating-summary`;

// ========================================
// ADMIN REVIEW ROUTES
// ========================================

// Get all reviews with filters
export const GET_ALL_REVIEWS = `${BASE_URL}/api/reviews/getAllReviews`;

// Toggle review visibility
export const TOGGLE_REVIEW_VISIBILITY = `${BASE_URL}/api/reviews/toggleReviewVisibility`;

// Delete any review (Admin)
export const ADMIN_DELETE_REVIEW = `${BASE_URL}/api/reviews/adminDeleteReview`;

// Get review statistics
export const GET_REVIEW_STATS = `${BASE_URL}/api/reviews/getReviewStats`;

// Bulk update reviews
export const BULK_UPDATE_REVIEWS = `${BASE_URL}/api/reviews/bulkUpdateReviews`;

// Export reviews to CSV
export const EXPORT_REVIEWS = `${BASE_URL}/api/reviews/exportReviews`;

// Get review summary for dashboard
export const GET_REVIEW_SUMMARY = `${BASE_URL}/api/reviews/getReviewSummary`;
