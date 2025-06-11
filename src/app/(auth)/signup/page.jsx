// src/app/(auth)/signup/page.jsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    
    if (result.success) {
      router.push('/verify-otp');
    } else {
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
        
      <div className="w-full max-w-lg relative z-10">
        <div className="backdrop-blur-xl bg-black/5 border border-black/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo placeholder */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {/* Replace with your PNG logo */}
              <img 
                src="/tasee_30x.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            
            </div>
            <h1 className="text-4xl font-light text-black mb-2 tracking-wide">
              Create account
            </h1>
            <p className="text-gray-600 font-light">Begin your premium experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="border border-red-200 bg-red-50 text-red-600 p-4 rounded-xl text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                  First name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
                />
              </div>

              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                  Last name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
              />
            </div>

            <div className="group">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                Phone number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
              />
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
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

            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black/20 transition-all duration-300 group-hover:border-gray-400"
              />
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
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create account
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
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-black hover:text-gray-700 transition-colors duration-200 font-normal underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}