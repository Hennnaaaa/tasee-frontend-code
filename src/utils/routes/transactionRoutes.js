const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API routes for transaction management
export const GET_ALL_TRANSACTIONS = `${BASE_URL}/api/transactions/getAllTransactions`;
export const GET_TRANSACTION_DETAILS = (transactionId) =>
  `${BASE_URL}/api/getTransactionById/${transactionId}`;
export const CREATE_TRANSACTION = `${BASE_URL}/api/transactions/createTransaction`;
export const UPDATE_TRANSACTION_STATUS = (transactionId) =>
  `${BASE_URL}/api/transactions/${transactionId}/updateStatus`;
export const GET_TRANSACTIONS_FOR_USER = (userId) => `${BASE_URL}/api/transactions/getUserTransactions/${userId}`;

