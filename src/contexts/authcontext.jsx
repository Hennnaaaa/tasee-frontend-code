// src/contexts/AuthContext.jsx - Fixed with resendOTP function added
"use client"
 
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {LOGIN, SIGNUP, VERIFY_OTP, RESEND_OTP} from '@/utils/routes/customerRoutes';

 
const AuthContext = createContext({});
 
export const useAuth = () => useContext(AuthContext);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  // CRITICAL: Add client-side hydration protection
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
 
  // Helper function to trigger cart context update
  const triggerCartUpdate = () => {
    // Dispatch custom event that cart context listens for
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authChange'));
    }
  };

  // Enhanced function to clear all user-related localStorage data
  const clearAllUserData = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Clearing all user data from localStorage...');
    
    // List of all possible keys that should be cleared on logout
    const keysToRemove = [
      'token',
      'user',
      'userCart',
      'cartItems',
      'userProfile',
      'userAddresses',
      'userOrders',
      'lastActivity',
      'authExpiry',
      'refreshToken',
      'userPreferences',
      'recentlyViewed',
      'adminToken' // Add adminToken to cleanup
    ];
    
    // Remove each key
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🔍 Removing ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
    
    // Optional: Clear any keys that start with 'user_' or 'auth_' or 'admin_'
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('auth_') || key.startsWith('admin_')) {
        console.log(`🔍 Removing prefixed key ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
    
    console.log('🔍 localStorage cleanup completed');
  };

  // ⭐ NEW: Function to clear only admin session without affecting cart
  const clearAdminSessionOnly = () => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Clearing admin session only (preserving guest cart)...');
    
    // Only clear auth-related data, preserve cart
    const keysToRemove = [
      'token',
      'user',
      'adminToken',
      'authExpiry',
      'refreshToken'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🔍 Removing ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear user state
    setUser(null);
    
    // ⭐ CRITICAL: Trigger cart context to refresh and handle the user change
    setTimeout(() => {
      triggerCartUpdate();
      
      // Force cart to reinitialize as guest cart
      if (window.cartLogoutCallback) {
        console.log('🔍 Calling cart logout callback to switch to guest mode...');
        window.cartLogoutCallback();
      }
    }, 100);
    
    // Show notification
    setTimeout(() => {
      alert('Admin users cannot access the customer interface. You have been logged out.');
    }, 200);
    
    console.log('🔍 Admin session cleared, switching to guest cart mode');
  };

  // ⭐ Helper function to force refresh user data for cart context
  const refreshUserData = () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Only set user if it's not admin on customer interface
        if (!(parsedUser.role === 'admin' || parsedUser.role === 'ADMIN') || !isCustomerInterface()) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setUser(null);
    }
    
    // Always trigger cart update
    triggerCartUpdate();
  };

  const isCustomerInterface = () => {
    if (typeof window === 'undefined') return false;
    const currentPath = window.location.pathname;
    return !currentPath.startsWith('/admin') && 
           !currentPath.includes('/login') && 
           !currentPath.includes('/signup') &&
           !currentPath.includes('/verify-otp') &&
           !currentPath.includes('/forgot-password');
  };

  // Check for existing token and user data on mount
  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
  }, [isClient]);

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (userData) {
          
          // ⭐ CRITICAL: Check if admin user is on customer interface pages
          if ((userData.role === 'admin' || userData.role === 'ADMIN') && isCustomerInterface()) {
            console.log('🚫 Admin user detected on customer interface. Clearing admin session only...');
            
            // Clear only admin session, preserve guest cart
            clearAdminSessionOnly();
            
            setLoading(false);
            return;
          }
          
          // ⭐ Only set user state if they're on appropriate interface
          if (userData.role === 'admin' || userData.role === 'ADMIN') {
            // Admin user - only set state if on admin pages or auth pages
            if (!isCustomerInterface()) {
              setUser(userData);
            }
          } else {
            // Customer user - can access customer interface
            setUser(userData);
          }
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAllUserData();
    } finally {
      setLoading(false);
    }
  };
 
  const signup = async (userData) => {
    if (!isClient) return { success: false, error: 'Not initialized' };
    
    try {
      const url = SIGNUP;
      console.log('Signup URL:', url);
      console.log('Signup data:', userData);
     
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          email: userData.email,
          password: userData.password,
          phone: userData.phone || '',
          role: 'customer'
        }),
      });
 
      console.log('Signup response status:', response.status);
     
      if (!response.ok) {
        const text = await response.text();
        console.error('Signup error response:', text);
        return { success: false, error: `Server error: ${response.status}` };
      }
 
      const data = await response.json();
      console.log('Signup response data:', data);
     
      if (data.success) {
        setPendingEmail(userData.email);
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify-otp`);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };
 
  const verifyOTP = async (email, otp) => {
    if (!isClient) return { success: false, error: 'Not initialized' };
    
    try {
      const url = VERIFY_OTP;
      console.log('Verify OTP URL:', url);
      console.log('OTP data:', { email, otp });
     
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
 
      console.log('OTP response status:', response.status);
     
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return { success: false, error: 'Server returned invalid response' };
      }
 
      const data = await response.json();
      console.log('Verify OTP response:', data);
     
      if (data.success) {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || 'OTP verification failed' };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ ADD THIS: resendOTP function
  const resendOTP = async (email) => {
    if (!isClient) return { success: false, error: 'Not initialized' };
    
    try {
      const url = RESEND_OTP; // Make sure this is defined in your routes
      console.log('Resend OTP URL:', url);
      console.log('Resending OTP to:', email);
     
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
 
      console.log('Resend OTP response status:', response.status);
     
      if (!response.ok) {
        const text = await response.text();
        console.error('Resend OTP error response:', text);
        return { success: false, error: `Server error: ${response.status}` };
      }

      const data = await response.json();
      console.log('Resend OTP response:', data);
     
      // ✅ CRITICAL: Always return an object with success property
      if (data.success) {
        return { 
          success: true, 
          message: data.message || 'OTP sent successfully'
        };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to resend OTP' 
        };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      // ✅ CRITICAL: Return object even on error
      return { 
        success: false, 
        error: error.message || 'Failed to resend OTP. Please try again.' 
      };
    }
  };
 
  const loginWithRole = async (email, password, expectedRole = null) => {
    if (!isClient) return { success: false, error: 'Not initialized' };
    
    try {
      const url = LOGIN;
     
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
   
      if (!response.ok) {
        const text = await response.text();
        console.error('Login error response:', text);
        return { success: false, error: `Server error: ${response.status}` };
      }
   
      const data = await response.json();
     
      if (data.success && data.data) {
        
        // ⭐ Role-based access control (only if expectedRole is specified)
        if (expectedRole && data.data.user.role !== expectedRole) {
          return {
            success: false,
            error: `Access denied. You don't have ${expectedRole} privileges.`
          };
        }
       
        console.log('🔍 === AUTH LOGIN DEBUG ===');
        console.log('🔍 Login successful, user:', data.data.user);
       
        // Save token and user data FIRST
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
       
        // ⭐ Handle cart operations only for customer users
        if (data.data.user.role === 'customer') {
          // Check if guest cart exists before login
          const guestCartBeforeLogin = localStorage.getItem('guestCart');
          console.log('🔍 Guest cart before login:', guestCartBeforeLogin);
          const hasGuestCart = guestCartBeforeLogin && JSON.parse(guestCartBeforeLogin).length > 0;
          
          console.log('🔍 User state updated, triggering cart operations...');
         
          // Trigger cart operations with proper sequencing
          setTimeout(async () => {
            console.log('🔍 Triggering cart update and merge...');
           
            // Trigger cart context to detect user change
            triggerCartUpdate();
           
            // If there's a guest cart, trigger merge
            if (hasGuestCart && window.cartInitCallback) {
              console.log('🔍 Calling cartInitCallback with merge = true');
              await window.cartInitCallback(data.data.user, true);
            } else if (window.cartInitCallback) {
              console.log('🔍 Calling cartInitCallback without merge');
              await window.cartInitCallback(data.data.user, false);
            }
           
            // Force a cart refresh after a short delay to ensure everything is synced
            setTimeout(() => {
              if (window.forceCartRefresh) {
                console.log('🔍 Force refreshing cart...');
                window.forceCartRefresh();
              }
            }, 200);
           
          }, 300);
        }
       
        // ⭐ Role-based redirection with delay to allow cart operations
        setTimeout(() => {
          if (data.data.user.role === 'admin' || data.data.user.role === 'ADMIN') {
            console.log('🔍 Redirecting admin to dashboard...');
            router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/admin/dashboard`);
          } else {
            console.log('🔍 Redirecting customer to home...');
            router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`);
          }
        }, data.data.user.role === 'customer' ? 500 : 100); // Longer delay for customers due to cart operations
       
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };
 
  // ⭐ Updated login function - no role restriction for shared login page
  const login = async (email, password) => {
    return loginWithRole(email, password, null); // Allow any role
  };

  // Enhanced logout function with complete cleanup
  const logout = async () => {
    try {
      console.log('🔍 === LOGOUT PROCESS STARTING ===');
      
      const currentUser = user; // Store current user for role-specific cleanup
      
      // 1. Clear user state immediately
      setUser(null);
      console.log('🔍 User state cleared');
      
      // 2. Call cart logout callback if available (only for customer users)
      if (typeof window !== 'undefined' && window.cartLogoutCallback && currentUser?.role === 'customer') {
        console.log('🔍 Calling cart logout callback...');
        window.cartLogoutCallback();
      }
      
      // 3. Clear all localStorage data
      clearAllUserData();
      
      // 4. Trigger cart update to reflect logout (only for customer users)
      if (currentUser?.role === 'customer') {
        triggerCartUpdate();
      }
      
      // 5. Optional: Call logout API endpoint to invalidate server-side token
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            const logoutUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/logout`;
            await fetch(logoutUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            console.log('🔍 Server-side logout completed');
          }
        }
      } catch (apiError) {
        console.warn('🔍 Server-side logout failed (non-critical):', apiError);
        // Don't throw - this is not critical for client-side logout
      }
      
      // 6. Navigate based on user role - UPDATED for customer home preservation
      console.log('🔍 Redirecting after logout...');
      if (currentUser?.role === 'admin' || currentUser?.role === 'ADMIN') {
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`); // Redirect admin to login page
      } else {
        // ⭐ Keep customer on /customer/home after logout
        router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/customer/home`); 
      }
      
      console.log('🔍 === LOGOUT PROCESS COMPLETED ===');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, ensure basic cleanup
      setUser(null);
      clearAllUserData();
      router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`); // Fallback to main login page
    }
  };
 
  const hasRole = (role) => {
    return user && user.role === role;
  };
 
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Helper function to check if user session is still valid
  const checkTokenValidity = () => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return false;
    }
    
    try {
      const userData = JSON.parse(userStr);
      
      // ⭐ Additional check: Admin users should not have valid tokens on customer interface
      if ((userData.role === 'admin' || userData.role === 'ADMIN') && isCustomerInterface()) {
        console.log('🚫 Admin token detected on customer interface during validity check');
        return false;
      }
      
      return !!userData.id;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // ⭐ Function to handle role-based interface access
  const checkInterfaceAccess = () => {
    if (!isClient || !user) return true;
    
    // ONLY check admin users, don't interfere with guest or customer users
    if ((user.role === 'admin' || user.role === 'ADMIN') && isCustomerInterface()) {
      console.log('🚫 Admin user trying to access customer interface. Logging out admin only...');
      
      // Clear admin session WITHOUT affecting cart functionality
      clearAdminSessionOnly();
      
      return false;
    }
    
    return true;
  };

  // ⭐ Run interface access check ONLY when user changes and ONLY for admin users
  useEffect(() => {
    if (isClient && user && (user.role === 'admin' || user.role === 'ADMIN')) {
      checkInterfaceAccess();
    }
  }, [user, isClient]);

  // CRITICAL: Provide different values based on client-side state
  const contextValue = isClient ? {
    user,
    pendingEmail,
    signup,
    verifyOTP,
    resendOTP, // ✅ ADD THIS to context value
    login,
    loginWithRole,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    hasRole,
    loading,
    checkTokenValidity,
    clearAllUserData,
    clearAdminSessionOnly,
    checkInterfaceAccess
  } : {
    // SSR-safe default values
    user: null,
    pendingEmail: '',
    signup: async () => ({ success: false, error: 'Not initialized' }),
    verifyOTP: async () => ({ success: false, error: 'Not initialized' }),
    resendOTP: async () => ({ success: false, error: 'Not initialized' }), // ✅ ADD THIS
    login: async () => ({ success: false, error: 'Not initialized' }),
    loginWithRole: async () => ({ success: false, error: 'Not initialized' }),
    logout: async () => {},
    isAuthenticated: false,
    isAdmin: () => false,
    hasRole: () => false,
    loading: true,
    checkTokenValidity: () => false,
    clearAllUserData: () => {},
    clearAdminSessionOnly: () => {},
    checkInterfaceAccess: () => true
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};