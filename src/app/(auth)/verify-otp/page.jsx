// src/app/(auth)/verify-otp/page.jsx
"use client"

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/authcontext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, RefreshCw } from 'lucide-react';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { verifyOTP, pendingEmail, resendOTP } = useAuth();
  const router = useRouter();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pendingEmail) {
      router.push('/signup');
    }
  }, [pendingEmail, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      setOtp([...otp.map((d, idx) => (idx === index ? '' : d))]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);

    const result = await verifyOTP(pendingEmail, otpString);

    if (!result.success) {
      setError(result.error || 'OTP verification failed');
      setOtp(new Array(6).fill(''));
      inputRefs.current[0].focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    
    // Call your resend OTP function here
    const result = await resendOTP(pendingEmail);
    
    if (result.success) {
      setTimer(60);
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
    
    setResendLoading(false);
  };

  if (!pendingEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-black/5 border border-black/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-12">
            {/* Logo placeholder */}
            <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center">
              {/* Replace with your PNG logo */}
              <img 
                src="/tasee_30x.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
              
            </div>
            
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 border border-gray-300 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-black" />
            </div>
            
            <h1 className="text-3xl font-light text-black mb-3 tracking-wide">
              Check your email
            </h1>
            <p className="text-gray-600 font-light mb-2">
              We've sent a 6-digit code to
            </p>
            <p className="text-black font-medium">
              {pendingEmail}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="border border-red-200 bg-red-50 text-red-600 p-4 rounded-xl text-sm backdrop-blur-sm text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <label className="block text-sm font-medium text-gray-700 text-center tracking-wide">
                Enter verification code
              </label>
              
              <div className="flex justify-center gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    name="otp"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-14 text-center text-xl font-medium bg-white border border-gray-300 rounded-xl text-black focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 hover:border-gray-400"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className={`
                w-full py-4 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02]
                ${loading || otp.join('').length !== 6
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Verify & continue
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <div className="text-center pt-6">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-gray-500 text-sm font-light px-4">or</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              {timer > 0 ? (
                <p className="text-gray-600 font-light">
                  Didn't receive the code? Resend in{' '}
                  <span className="text-black font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-black hover:text-gray-700 transition-colors duration-200 font-normal underline underline-offset-4 disabled:text-gray-500 disabled:no-underline flex items-center justify-center gap-2 mx-auto"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend code
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}