// API routes for inventory management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Category routes
export const GET_ALL_CATEGORIES = `${BASE_URL}/categories/getall`;
export const GET_CATEGORY_BY_ID = (id) => `${BASE_URL}/categories/${id}`;
export const CREATE_CATEGORY = `${BASE_URL}/categories`;
export const UPDATE_CATEGORY = (id) => `${BASE_URL}/categories/${id}`;
export const DELETE_CATEGORY = (id) => `${BASE_URL}/categories/${id}`;

// Product routes
export const GET_ALL_PRODUCTS = `${BASE_URL}/products`;
export const GET_PRODUCT_BY_ID = (id) => `${BASE_URL}/products/${id}`;
export const CREATE_PRODUCT = `${BASE_URL}/products`;
export const UPDATE_PRODUCT = (id) => `${BASE_URL}/products/${id}`;
export const DELETE_PRODUCT = (id) => `${BASE_URL}/products/${id}`;
export const UPDATE_INVENTORY = (id) => `${BASE_URL}/products/${id}/inventory`;
export const GET_INVENTORY_SUMMARY = `${BASE_URL}/products/inventorysummary`;

// Size routes
export const GET_ALL_SIZES = `${BASE_URL}/sizes`;
export const GET_SIZE_BY_ID = (id) => `${BASE_URL}/sizes/${id}`;
export const GET_SIZE_CHART = (category) =>
  `${BASE_URL}/sizes/chart/${category}`;
export const CREATE_SIZE = `${BASE_URL}/sizes`;
export const CREATE_STANDARD_SIZES = `${BASE_URL}/sizes/standard`;
export const UPDATE_SIZE = (id) => `${BASE_URL}/sizes/${id}`;
export const DELETE_SIZE = (id) => `${BASE_URL}/sizes/${id}`;

// Product size management
export const GET_PRODUCT_SIZES = (productId) =>
  `${BASE_URL}/sizes/products/${productId}/sizes`;
export const ASSIGN_SIZES_TO_PRODUCT = (productId) =>
  `${BASE_URL}/sizes/products/${productId}/sizes`;
export const UPDATE_PRODUCT_SIZE_INVENTORY = (productSizeId) =>
  `${BASE_URL}/sizes/product-sizes/${productSizeId}/inventory`;
