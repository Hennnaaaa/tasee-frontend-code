const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Cart management routes
export const ADD_TO_CART = `${BASE_URL}/api/cart/add`;
export const GET_CART_ITEMS = (userId) =>
  `${BASE_URL}/api/cart/items?userId=${userId}`;
export const GET_CART_SUMMARY = (userId) =>
  `${BASE_URL}/api/cart/summary?userId=${userId}`;
export const UPDATE_CART_ITEM = (itemId) =>
  `${BASE_URL}/api/cart/item/${itemId}`;
export const REMOVE_CART_ITEM = (itemId) =>
  `${BASE_URL}/api/cart/item/${itemId}`;
export const CLEAR_CART = `${BASE_URL}/api/cart/clear`;
export const GET_CART_BY_ID = (cartId) => `${BASE_URL}/api/cart/${cartId}`;
export const BATCH_ADD_TO_CART = `${BASE_URL}/api/cart/batch-add`;

// Guest cart localStorage key
export const GUEST_CART_KEY = "guestCart";

// Simple localStorage utilities
export const getGuestCart = () => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("Error parsing guest cart:", error);
    return [];
  }
};

export const saveGuestCart = (cartItems) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    return true;
  } catch (error) {
    console.error("Error saving guest cart:", error);
    return false;
  }
};

export const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY);
  return [];
};
