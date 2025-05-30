"use client"
 
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
 
const AuthContext = createContext({});
 
export const useAuth = () => useContext(AuthContext);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  // Helper function to trigger cart context update
  const triggerCartUpdate = () => {
    // Dispatch custom event that cart context listens for
    window.dispatchEvent(new CustomEvent('authChange'));
  };
 
  // Enhanced function to clear all user-related localStorage data
  const clearAllUserData = () => {
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
      'recentlyViewed'
    ];
   
    // Remove each key
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🔍 Removing ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
   
    // Optional: Clear any keys that start with 'user_' or 'auth_'
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('auth_')) {
        console.log(`🔍 Removing prefixed key ${key} from localStorage`);
        localStorage.removeItem(key);
      }
    });
   
    console.log('🔍 localStorage cleanup completed');
  };
 
  // Check for existing token and user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || 'null');
          if (userData) {
            setUser(userData);
            // Don't trigger cart merge on initial load
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAllUserData(); // Use enhanced cleanup
      } finally {
        setLoading(false);
      }
    };
 
    checkAuth();
  }, []);
 
  const signup = async (userData) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/create`;
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
        router.push('/verify-otp');
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };
 
  const verifyOTP = async (email, otp) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/verify-OTP`;
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
        router.push('/login');
        return { success: true, message: data.message };
      }
      return { success: false, error: data.message || 'OTP verification failed' };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message };
    }
  };
 
 const loginWithRole = async (email, password, expectedRole = null) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/login`;
   
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
      if (expectedRole && data.data.user.role !== expectedRole) {
        return {
          success: false,
          error: `Access denied. You don't have ${expectedRole} privileges.`
        };
      }
     
      console.log('🔍 === AUTH LOGIN DEBUG ===');
      console.log('🔍 Login successful, user:', data.data.user);
     
      // Check if guest cart exists before login
      const guestCartBeforeLogin = localStorage.getItem('guestCart');
      console.log('🔍 Guest cart before login:', guestCartBeforeLogin);
      const hasGuestCart = guestCartBeforeLogin && JSON.parse(guestCartBeforeLogin).length > 0;
     
      // Save token and user data FIRST
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
     
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
     
      // Redirect based on role (after cart operations)
      setTimeout(() => {
        if (data.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/customer/home');
        }
      }, 500);
     
      return { success: true };
    }
    return { success: false, error: data.message || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};
 
  const login = async (email, password) => {
    return loginWithRole(email, password, null);
  };
 
  // Enhanced logout function with complete cleanup
  const logout = async () => {
    try {
      console.log('🔍 === LOGOUT PROCESS STARTING ===');
     
      // 1. Clear user state immediately
      setUser(null);
      console.log('🔍 User state cleared');
     
      // 2. Call cart logout callback if available
      if (window.cartLogoutCallback) {
        console.log('🔍 Calling cart logout callback...');
        window.cartLogoutCallback();
      }
     
      // 3. Clear all localStorage data
      clearAllUserData();
     
      // 4. Trigger cart update to reflect logout
      triggerCartUpdate();
     
      // 5. Optional: Call logout API endpoint to invalidate server-side token
      try {
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
      } catch (apiError) {
        console.warn('🔍 Server-side logout failed (non-critical):', apiError);
        // Don't throw - this is not critical for client-side logout
      }
     
      // 6. Navigate to home page
      console.log('🔍 Redirecting to home page...');
      router.push('/customer/home');
     
      console.log('🔍 === LOGOUT PROCESS COMPLETED ===');
     
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, ensure basic cleanup
      setUser(null);
      clearAllUserData();
      router.push('/customer/home');
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
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
   
    if (!token || !user) {
      return false;
    }
   
    try {
      // Basic token validation (you might want to add expiry checking)
      const userData = JSON.parse(user);
      return !!userData.id;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };
 
  return (
    <AuthContext.Provider value={{
      user,
      pendingEmail,
      signup,
      verifyOTP,
      login,
      loginWithRole,
      logout,
      isAuthenticated: !!user,
      isAdmin,
      hasRole,
      loading,
      checkTokenValidity,
      clearAllUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};