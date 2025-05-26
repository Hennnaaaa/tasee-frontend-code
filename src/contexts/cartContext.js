"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  ADD_TO_CART,
  GET_CART_ITEMS,
  GET_CART_SUMMARY,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  CLEAR_CART,
  MERGE_CARTS,
} from "@/utils/routes/cartRoutes";

const CartContext = createContext();

// Local storage key for guest cart
const GUEST_CART_KEY = "guest_cart_items";

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check if user is logged in
  const checkAuthStatus = useCallback(() => {
    if (typeof window === "undefined")
      return { isLoggedIn: false, userId: null };

    const authToken =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    const userIdFromStorage = localStorage.getItem("userId");

    return {
      isLoggedIn: !!(authToken && userIdFromStorage),
      userId: userIdFromStorage,
    };
  }, []);

  // Load cart from localStorage for guest users
  const loadGuestCartFromStorage = useCallback(() => {
    try {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
        setCartCount(
          parsedCart.reduce((total, item) => total + item.quantity, 0)
        );
      } else {
        setCart([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error loading guest cart from storage:", error);
      setCart([]);
      setCartCount(0);
    }
  }, []);

  // Save cart to localStorage for guest users
  const saveGuestCartToStorage = useCallback((cartItems) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving guest cart to storage:", error);
    }
  }, []);

  // Clear guest cart from localStorage
  const clearGuestCartFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (error) {
      console.error("Error clearing guest cart from storage:", error);
    }
  }, []);

  // Fetch cart from backend for logged-in users
  const fetchLoggedInUserCart = useCallback(async (userIdParam) => {
    try {
      const params = new URLSearchParams();
      params.append("userId", userIdParam);

      const response = await fetch(`${GET_CART_ITEMS}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.data.cart) {
        const transformedItems = data.data.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name || "Unknown Product",
          productPrice: parseFloat(item.price),
          originalPrice: parseFloat(item.product?.price || item.price),
          sizeName: item.size?.name || item.size?.code || "One Size",
          sizeId: item.sizeId,
          sku: item.product?.sku || "N/A",
          quantity: item.quantity,
          image: item.product?.image || null,
          category: item.product?.category || null,
        }));

        setCart(transformedItems);
        setCartCount(data.data.itemCount);
      } else {
        setCart([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching logged-in user cart:", error);
      setCart([]);
      setCartCount(0);
    }
  }, []);

  // Initialize cart based on auth status
  const initializeCart = useCallback(async () => {
    setLoading(true);

    const authStatus = checkAuthStatus();
    setIsLoggedIn(authStatus.isLoggedIn);
    setUserId(authStatus.userId);

    if (authStatus.isLoggedIn) {
      // Load from database for logged-in users
      await fetchLoggedInUserCart(authStatus.userId);
    } else {
      // Load from localStorage for guest users
      loadGuestCartFromStorage();
    }

    setLoading(false);
  }, [checkAuthStatus, fetchLoggedInUserCart, loadGuestCartFromStorage]);

  // Merge guest cart with logged-in user cart
  const mergeGuestCartWithUserCart = useCallback(
    async (userIdParam) => {
      try {
        const guestCartItems = JSON.parse(
          localStorage.getItem(GUEST_CART_KEY) || "[]"
        );

        if (guestCartItems.length === 0) {
          return true; // No guest cart to merge
        }

        // Add each guest cart item to the user's cart via API
        for (const guestItem of guestCartItems) {
          try {
            const requestData = {
              userId: userIdParam,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
              price: guestItem.productPrice,
            };

            if (guestItem.sizeId) {
              requestData.sizeId = guestItem.sizeId;
            }

            await fetch(ADD_TO_CART, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });
          } catch (itemError) {
            console.error("Error adding guest item to user cart:", itemError);
            // Continue with other items even if one fails
          }
        }

        // Clear guest cart from localStorage after successful merge
        clearGuestCartFromStorage();
        return true;
      } catch (error) {
        console.error("Error merging guest cart with user cart:", error);
        return false;
      }
    },
    [clearGuestCartFromStorage]
  );

  // Handle user login (call this when user logs in)
  const handleUserLogin = useCallback(
    async (userIdParam) => {
      // Merge guest cart with user cart
      await mergeGuestCartWithUserCart(userIdParam);

      // Update auth status
      setIsLoggedIn(true);
      setUserId(userIdParam);

      // Load user's cart from database
      await fetchLoggedInUserCart(userIdParam);
    },
    [mergeGuestCartWithUserCart, fetchLoggedInUserCart]
  );

  // Handle user logout (call this when user logs out)
  const handleUserLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
    setCart([]);
    setCartCount(0);

    // Load empty guest cart
    loadGuestCartFromStorage();
  }, [loadGuestCartFromStorage]);

  // Add item to cart
  const addToCart = async (product, sizeVariant, quantity) => {
    try {
      if (isLoggedIn && userId) {
        // Add to database for logged-in users
        let requestData = {
          userId: userId,
          productId: product.id,
          quantity: quantity,
          price: sizeVariant.price || product.discountedPrice || product.price,
        };

        if (sizeVariant && sizeVariant.sizeId) {
          requestData.sizeId = sizeVariant.sizeId;
        }

        const response = await fetch(ADD_TO_CART, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (data.success) {
          await fetchLoggedInUserCart(userId);
          return true;
        } else {
          throw new Error(data.message || "Failed to add item to cart");
        }
      } else {
        // Add to localStorage for guest users
        const newItem = {
          id: `guest_${Date.now()}_${Math.random()}`, // Temporary ID for guest items
          productId: product.id,
          productName: product.name,
          productPrice:
            sizeVariant.price || product.discountedPrice || product.price,
          originalPrice: product.price,
          sizeName:
            sizeVariant.size?.name || sizeVariant.size?.code || "One Size",
          sizeId: sizeVariant.sizeId || null,
          sku: product.sku,
          quantity: quantity,
          image: product.image,
          category: product.category,
        };

        const currentCart = [...cart];

        // Check if item already exists (same product and size)
        const existingItemIndex = currentCart.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.sizeId === newItem.sizeId
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          currentCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          currentCart.push(newItem);
        }

        setCart(currentCart);
        setCartCount(
          currentCart.reduce((total, item) => total + item.quantity, 0)
        );
        saveGuestCartToStorage(currentCart);
        return true;
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      if (isLoggedIn && userId) {
        // Update in database for logged-in users
        const response = await fetch(UPDATE_CART_ITEM(itemId), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        const data = await response.json();

        if (data.success) {
          await fetchLoggedInUserCart(userId);
          return true;
        } else {
          throw new Error(data.message || "Failed to update quantity");
        }
      } else {
        // Update in localStorage for guest users
        const currentCart = [...cart];
        const itemIndex = currentCart.findIndex((item) => item.id === itemId);

        if (itemIndex >= 0) {
          currentCart[itemIndex].quantity = newQuantity;
          setCart(currentCart);
          setCartCount(
            currentCart.reduce((total, item) => total + item.quantity, 0)
          );
          saveGuestCartToStorage(currentCart);
          return true;
        } else {
          throw new Error("Item not found in cart");
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      if (isLoggedIn && userId) {
        // Remove from database for logged-in users
        const response = await fetch(REMOVE_CART_ITEM(itemId), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          await fetchLoggedInUserCart(userId);
          return true;
        } else {
          throw new Error(data.message || "Failed to remove item");
        }
      } else {
        // Remove from localStorage for guest users
        const currentCart = cart.filter((item) => item.id !== itemId);
        setCart(currentCart);
        setCartCount(
          currentCart.reduce((total, item) => total + item.quantity, 0)
        );
        saveGuestCartToStorage(currentCart);
        return true;
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (isLoggedIn && userId) {
        // Clear from database for logged-in users
        const response = await fetch(CLEAR_CART, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });

        const data = await response.json();

        if (data.success) {
          setCart([]);
          setCartCount(0);
          return true;
        } else {
          throw new Error(data.message || "Failed to clear cart");
        }
      } else {
        // Clear from localStorage for guest users
        setCart([]);
        setCartCount(0);
        clearGuestCartFromStorage();
        return true;
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.productPrice * item.quantity;
    }, 0);
  };

  // Get cart summary
  const getCartSummary = async () => {
    try {
      if (isLoggedIn && userId) {
        // Get from database for logged-in users
        const params = new URLSearchParams();
        params.append("userId", userId);

        const response = await fetch(
          `${GET_CART_SUMMARY}?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        return data.success ? data.data : null;
      } else {
        // Return local cart summary for guest users
        return {
          cartId: null,
          total: getCartTotal(),
          itemCount: cartCount,
          hasItems: cartCount > 0,
          guestInfo: null,
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("Error getting cart summary:", error);
      return null;
    }
  };

  // Refresh cart data
  const refreshCart = async () => {
    if (isLoggedIn && userId) {
      await fetchLoggedInUserCart(userId);
    } else {
      loadGuestCartFromStorage();
    }
  };

  // Initialize cart on mount and auth changes
  useEffect(() => {
    initializeCart();

    // Listen for auth changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === "authToken" || e.key === "token" || e.key === "userId") {
        initializeCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Set up periodic auth check
    const authCheckInterval = setInterval(() => {
      const authStatus = checkAuthStatus();
      if (
        authStatus.isLoggedIn !== isLoggedIn ||
        authStatus.userId !== userId
      ) {
        initializeCart();
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(authCheckInterval);
    };
  }, [initializeCart, checkAuthStatus, isLoggedIn, userId]);

  const value = {
    cart,
    cartCount,
    loading,
    isLoggedIn,
    userId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartSummary,
    refreshCart,
    handleUserLogin, // Call this when user logs in
    handleUserLogout, // Call this when user logs out
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
