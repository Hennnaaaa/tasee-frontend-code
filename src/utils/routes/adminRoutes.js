// API routes for user management
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// User management routes
export const GET_ALL_USERS = `${BASE_URL}/api/admin/getAllUsers`;
export const GET_USER_BY_ID = (id) => `${BASE_URL}/api/admin/getUser/${id}`;
export const UPDATE_USER = `${BASE_URL}/api/admin/updateUser`;
export const DELETE_USER = (id) => `${BASE_URL}/api/admin/deleteUser/${id}`;
