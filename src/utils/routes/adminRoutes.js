// API routes for user management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// User management routes
export const GET_ALL_USERS = `${BASE_URL}/api/admin/getAllUsers`;
export const GET_USER_BY_ID = (id) => `${BASE_URL}/api/admin/getUser/${id}`;
export const UPDATE_USER = `${BASE_URL}/api/admin/updateUser`;
export const SEND_NEWSLETTER = `${BASE_URL}/api/admin/sendNewsLetter`;
export const GET_NEWSLETTER_SUBSCRIBERS = `${BASE_URL}/api/admin/getAllSubscribers`;
export const DELETE_USER = (id) => `${BASE_URL}/api/admin/deleteUser/${id}`;
export const REQUEST_RESET_PASSWORD = `${BASE_URL}/api/admin/requestResetPassword`;
export const RESET_PASSWORD = `${BASE_URL}/api/admin/resetPassword`;
export const VALIDATE_RESET_TOKEN =  `${BASE_URL}/api/admin/validateResetToken`;