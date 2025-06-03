// utils/routes/orderRoutes.js
// API routes for order management

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// CUSTOMER ORDER ROUTES (No Authentication Required)
// ============================================================================

export const CREATE_ORDER = `${BASE_URL}/api/orders`;
export const GET_ORDER_BY_ID = (orderId) => `${BASE_URL}/api/orders/${orderId}`;
export const GET_USER_ORDERS = `${BASE_URL}/api/orders/user`;
export const UPDATE_ORDER_STATUS = `${BASE_URL}/api/orders/status`;
export const UPDATE_PAYMENT_STATUS = `${BASE_URL}/api/orders/payment-status`;
export const CANCEL_ORDER = `${BASE_URL}/api/orders/cancel`;

// ============================================================================
// ADMIN ORDER ROUTES (Authentication Required)
// ============================================================================

export const ADMIN_GET_ALL_ORDERS = `${BASE_URL}/api/orders/admin/all`;
export const ADMIN_GET_ANALYTICS = `${BASE_URL}/api/orders/admin/analytics`;
export const ADMIN_GET_SUMMARY = `${BASE_URL}/api/orders/admin/summary`;
export const ADMIN_EXPORT_ORDERS = `${BASE_URL}/api/orders/admin/export`;
export const ADMIN_GET_ORDER_DETAILS = (orderId) =>
  `${BASE_URL}/api/orders/admin/details/${orderId}`;
export const ADMIN_UPDATE_ORDER_STATUS = `${BASE_URL}/api/orders/admin/status`;
export const ADMIN_BULK_UPDATE_STATUS = `${BASE_URL}/api/orders/admin/bulk-status`;
export const ADMIN_UPDATE_PAYMENT_STATUS = `${BASE_URL}/api/orders/admin/payment-status`;
export const ADMIN_FORCE_CANCEL_ORDER = `${BASE_URL}/api/orders/admin/force-cancel`;
