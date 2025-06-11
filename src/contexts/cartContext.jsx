// src/contexts/cartContext.js - Complete updated version with simplified routes
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserData } from "@/utils/auth";
import { 
  ADD_TO_CART, 
  GET_CART_ITEMS, 
  UPDATE_CART_ITEM, 
  REMOVE_CART_ITEM, 
  CLEAR_CART, 
  BATCH_ADD_TO_CART,
  getGuestCart,
  saveGuestCart,
  clearGuestCart
} from "@/utils/routes/cartRoutes";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [lastUserCheck, setLastUserCheck] = useState(null);

  // Helper function for API calls
  const apiCall = async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
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

  // Check for user data changes - OPTIMIZED VERSION
  useEffect(() => {
    const checkUserData = () => {
      const authData = getUserData();
      const userString = authData ? JSON.stringify(authData.userData) : null;

      if (userString !== lastUserCheck) {
        console.log("🛒 User data changed, updating...");
        
        if (authData && authData.userData) {
          setUser(authData.userData);
          console.log("🛒 User set from localStorage:", authData.userData);
        } else {
          setUser(null);
          console.log("🛒 No user found, switching to guest mode");
        }

        setLastUserCheck(userString);
      }
    };

    checkUserData();

    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        console.log("🛒 Storage changed, rechecking user data");
        checkUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleAuthChange = () => {
      console.log("🛒 Auth change event received");
      checkUserData();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [lastUserCheck]);

  // Set up cart callbacks for auth provider
  useEffect(() => {
    window.cartInitCallback = handleUserChange;
    window.cartLogoutCallback = handleUserLogout;

    return () => {
      delete window.cartInitCallback;
      delete window.cartLogoutCallback;
    };
  }, []);

  // Initialize cart when user changes
  useEffect(() => {
    if (user !== null || lastUserCheck !== null) {
      initializeCart();
    }
  }, [user]);

  // Update totals whenever cart items change
  useEffect(() => {
    calculateCartTotals();
  }, [cartItems]);

  const initializeCart = async () => {
    console.log("🛒 Initializing cart for user:", user?.id || "guest");
    setIsLoading(true);
    try {
      if (user?.id) {
        await fetchCartFromDatabase();
      } else {
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error("❌ Error initializing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartFromDatabase = async () => {
    try {
      const authData = getUserData();
      const currentUser = user || authData?.userData;

      if (!authData || !authData.token || !currentUser?.id) {
        console.error("❌ No auth data available for cart fetch");
        return;
      }

      console.log("🛒 Fetching cart from database - User ID:", currentUser.id);

      // Use the simplified route
      const data = await apiCall(GET_CART_ITEMS(currentUser.id), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      console.log("🛒 Fetch response data:", data);
      if (data.success) {
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error("❌ Error fetching cart from database:", error);
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const cartItems = getGuestCart();
      console.log("🛒 Loading guest cart from localStorage:", cartItems.length > 0 ? "found" : "empty");
      setCartItems(cartItems);
    } catch (error) {
      console.error("❌ Error loading cart from localStorage:", error);
      setCartItems([]);
    }
  };

  const calculateCartTotals = () => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => {
      const price = item.sizeVariant?.price || item.product?.discountedPrice || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    setCartCount(count);
    setCartTotal(total);
  };

  // UPDATED: Enhanced addToCart to support both sized and regular products
  const addToCart = async (product, sizeVariant = null, quantity = 1) => {
    if (!product) {
      throw new Error("Product is required");
    }

    // Check if product has sizes and require sizeVariant
    const hasSizes = product.productSizes && product.productSizes.length > 0;
    if (hasSizes && !sizeVariant) {
      throw new Error("Size selection is required for this product");
    }

    console.log("🛒 === ADD TO CART DEBUG ===");
    console.log("🛒 Current user state:", user);
    console.log("🛒 Product:", product.id, product.name);
    console.log("🛒 Has sizes:", hasSizes);
    console.log("🛒 Size variant:", sizeVariant);
    console.log("🛒 Quantity:", quantity);

    if (user?.id) {
      console.log("🛒 Adding to database cart for logged-in user");
      return await addToCartDatabase(product, sizeVariant, quantity);
    } else {
      console.log("🛒 Adding to localStorage cart for guest user");
      return addToCartLocalStorage(product, sizeVariant, quantity);
    }
  };

  const addToCartDatabase = async (product, sizeVariant, quantity) => {
    setIsLoading(true);
    try {
      const authData = getUserData();
      if (!authData || !authData.token) {
        throw new Error("No authentication data found");
      }

      if (!user?.id) {
        throw new Error("User ID not found");
      }

      console.log("🛒 === DATABASE ADD DEBUG ===");
      console.log("🛒 User ID:", user.id);
      console.log("🛒 Product ID:", product.id);
      console.log("🛒 Size ID:", sizeVariant?.sizeId || null);

      const requestBody = {
        userId: user.id,
        productId: product.id,
        sizeId: sizeVariant?.sizeId || null, // Can be null for regular products
        quantity: quantity,
        price: sizeVariant?.price || product.discountedPrice || product.price,
      };

      console.log("🛒 Request body:", requestBody);

      // Use the simplified route
      const data = await apiCall(ADD_TO_CART, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🛒 Add to cart response:", data);

      if (data.success) {
        console.log("✅ Item added successfully, refreshing cart");
        await fetchCartFromDatabase();
        return data;
      } else {
        throw new Error(data.message || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("❌ Add to cart database error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Business logic for adding to guest cart
  const addToCartLocalStorage = (product, sizeVariant, quantity) => {
    try {
      console.log("🛒 Adding to localStorage cart");
      const cartItems = getGuestCart();

      // Create unique identifier for cart item
      const existingItemIndex = cartItems.findIndex(
        (item) => {
          if (sizeVariant) {
            return item.product.id === product.id && item.sizeVariant?.sizeId === sizeVariant.sizeId;
          } else {
            return item.product.id === product.id && !item.sizeVariant;
          }
        }
      );

      // Check inventory
      const availableInventory = sizeVariant ? sizeVariant.inventory : product.inventory;

      if (existingItemIndex > -1) {
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > availableInventory) {
          throw new Error(`Only ${availableInventory} items available`);
        }

        cartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        console.log("🛒 Updated existing item, new quantity:", newQuantity);
      } else {
        if (quantity > availableInventory) {
          throw new Error(`Only ${availableInventory} items available`);
        }

        const cartItem = {
          id: `guest_${Date.now()}_${Math.random()}`,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            discountedPrice: product.discountedPrice,
            sku: product.sku,
            images: product.images || [],
            category: product.category || null,
            inventory: product.inventory, // Include base inventory
            // Keep old image field for backward compatibility
            image: product.image || (product.images && product.images.length > 0
                ? (product.images.find((img) => img.isPrimary) || product.images[0]).url
                : null),
          },
          sizeVariant: sizeVariant ? {
            sizeId: sizeVariant.sizeId,
            price: sizeVariant.price,
            inventory: sizeVariant.inventory,
            size: sizeVariant.size,
          } : null,
          quantity: quantity,
        };

        cartItems.push(cartItem);
        console.log("🛒 Added new item to guest cart:", cartItem);
      }

      setCartItems(cartItems);
      saveGuestCart(cartItems);

      return { success: true, message: "Item added to cart successfully" };
    } catch (error) {
      console.error("❌ Add to localStorage error:", error);
      throw error;
    }
  };

  // Updated other methods to handle both sized and regular products
  const updateCartItem = async (itemId, quantity) => {
    if (user?.id) {
      return await updateCartItemDatabase(itemId, quantity);
    } else {
      return updateCartItemLocalStorage(itemId, quantity);
    }
  };

  const updateCartItemDatabase = async (itemId, quantity) => {
    setIsLoading(true);
    try {
      const authData = getUserData();
      
      // Use the simplified route
      const data = await apiCall(UPDATE_CART_ITEM(itemId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (data.success) {
        await fetchCartFromDatabase();
        return data;
      } else {
        throw new Error(data.message || "Failed to update cart item");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Business logic for updating guest cart item
  const updateCartItemLocalStorage = (itemId, quantity) => {
    try {
      const cartItems = getGuestCart();
      const newCartItems = cartItems.map((item) => {
        if (item.id === itemId) {
          const availableInventory = item.sizeVariant 
            ? item.sizeVariant.inventory 
            : item.product.inventory;

          if (quantity > availableInventory) {
            throw new Error(`Only ${availableInventory} items available`);
          }
          return { ...item, quantity };
        }
        return item;
      });

      setCartItems(newCartItems);
      saveGuestCart(newCartItems);

      return { success: true, message: "Cart item updated successfully" };
    } catch (error) {
      throw error;
    }
  };

  const removeCartItem = async (itemId) => {
    if (user?.id) {
      return await removeCartItemDatabase(itemId);
    } else {
      return removeCartItemLocalStorage(itemId);
    }
  };

  const removeCartItemDatabase = async (itemId) => {
    setIsLoading(true);
    try {
      const authData = getUserData();
      
      // Use the simplified route
      const data = await apiCall(REMOVE_CART_ITEM(itemId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      if (data.success) {
        await fetchCartFromDatabase();
        return data;
      } else {
        throw new Error(data.message || "Failed to remove cart item");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Business logic for removing guest cart item
  const removeCartItemLocalStorage = (itemId) => {
    try {
      const cartItems = getGuestCart();
      const newCartItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(newCartItems);
      saveGuestCart(newCartItems);

      return { success: true, message: "Item removed from cart successfully" };
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (user?.id) {
      return await clearCartDatabase();
    } else {
      return clearCartLocalStorage();
    }
  };

  const clearCartDatabase = async () => {
    setIsLoading(true);
    try {
      const authData = getUserData();
      
      // Use the simplified route
      const data = await apiCall(CLEAR_CART, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (data.success) {
        setCartItems([]);
        return data;
      } else {
        throw new Error(data.message || "Failed to clear cart");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Business logic for clearing guest cart
  const clearCartLocalStorage = () => {
    try {
      setCartItems([]);
      clearGuestCart();
      return { success: true, message: "Cart cleared successfully" };
    } catch (error) {
      throw error;
    }
  };

  // Updated handleUserChange with better cart merging
  const handleUserChange = async (newUser, shouldMergeCart = false) => {
    console.log("🔍 === CART MERGE DEBUG START ===");
    console.log("🔍 New user:", newUser);
    console.log("🔍 Should merge cart:", shouldMergeCart);

    if (shouldMergeCart && newUser?.id) {
      console.log("🔍 Starting merge process...");

      const guestCartItems = getGuestCart();

      if (guestCartItems.length > 0) {
        console.log("🔍 Found guest items to merge, processing...");
        setIsLoading(true);

        try {
          const itemsToAdd = guestCartItems.map((item) => {
            console.log("🔍 Processing guest item:", item);
            return {
              productId: item.product.id,
              sizeId: item.sizeVariant?.sizeId || null,
              quantity: item.quantity,
              price: item.sizeVariant?.price || item.product.discountedPrice || item.product.price,
            };
          });

          console.log("🔍 Items to add to database:", itemsToAdd);

          const authData = getUserData();
          const requestBody = {
            userId: newUser.id,
            items: itemsToAdd,
          };

          // Use the simplified route
          const data = await apiCall(BATCH_ADD_TO_CART, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authData.token}`,
            },
            body: JSON.stringify(requestBody),
          });

          console.log("🔍 Batch add response data:", data);

          if (data.success) {
            console.log("🔍 ✅ Merge successful, clearing guest cart...");
            clearGuestCart();
            
            setUser(newUser);
            setCartItems([]);
            await fetchCartFromDatabase();

            console.log("🔍 ✅ Cart updated in UI");
          } else {
            console.log("🔍 ❌ Merge failed:", data.message);
          }
        } catch (error) {
          console.error("🔍 ❌ Error merging guest cart:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("🔍 No guest items to merge");
        setUser(newUser);
        await fetchCartFromDatabase();
      }
    } else {
      console.log("🔍 Merge not needed, just updating user and fetching cart");
      if (newUser?.id) {
        setUser(newUser);
        await fetchCartFromDatabase();
      }
    }

    console.log("🔍 === CART MERGE DEBUG END ===");
  };

  const handleUserLogout = () => {
    console.log("🛒 Handling user logout");
    setUser(null);
    setLastUserCheck(null);
    setCartItems([]);
    loadCartFromLocalStorage();
  };

  const triggerAuthChange = () => {
    window.dispatchEvent(new CustomEvent("authChange"));
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    user,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart: user?.id ? fetchCartFromDatabase : loadCartFromLocalStorage,
    triggerAuthChange,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};