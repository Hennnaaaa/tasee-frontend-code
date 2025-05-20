// src/contexts/AuthContext.jsx
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

  // Check for existing token and user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Get user data from token or fetch from API
          const userData = JSON.parse(localStorage.getItem('user') || 'null');
          if (userData) {
            setUser(userData);
          } else {
            // If we have token but no user data, clear invalid state
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted data
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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/customer/create`;
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
      
      // First check if response is ok
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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/customer/verify-OTP`;
      console.log('Verify OTP URL:', url);
      console.log('OTP data:', { email, otp });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      console.log('OTP response status:', response.status);
      
      // Check content type
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

  // Updated login function that handles both customer and admin roles
  const loginWithRole = async (email, password, expectedRole = null) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/customer/login`;
      console.log('Login URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Login error response:', text);
        return { success: false, error: `Server error: ${response.status}` };
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success && data.data) {
        // Check if the user has the expected role (if specified)
        if (expectedRole && data.data.user.role !== expectedRole) {
          return { 
            success: false, 
            error: `Access denied. You don't have ${expectedRole} privileges.` 
          };
        }
        
        // Save token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        
        // Redirect based on role - always redirect admins to admin dashboard
        if (data.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/home');
        }
        
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // The standard login function - will redirect based on role
  // This means admins will always go to the admin dashboard regardless of which login page they use
  const login = async (email, password) => {
    return loginWithRole(email, password, null); // No role enforcement, will redirect based on actual role
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/home');
  };

  // New helper function to check if the user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // New function to check if the current user is an admin
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