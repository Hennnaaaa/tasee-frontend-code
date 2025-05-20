// src/contexts/AuthContext.jsx
"use client"

import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const router = useRouter();

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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/verify-OTP`;
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

  const login = async (email, password) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/login`;
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
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        router.push('/home');
        return { success: true };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/home');
  };

  return (
    <AuthContext.Provider value={{
      user,
      pendingEmail,
      signup,
      verifyOTP,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};