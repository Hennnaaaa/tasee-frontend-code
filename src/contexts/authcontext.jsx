// src/contexts/AuthContext.jsx - Updated to work with optimized cart
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // **IMPORTANT: Trigger cart logout**
    if (window.cartLogoutCallback) {
      window.cartLogoutCallback();
    }
    
    // Trigger cart update
    triggerCartUpdate();
    
    router.push('/customer/home');
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const isAdmin = () => {
    return hasRole('admin');
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
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};