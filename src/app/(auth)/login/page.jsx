// src/app/(auth)/login/page.jsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
        
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-black/5 border border-black/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo placeholder */}
          <div className="text-center mb-12">
            <div className="w-28 h-24 mx-auto mb-6 flex items-center justify-center">
              {/* Replace with your PNG logo */}
              <img 
                src="/tasee_30x.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
             
            </div>
            <h1 className="text-4xl font-light text-black mb-2 tracking-wide">
              Welcome back
            </h1>
            <p className="text-gray-600 font-light">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-200 bg-red-50 text-red-600 p-4 rounded-xl text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
                />
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-4 pr-12 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-black transition-colors duration-200 font-light"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] mt-8
                ${loading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <div className="text-center pt-8">
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-gray-500 text-sm font-light px-4">or</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <p className="text-gray-600 font-light">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-black hover:text-gray-700 transition-colors duration-200 font-normal underline underline-offset-4"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}