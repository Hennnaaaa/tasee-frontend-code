// src/contexts/cartContext.js - Updated with size support
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserData } from "@/utils/auth";

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

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/items?userId=${currentUser.id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🛒 Fetch response data:", data);
        if (data.success) {
          setCartItems(data.data.items || []);
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Fetch cart error:", errorData);
      }
    } catch (error) {
      console.error("❌ Error fetching cart from database:", error);
    }
  };

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem("guestCart");
      console.log("🛒 Loading guest cart from localStorage:", savedCart ? "found" : "empty");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("❌ Error loading cart from localStorage:", error);
      setCartItems([]);
    }
  };

  const saveCartToLocalStorage = (items) => {
    try {
      localStorage.setItem("guestCart", JSON.stringify(items));
      console.log("🛒 Saved guest cart to localStorage:", items.length, "items");
    } catch (error) {
      console.error("❌ Error saving cart to localStorage:", error);
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

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("🛒 Add to cart response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add item to cart");
      }

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

  const addToCartLocalStorage = (product, sizeVariant, quantity) => {
    try {
      console.log("🛒 Adding to localStorage cart");
      const newCartItems = [...cartItems];

      // Create unique identifier for cart item
      const itemIdentifier = sizeVariant 
        ? `${product.id}_${sizeVariant.sizeId}`
        : `${product.id}_no_size`;

      const existingItemIndex = newCartItems.findIndex(
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
        const existingItem = newCartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > availableInventory) {
          throw new Error(`Only ${availableInventory} items available`);
        }

        newCartItems[existingItemIndex] = {
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

        newCartItems.push(cartItem);
        console.log("🛒 Added new item to guest cart:", cartItem);
      }

      setCartItems(newCartItems);
      saveCartToLocalStorage(newCartItems);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/item/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart item");
      }

      const data = await response.json();
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

  const updateCartItemLocalStorage = (itemId, quantity) => {
    try {
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
      saveCartToLocalStorage(newCartItems);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/item/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove cart item");
      }

      const data = await response.json();
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

  const removeCartItemLocalStorage = (itemId) => {
    try {
      const newCartItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(newCartItems);
      saveCartToLocalStorage(newCartItems);

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/clear`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.token}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clear cart");
      }

      const data = await response.json();
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

  const clearCartLocalStorage = () => {
    try {
      setCartItems([]);
      localStorage.removeItem("guestCart");
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

      const guestCartFromStorage = localStorage.getItem("guestCart");
      let guestCartItems = [];

      if (guestCartFromStorage) {
        try {
          guestCartItems = JSON.parse(guestCartFromStorage);
          console.log("🔍 Guest cart items from localStorage:", guestCartItems);
        } catch (e) {
          console.error("🔍 Error parsing guest cart from localStorage:", e);
          return;
        }
      }

      if (guestCartItems.length > 0) {
        console.log("🔍 Found guest items to merge, processing...");
        setIsLoading(true);

        try {
          // Prepare items for batch add - UPDATED to handle both sized and regular products
          const itemsToAdd = guestCartItems.map((item) => {
            console.log("🔍 Processing guest item:", item);
            return {
              productId: item.product.id,
              sizeId: item.sizeVariant?.sizeId || null, // Can be null for regular products
              quantity: item.quantity,
              price: item.sizeVariant?.price || item.product.discountedPrice || item.product.price,
            };
          });

          console.log("🔍 Items to add to database:", itemsToAdd);

          const authData = getUserData();
          const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/batch-add`;

          const requestBody = {
            userId: newUser.id,
            items: itemsToAdd,
          };

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authData.token}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("🔍 Batch add response data:", data);

            if (data.success) {
              console.log("🔍 ✅ Merge successful, clearing guest cart...");
              localStorage.removeItem("guestCart");
              
              setUser(newUser);
              setCartItems([]);
              await fetchCartFromDatabase();

              console.log("🔍 ✅ Cart updated in UI");
            } else {
              console.log("🔍 ❌ Merge failed:", data.message);
            }
          } else {
            const errorData = await response.json();
            console.error("🔍 ❌ Batch add failed:", errorData);
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