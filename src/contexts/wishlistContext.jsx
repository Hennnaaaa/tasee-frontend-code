// contexts/WishlistContext.jsx (Fixed for hydration)

'use client';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getUserData } from '@/utils/auth';

// Local storage key
const WISHLIST_STORAGE_KEY = 'tasee_wishlist';

// Helper functions for localStorage
const getWishlistFromStorage = (userId) => {
  try {
    if (typeof window === 'undefined') return [];
    const allWishlists = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
    return allWishlists[userId] || [];
  } catch (error) {
    console.error('Error reading wishlist from localStorage:', error);
    return [];
  }
};

const saveWishlistToStorage = (userId, wishlist) => {
  try {
    if (typeof window === 'undefined') return;
    const allWishlists = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
    allWishlists[userId] = wishlist;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(allWishlists));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

const clearWishlistFromStorage = (userId) => {
  try {
    if (typeof window === 'undefined') return;
    const allWishlists = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '{}');
    delete allWishlists[userId];
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(allWishlists));
  } catch (error) {
    console.error('Error clearing wishlist from localStorage:', error);
  }
};

// Helper function to create wishlist item
const createWishlistItem = (productId, sizeId = null, productData = null) => {
  return {
    id: `${productId}-${sizeId || 'no-size'}-${Date.now()}`,
    productId,
    sizeId,
    addedAt: new Date().toISOString(),
    productData: productData || null
  };
};

// Helper function to create wishlist key for matching
const createWishlistKey = (productId, sizeId = null) => {
  return sizeId ? `${productId}-${sizeId}` : productId;
};

// Get current user data from localStorage (with client-side check)
const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      token: null
    };
  }
  
  try {
    const authData = getUserData();
    return {
      user: authData?.userData || null,
      isAuthenticated: !!(authData?.token),
      token: authData?.token || null
    };
  } catch (error) {
    return {
      user: null,
      isAuthenticated: false,
      token: null
    };
  }
};

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
  wishlistStatus: {}
};

// Action types
const WISHLIST_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WISHLIST: 'SET_WISHLIST',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  SET_WISHLIST_STATUS: 'SET_WISHLIST_STATUS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function wishlistReducer(state, action) {
  switch (action.type) {
    case WISHLIST_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case WISHLIST_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case WISHLIST_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case WISHLIST_ACTIONS.SET_WISHLIST:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };

    case WISHLIST_ACTIONS.ADD_ITEM:
      return {
        ...state,
        items: [action.payload, ...state.items]
      };

    case WISHLIST_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.productId === action.payload.productId && 
            item.sizeId === action.payload.sizeId)
        )
      };

    case WISHLIST_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        items: []
      };

    case WISHLIST_ACTIONS.SET_WISHLIST_STATUS:
      return {
        ...state,
        wishlistStatus: {
          ...state.wishlistStatus,
          [action.payload.key]: action.payload.status
        }
      };

    default:
      return state;
  }
}

// Create context
const WishlistContext = createContext();

