// API routes for cart management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Cart routes for logged-in users (database operations)
export const ADD_TO_CART = `${BASE_URL}/api/cart/add`;
export const GET_CART_ITEMS = `${BASE_URL}/api/cart`;
export const GET_CART_SUMMARY = `${BASE_URL}/api/cart/summary`;
export const UPDATE_CART_ITEM = (itemId) =>
  `${BASE_URL}/api/cart/item/${itemId}`;
export const REMOVE_CART_ITEM = (itemId) =>
  `${BASE_URL}/api/cart/item/${itemId}`;
export const CLEAR_CART = `${BASE_URL}/api/cart/clear`;
export const GET_CART_BY_ID = (cartId) => `${BASE_URL}/api/cart/${cartId}`;

// New endpoint for batch adding items (used when merging guest cart on login)
export const BATCH_ADD_TO_CART = `${BASE_URL}/api/cart/batch-add`;

// Legacy endpoints (kept for backward compatibility)
export const MERGE_CARTS = `${BASE_URL}/api/cart/merge`;
export const UPDATE_GUEST_INFO = (cartId) =>
  `${BASE_URL}/api/cart/guest/${cartId}`;
