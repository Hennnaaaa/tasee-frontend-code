// utils/routes/addressRoutes.js
// API routes for address management (updated with guest support)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Address management routes
export const CREATE_ADDRESS = `${BASE_URL}/api/addresses`;

// User address routes
export const GET_USER_ADDRESSES = (userId) =>
  `${BASE_URL}/api/addresses/user/${userId}`;
export const GET_USER_DEFAULT_ADDRESS = (userId) =>
  `${BASE_URL}/api/addresses/user/${userId}/default`;
export const GET_USER_ADDRESSES_BY_TYPE = (userId, type) =>
  `${BASE_URL}/api/addresses/user/${userId}/type/${type}`;

// Guest address routes (NEW)
export const GET_GUEST_ADDRESSES = (guestEmail) =>
  `${BASE_URL}/api/addresses/guest/${encodeURIComponent(guestEmail)}`;
export const GET_GUEST_DEFAULT_ADDRESS = (guestEmail) =>
  `${BASE_URL}/api/addresses/guest/${encodeURIComponent(guestEmail)}/default`;
export const GET_GUEST_ADDRESSES_BY_TYPE = (guestEmail, type) =>
  `${BASE_URL}/api/addresses/guest/${encodeURIComponent(
    guestEmail
  )}/type/${type}`;

// Common routes (work for both user and guest)
export const GET_ADDRESS_BY_ID = (addressId) =>
  `${BASE_URL}/api/addresses/${addressId}`;
export const UPDATE_ADDRESS = (addressId) =>
  `${BASE_URL}/api/addresses/${addressId}`;
export const DELETE_ADDRESS = (addressId) =>
  `${BASE_URL}/api/addresses/${addressId}`;
export const SET_DEFAULT_ADDRESS = (addressId) =>
  `${BASE_URL}/api/addresses/${addressId}/set-default`;
