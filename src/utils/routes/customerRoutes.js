// utils/routes/customerRoutes.js
// API routes for customer management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Authentication routes
export const LOGIN = `${BASE_URL}/api/customer/login`;
export const SIGNUP = `${BASE_URL}/api/customer/create`;
export const VERIFY_OTP = `${BASE_URL}/api/customer/verify-OTP`;
export const RESEND_OTP = `${BASE_URL}/api/customer/resend-otp`;

// Customer management routes
export const SUBSCRIBE_NEWSLETTER = `${BASE_URL}/api/customer/subscribeNewsletter`;
export const GET_PROFILE = `${BASE_URL}/api/customer/profile`;
export const UPDATE_PROFILE = `${BASE_URL}/api/customer/profile`;

// Product routes
export const GET_ALL_PRODUCTS = `${BASE_URL}/api/products`;
export const GET_PRODUCT_BY_ID = (id) => `${BASE_URL}/api/products/${id}`;
export const GET_PRODUCT_SIZES = (productId) =>
  `${BASE_URL}/api/sizes/products/${productId}/sizes`;

// Category routes
export const GET_ALL_CATEGORIES = `${BASE_URL}/api/categories/getall`;
export const GET_CATEGORY_BY_ID = (id) => `${BASE_URL}/api/categories/${id}`;
