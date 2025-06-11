// utils/routes/notificationRoutes.js
// API routes for notification management

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Test route
export const NOTIFICATION_TEST = `${BASE_URL}/api/notifications/test`;

// Notification management routes
export const GET_UNREAD_NOTIFICATIONS = `${BASE_URL}/api/notifications/unread`;
export const GET_ALL_NOTIFICATIONS = `${BASE_URL}/api/notifications`;
export const GET_NOTIFICATION_STATS = `${BASE_URL}/api/notifications/stats`;

// Individual notification actions
export const MARK_NOTIFICATION_READ = (notificationId) =>
  `${BASE_URL}/api/notifications/${notificationId}/read`;
export const MARK_ALL_NOTIFICATIONS_READ = `${BASE_URL}/api/notifications/read-all`;

// Pagination helper
export const GET_NOTIFICATIONS_PAGINATED = (page = 1, limit = 20) =>
  `${BASE_URL}/api/notifications?page=${page}&limit=${limit}`;
