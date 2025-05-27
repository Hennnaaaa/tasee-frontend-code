// utils/routes/cartRoutes.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      // Add authentication headers here
      // 'Authorization': `Bearer ${getAuthToken()}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

export const cartAPI = {
  // Add item to cart (logged-in users only)
  addToCart: async (userId, productId, sizeId, quantity, price) => {
    return apiCall("/cart/add", {
      method: "POST",
      body: JSON.stringify({
        userId,
        productId,
        sizeId,
        quantity,
        price,
      }),
    });
  },

  // Get cart items (logged-in users only)
  getCartItems: async (userId) => {
    return apiCall(`/cart/items?userId=${userId}`, {
      method: "GET",
    });
  },

  // Get cart summary (logged-in users only)
  getCartSummary: async (userId) => {
    return apiCall(`/cart/summary?userId=${userId}`, {
      method: "GET",
    });
  },

  // Update cart item (logged-in users only)
  updateCartItem: async (itemId, quantity, price) => {
    return apiCall(`/cart/item/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({
        quantity,
        price,
      }),
    });
  },

  // Remove cart item (logged-in users only)
  removeCartItem: async (itemId) => {
    return apiCall(`/cart/item/${itemId}`, {
      method: "DELETE",
    });
  },

  // Clear cart (logged-in users only)
  clearCart: async (userId) => {
    return apiCall("/cart/clear", {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  },

  // Get cart by ID (logged-in users only)
  getCartById: async (cartId) => {
    return apiCall(`/cart/${cartId}`, {
      method: "GET",
    });
  },

  // Batch add to cart (for merging guest cart when user logs in)
  batchAddToCart: async (userId, items) => {
    return apiCall("/cart/batch-add", {
      method: "POST",
      body: JSON.stringify({
        userId,
        items,
      }),
    });
  },
};

// Guest cart localStorage utilities
export const guestCartUtils = {
  // Get guest cart from localStorage
  getGuestCart: () => {
    try {
      const cartData = localStorage.getItem("guestCart");
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error parsing guest cart:", error);
      return [];
    }
  },

  // Save guest cart to localStorage
  saveGuestCart: (cartItems) => {
    try {
      localStorage.setItem("guestCart", JSON.stringify(cartItems));
      return true;
    } catch (error) {
      console.error("Error saving guest cart:", error);
      return false;
    }
  },

  // Add item to guest cart
  addToGuestCart: (product, sizeVariant, quantity = 1) => {
    const cartItems = guestCartUtils.getGuestCart();

    // Check if item already exists
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.sizeVariant?.sizeId === sizeVariant.sizeId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = cartItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      // Check inventory limit
      if (newQuantity > sizeVariant.inventory) {
        throw new Error(`Only ${sizeVariant.inventory} items available`);
      }

      cartItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      // Add new item
      if (quantity > sizeVariant.inventory) {
        throw new Error(`Only ${sizeVariant.inventory} items available`);
      }

      const cartItem = {
        id: `guest_${Date.now()}_${Math.random()}`,
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          discountedPrice: product.discountedPrice,
          sku: product.sku,
        },
        sizeVariant: {
          sizeId: sizeVariant.sizeId,
          price: sizeVariant.price,
          inventory: sizeVariant.inventory,
          size: sizeVariant.size,
        },
        quantity: quantity,
        addedAt: new Date().toISOString(),
      };

      cartItems.push(cartItem);
    }

    guestCartUtils.saveGuestCart(cartItems);
    return cartItems;
  },

  // Update guest cart item
  updateGuestCartItem: (itemId, quantity) => {
    const cartItems = guestCartUtils.getGuestCart();
    const itemIndex = cartItems.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error("Cart item not found");
    }

    const item = cartItems[itemIndex];
    if (quantity > item.sizeVariant.inventory) {
      throw new Error(`Only ${item.sizeVariant.inventory} items available`);
    }

    cartItems[itemIndex] = { ...item, quantity };
    guestCartUtils.saveGuestCart(cartItems);
    return cartItems;
  },

  // Remove item from guest cart
  removeGuestCartItem: (itemId) => {
    const cartItems = guestCartUtils.getGuestCart();
    const filteredItems = cartItems.filter((item) => item.id !== itemId);
    guestCartUtils.saveGuestCart(filteredItems);
    return filteredItems;
  },

  // Clear guest cart
  clearGuestCart: () => {
    localStorage.removeItem("guestCart");
    return [];
  },

  // Get guest cart totals
  getGuestCartTotals: () => {
    const cartItems = guestCartUtils.getGuestCart();
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => {
      const price =
        item.sizeVariant?.price ||
        item.product?.discountedPrice ||
        item.product?.price ||
        0;
      return sum + price * item.quantity;
    }, 0);

    return {
      itemCount,
      total: parseFloat(total.toFixed(2)),
      items: cartItems,
    };
  },
};
