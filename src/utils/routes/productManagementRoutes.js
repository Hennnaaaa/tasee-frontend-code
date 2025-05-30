// API routes for inventory management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Category routes
export const GET_ALL_CATEGORIES = `${BASE_URL}/api/categories/getall`;
export const GET_NAVIGATION_CATEGORIES = `${BASE_URL}/api/categories/navigation`;
export const GET_CATEGORY_BY_ID = (id) => `${BASE_URL}/api/categories/${id}`;
export const CREATE_CATEGORY = `${BASE_URL}/api/categories`;
export const UPDATE_CATEGORY = (id) => `${BASE_URL}/api/categories/${id}`;
export const DELETE_CATEGORY = (id) => `${BASE_URL}/api/categories/${id}`;

// NEW Category routes for customer pages
export const GET_CATEGORY_BY_SLUG = (slug) =>
  `${BASE_URL}/api/categories/slug/${slug}`;
export const GET_SUBCATEGORY_PRODUCTS = (categorySlug, subcategorySlug) =>
  `${BASE_URL}/api/categories/subcategory/${categorySlug}/${subcategorySlug}`;
export const GET_SUBCATEGORY_INFO = (categorySlug, subcategorySlug) =>
  `${BASE_URL}/api/categories/subcategory-info/${categorySlug}/${subcategorySlug}`;

// Product routes
export const GET_ALL_PRODUCTS = `${BASE_URL}/api/products`;
export const GET_PRODUCT_BY_ID = (id) => `${BASE_URL}/api/products/${id}`;
export const CREATE_PRODUCT = `${BASE_URL}/api/products`;
export const UPDATE_PRODUCT = (id) => `${BASE_URL}/api/products/${id}`;
export const DELETE_PRODUCT = (id) => `${BASE_URL}/api/products/${id}`;
export const UPDATE_INVENTORY = (id) =>
  `${BASE_URL}/api/products/${id}/inventory`;
export const GET_INVENTORY_SUMMARY = `${BASE_URL}/api/products/inventorysummary`;

// Size routes
export const GET_ALL_SIZES = `${BASE_URL}/api/sizes`;
export const GET_SIZE_BY_ID = (id) => `${BASE_URL}/api/sizes/${id}`;
export const GET_SIZE_CHART = (category) =>
  `${BASE_URL}/api/sizes/chart/${category}`;
export const CREATE_SIZE = `${BASE_URL}/api/sizes`;
export const CREATE_STANDARD_SIZES = `${BASE_URL}/api/sizes/standard`;
export const UPDATE_SIZE = (id) => `${BASE_URL}/api/sizes/${id}`;
export const DELETE_SIZE = (id) => `${BASE_URL}/api/sizes/${id}`;

// Product size management
export const GET_PRODUCT_SIZES = (productId) =>
  `${BASE_URL}/api/sizes/products/${productId}/sizes`;
export const ASSIGN_SIZES_TO_PRODUCT = (productId) =>
  `${BASE_URL}/api/sizes/products/${productId}/sizes`;
export const UPDATE_PRODUCT_SIZE_INVENTORY = (productSizeId) =>
  `${BASE_URL}/api/sizes/product-sizes/${productSizeId}/inventory`;
