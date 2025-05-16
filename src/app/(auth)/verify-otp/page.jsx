// src/app/(auth)/verify-otp/page.jsx
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authcontext';
import { useRouter } from 'next/navigation';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP, pendingEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!pendingEmail) {
      router.push('/signup');
    }
  }, [pendingEmail, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    
    setLoading(true);

    const result = await verifyOTP(pendingEmail, otp);
    
    if (!result.success) {
      setError(result.error || 'OTP verification failed');
    }
    setLoading(false);
  };

  if (!pendingEmail) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-2xl font-bold">Verify OTP</h2>
        <p className="text-center text-gray-600">Enter the OTP sent to {pendingEmail}</p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            required
            maxLength="6"
            pattern="[0-9]{6}"
            className="w-full px-3 py-2 border rounded text-center text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
          />
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}