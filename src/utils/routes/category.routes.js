const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

const CREATE_CATEGORY = `${baseApiUrl}/api/category/createCategory`;
const GET_ALL_CATEGORIES = `${baseApiUrl}/api/category/getAll`;

export {
  CREATE_CATEGORY,
  GET_ALL_CATEGORIES,
};