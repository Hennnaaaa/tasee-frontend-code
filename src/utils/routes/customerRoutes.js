const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const SUBSCRIBE_NEWSLETTER = `${BASE_URL}/api/customer/subscribeNewsletter`;
export const GET_ALL_PRODUCTS = `${BASE_URL}/api/products`;
export const GET_ALL_CATEGORIES = `${BASE_URL}/api/categories/getall`;
export const GET_PRODUCT_BY_ID = (id) => `${BASE_URL}/api/products/${id}`;
export const GET_CATEGORY_BY_ID = (id) => `${BASE_URL}/api/categories/${id}`;
export const GET_PRODUCT_SIZES = (productId) =>
  `${BASE_URL}/api/sizes/products/${productId}/sizes`;

// API Functions
export const getAllProducts = async (queryParams = {}) => {
  try {
    // Convert query params to URL string
    const queryString = Object.keys(queryParams)
      .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join("&");

    const response = await fetch(`${GET_ALL_PRODUCTS}?${queryString}`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (id, includeSizes = true) => {
  try {
    const response = await fetch(
      `${GET_PRODUCT_BY_ID(id)}?includeSizes=${includeSizes}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

// Category APIs
export const getAllCategories = async (includeInactive = false) => {
  try {
    const response = await fetch(
      `${GET_ALL_CATEGORIES}?includeInactive=${includeInactive}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategoryById = async (
  id,
  includeProducts = true,
  includeSizes = false
) => {
  try {
    const response = await fetch(
      `${GET_CATEGORY_BY_ID(
        id
      )}?includeProducts=${includeProducts}&includeSizes=${includeSizes}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch category details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching category details:", error);
    throw error;
  }
};

// Size APIs
export const getProductSizes = async (productId, includeInactive = false) => {
  try {
    const response = await fetch(
      `${GET_PRODUCT_SIZES(productId)}?includeInactive=${includeInactive}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product sizes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product sizes:", error);
    throw error;
  }
};

// Cart APIs (placeholders for future implementation)
export const addToCart = async (productId, sizeId, quantity) => {
  // This will be implemented later
  console.log("Add to cart:", { productId, sizeId, quantity });
  return { success: true };
};
