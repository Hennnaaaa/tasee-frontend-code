// src/contexts/AddressContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserData } from '@/utils/auth';
import {
  CREATE_ADDRESS,
  GET_USER_ADDRESSES,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_ADDRESS
} from '@/utils/routes/addressRoutes';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [lastUserCheck, setLastUserCheck] = useState(null);

  // Check for user data changes (similar to your cart context)
  useEffect(() => {
    const checkUserData = () => {
      const authData = getUserData();
      const userString = authData ? JSON.stringify(authData.userData) : null;

      if (userString !== lastUserCheck) {
        console.log('📍 User data changed, updating addresses...');
        
        if (authData && authData.userData) {
          setUser(authData.userData);
          console.log('📍 User set:', authData.userData);
        } else {
          setUser(null);
          console.log('📍 No user found, clearing addresses');
          setAddresses([]);
        }
        
        setLastUserCheck(userString);
      }
    };

    // Initial check
    checkUserData();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('📍 Storage changed, rechecking user data');
        checkUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for auth changes
    const handleAuthChange = () => {
      console.log('📍 Auth change event received');
      checkUserData();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [lastUserCheck]);

  // Fetch addresses when user changes
  useEffect(() => {
    if (user?.id) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

  // API helper function
  const makeApiRequest = async (url, options = {}) => {
    const authData = getUserData();
    
    if (!authData || !authData.token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  };

  // Fetch all addresses for the current user
  const fetchAddresses = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('📍 Fetching addresses for user:', user.id);
      
      const data = await makeApiRequest(GET_USER_ADDRESSES(user.id));
      
      if (data.success) {
        console.log('📍 ✅ Fetched addresses:', data.data.length);
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new address
  const createAddress = async (addressData) => {
    if (!user?.id) {
      throw new Error('User must be logged in to create addresses');
    }

    setIsLoading(true);
    try {
      console.log('📍 Creating address for user:', user.id);
      
      const data = await makeApiRequest(CREATE_ADDRESS, {
        method: 'POST',
        body: JSON.stringify({
          ...addressData,
          userId: user.id,
        }),
      });

      if (data.success) {
        console.log('📍 ✅ Address created successfully');
        // Add new address to the beginning of the list
        setAddresses(prev => [data.data, ...prev]);
        return data.data;
      }
    } catch (error) {
      console.error('❌ Error creating address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing address
  const updateAddress = async (addressId, addressData) => {
    setIsLoading(true);
    try {
      console.log('📍 Updating address:', addressId);
      
      const data = await makeApiRequest(UPDATE_ADDRESS(addressId), {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });

      if (data.success) {
        console.log('📍 ✅ Address updated successfully');
        // Update address in the list
        setAddresses(prev => 
          prev.map(address => 
            address.id === addressId ? data.data : address
          )
        );
        return data.data;
      }
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an address
  const deleteAddress = async (addressId) => {
    setIsLoading(true);
    try {
      console.log('📍 Deleting address:', addressId);
      
      const data = await makeApiRequest(DELETE_ADDRESS(addressId), {
        method: 'DELETE',
      });

      if (data.success) {
        console.log('📍 ✅ Address deleted successfully');
        // Remove address from the list
        setAddresses(prev => prev.filter(address => address.id !== addressId));
      }
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Set an address as default
  const setDefaultAddress = async (addressId) => {
    setIsLoading(true);
    try {
      console.log('📍 Setting default address:', addressId);
      
      const data = await makeApiRequest(SET_DEFAULT_ADDRESS(addressId), {
        method: 'PATCH',
      });

      if (data.success) {
        console.log('📍 ✅ Default address updated');
        // Update addresses to reflect new default
        setAddresses(prev => 
          prev.map(address => ({
            ...address,
            isDefault: address.id === addressId
          }))
        );
      }
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get default address
  const getDefaultAddress = () => {
    return addresses.find(address => address.isDefault);
  };

  // Get addresses by type (shipping, billing, both)
  const getAddressesByType = (type) => {
    return addresses.filter(address => 
      address.type === type || address.type === 'both'
    );
  };

  // Get shipping addresses
  const getShippingAddresses = () => {
    return getAddressesByType('shipping');
  };

  // Get billing addresses
  const getBillingAddresses = () => {
    return getAddressesByType('billing');
  };

  const value = {
    addresses,
    isLoading,
    user,
    defaultAddress: getDefaultAddress(),
    shippingAddresses: getShippingAddresses(),
    billingAddresses: getBillingAddresses(),
    
    // Methods
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressesByType,
    getShippingAddresses,
    getBillingAddresses,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};