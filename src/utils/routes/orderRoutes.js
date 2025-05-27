// utils/routes/orderRoutes.js
// API routes for order management

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Order management routes
export const CREATE_ORDER = `${BASE_URL}/api/orders`;
export const GET_ORDER_BY_ID = (orderId) => `${BASE_URL}/api/orders/${orderId}`;
export const GET_USER_ORDERS = `${BASE_URL}/api/orders/user`;
export const UPDATE_ORDER_STATUS = `${BASE_URL}/api/orders/status`;
export const UPDATE_PAYMENT_STATUS = `${BASE_URL}/api/orders/payment-status`;
export const CANCEL_ORDER = `${BASE_URL}/api/orders/cancel`;