// Provider component
export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { toast } = useToast();
  
  // CRITICAL: Add client-side hydration protection
  const [isClient, setIsClient] = useState(false);
  
  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load wishlist when component mounts and when localStorage changes
  useEffect(() => {
    if (isClient) {
      loadWishlistFromStorage();
      
      // Listen for storage changes (if user logs in/out in another tab)
      const handleStorageChange = (e) => {
        if (e.key === 'token' || e.key === 'user') {
          loadWishlistFromStorage();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isClient]);

  // Load wishlist from localStorage
  const loadWishlistFromStorage = () => {
    if (!isClient) return;
    
    const { user, isAuthenticated } = getCurrentUser();
    
    if (isAuthenticated && user?.id) {
      try {
        dispatch({ type: WISHLIST_ACTIONS.SET_LOADING, payload: true });
        
        const wishlistItems = getWishlistFromStorage(user.id);
        dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: wishlistItems });

        // Update wishlist status cache
        wishlistItems.forEach(item => {
          const key = createWishlistKey(item.productId, item.sizeId);
          dispatch({
            type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
            payload: { key, status: true }
          });
        });

      } catch (error) {
        console.error('Error loading wishlist from storage:', error);
        dispatch({ type: WISHLIST_ACTIONS.SET_ERROR, payload: 'Failed to load wishlist' });
      }
    } else {
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS, payload: { key: 'clear_all', status: {} } });
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId, sizeId = null, productData = null) => {
    if (!isClient) return false;
    
    const { user, isAuthenticated } = getCurrentUser();
    
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if item already exists
      const existingItem = state.items.find(item => 
        item.productId === productId && item.sizeId === sizeId
      );

      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: "This item is already in your wishlist",
          variant: "default",
        });
        return false;
      }

      // Create new wishlist item
      const newItem = createWishlistItem(productId, sizeId, productData);
      
      // Update state
      dispatch({ type: WISHLIST_ACTIONS.ADD_ITEM, payload: newItem });
      
      // Save to localStorage
      const updatedItems = [newItem, ...state.items];
      saveWishlistToStorage(user.id, updatedItems);
      
      // Update status cache
      const key = createWishlistKey(productId, sizeId);
      dispatch({
        type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
        payload: { key, status: true }
      });
      
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
      });
      return true;

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId, sizeId = null) => {
    if (!isClient) return false;
    
    const { user, isAuthenticated } = getCurrentUser();
    
    if (!isAuthenticated || !user?.id) return false;

    try {
      // Update state
      dispatch({ 
        type: WISHLIST_ACTIONS.REMOVE_ITEM, 
        payload: { productId, sizeId } 
      });
      
      // Update localStorage
      const updatedItems = state.items.filter(item => 
        !(item.productId === productId && item.sizeId === sizeId)
      );
      saveWishlistToStorage(user.id, updatedItems);
      
      // Update status cache
      const key = createWishlistKey(productId, sizeId);
      dispatch({
        type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
        payload: { key, status: false }
      });
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
      return true;

    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle item in wishlist
  const toggleWishlist = async (productId, sizeId = null, productData = null) => {
    if (!isClient) return { success: false, error: 'Not initialized' };
    
    const { user, isAuthenticated } = getCurrentUser();
    
    console.log('toggleWishlist called with:', { productId, sizeId, productData });
    console.log('Auth status:', { user, isAuthenticated });
    
    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your wishlist",
        variant: "destructive",
      });
      return { success: false, error: 'Authentication required' };
    }

    try {
      const existingItem = state.items.find(item => 
        item.productId === productId && item.sizeId === sizeId
      );

      if (existingItem) {
        // Remove from wishlist
        await removeFromWishlist(productId, sizeId);
        return { success: true, action: 'removed', inWishlist: false };
      } else {
        // Add to wishlist
        const success = await addToWishlist(productId, sizeId, productData);
        return { 
          success, 
          action: success ? 'added' : 'failed', 
          inWishlist: success 
        };
      }

    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  // Check if product is in wishlist
  const checkWishlistStatus = (productId, sizeId = null) => {
    if (!isClient) return false;
    
    const key = createWishlistKey(productId, sizeId);
    
    // Return cached status if available
    if (state.wishlistStatus.hasOwnProperty(key)) {
      return state.wishlistStatus[key];
    }

    const { user, isAuthenticated } = getCurrentUser();
    
    if (!isAuthenticated || !user?.id) {
      return false;
    }

    // Check in current items
    const inWishlist = state.items.some(item => 
      item.productId === productId && item.sizeId === sizeId
    );

    // Cache the status
    dispatch({
      type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
      payload: { key, status: inWishlist }
    });

    return inWishlist;
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isClient) return false;
    
    const { user, isAuthenticated } = getCurrentUser();
    
    if (!isAuthenticated || !user?.id) return false;

    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return false;
    }

    try {
      const itemCount = state.items.length;
      
      // Clear state
      dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST });
      
      // Clear localStorage
      clearWishlistFromStorage(user.id);
      
      // Clear status cache
      dispatch({
        type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
        payload: { key: 'clear_all', status: {} }
      });
      
      toast({
        title: "Wishlist cleared",
        description: `${itemCount} items removed from wishlist`,
      });
      return true;

    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove multiple items
  const removeMultipleItems = async (itemIds) => {
    if (!isClient) return false;
    
    const { user, isAuthenticated } = getCurrentUser();
    
    if (!isAuthenticated || !user?.id) return false;

    try {
      const itemsToRemove = state.items.filter(item => itemIds.includes(item.id));
      
      // Update state
      const updatedItems = state.items.filter(item => !itemIds.includes(item.id));
      dispatch({ type: WISHLIST_ACTIONS.SET_WISHLIST, payload: updatedItems });
      
      // Update localStorage
      saveWishlistToStorage(user.id, updatedItems);
      
      // Update status cache
      itemsToRemove.forEach(item => {
        const key = createWishlistKey(item.productId, item.sizeId);
        dispatch({
          type: WISHLIST_ACTIONS.SET_WISHLIST_STATUS,
          payload: { key, status: false }
        });
      });
      
      toast({
        title: "Items removed",
        description: `${itemsToRemove.length} items removed from wishlist`,
      });
      return true;

    } catch (error) {
      console.error('Error removing multiple items:', error);
      toast({
        title: "Error",
        description: "Failed to remove items from wishlist",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get cached wishlist status for a product
  const isInWishlist = (productId, sizeId = null) => {
    if (!isClient) return false;
    
    const key = createWishlistKey(productId, sizeId);
    return state.wishlistStatus[key] || false;
  };

  // Get wishlist items with filtering and sorting
  const getFilteredItems = (searchTerm = '', sortBy = 'addedAt', sortOrder = 'desc') => {
    let filteredItems = [...state.items];

    // Apply search filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.productData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productData?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'addedAt':
          aValue = new Date(a.addedAt);
          bValue = new Date(b.addedAt);
          break;
        case 'name':
          aValue = a.productData?.name || '';
          bValue = b.productData?.name || '';
          break;
        case 'price':
          aValue = a.productData?.price || 0;
          bValue = b.productData?.price || 0;
          break;
        default:
          aValue = new Date(a.addedAt);
          bValue = new Date(b.addedAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredItems;
  };

  // Get wishlist summary
  const getWishlistSummary = () => {
    const activeItemsCount = state.items.length;
    let totalValue = 0;
    let totalSavings = 0;
    let availableItemsCount = 0;

    state.items.forEach(item => {
      if (item.productData) {
        const price = item.productData.discountedPrice || item.productData.price || 0;
        const originalPrice = item.productData.price || 0;
        
        totalValue += price;
        
        if (item.productData.discountedPrice && item.productData.discountedPrice < originalPrice) {
          totalSavings += (originalPrice - item.productData.discountedPrice);
        }
        
        if (item.productData.isActive && item.productData.inventory > 0) {
          availableItemsCount++;
        }
      }
    });

    return {
      activeItemsCount,
      totalValue: parseFloat(totalValue),
      totalSavings: parseFloat(totalSavings),
      availableItemsCount,
      unavailableItemsCount: activeItemsCount - availableItemsCount
    };
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR });
  };

  // CRITICAL: Provide different values based on client-side state
  const contextValue = isClient ? {
    // State
    ...state,
    
    // Actions
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    checkWishlistStatus,
    clearWishlist,
    removeMultipleItems,
    isInWishlist,
    clearError,
    getFilteredItems,
    
    // Computed values
    isEmpty: state.items.length === 0,
    itemCount: state.items.length,
    summary: getWishlistSummary()
  } : {
    // SSR-safe default values
    items: [],
    loading: false,
    error: null,
    wishlistStatus: {},
    addToWishlist: async () => false,
    removeFromWishlist: async () => false,
    toggleWishlist: async () => ({ success: false }),
    checkWishlistStatus: () => false,
    clearWishlist: async () => false,
    removeMultipleItems: async () => false,
    isInWishlist: () => false,
    clearError: () => {},
    getFilteredItems: () => [],
    isEmpty: true,
    itemCount: 0,
    summary: {
      activeItemsCount: 0,
      totalValue: 0,
      totalSavings: 0,
      availableItemsCount: 0,
      unavailableItemsCount: 0
    }
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook to use wishlist context
export function useWishlist() {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
}

export default WishlistContext;