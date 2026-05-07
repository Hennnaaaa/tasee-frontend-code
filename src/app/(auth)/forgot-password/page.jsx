'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import {
  FORGOT_PASSWORD,
  VERIFY_RESET_OTP,
  RESET_PASSWORD,
} from '@/utils/routes/customerRoutes';

const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, DONE: 4 };

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address'); return; }

    setLoading(true);
    try {
      const res = await fetch(FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(STEPS.OTP);
        startResendCooldown();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        startResendCooldown();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res = await fetch(VERIFY_RESET_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(STEPS.NEW_PASSWORD);
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await fetch(RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(STEPS.DONE);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-black/5 border border-black/10 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-28 h-24 mx-auto mb-6 flex items-center justify-center">
              <img src="/tasee_30x.png" alt="Tasee" className="w-full h-full object-contain" />
            </div>

            {/* Step titles */}
            {step === STEPS.EMAIL && (
              <>
                <h1 className="text-3xl font-light text-black mb-2 tracking-wide">Forgot Password</h1>
                <p className="text-gray-500 font-light text-sm">Enter your email and we'll send you an OTP</p>
              </>
            )}
            {step === STEPS.OTP && (
              <>
                <h1 className="text-3xl font-light text-black mb-2 tracking-wide">Enter OTP</h1>
                <p className="text-gray-500 font-light text-sm">
                  We sent a 6-digit code to <span className="font-medium text-black">{email}</span>
                </p>
              </>
            )}
            {step === STEPS.NEW_PASSWORD && (
              <>
                <h1 className="text-3xl font-light text-black mb-2 tracking-wide">New Password</h1>
                <p className="text-gray-500 font-light text-sm">Choose a strong new password</p>
              </>
            )}
            {step === STEPS.DONE && (
              <>
                <h1 className="text-3xl font-light text-black mb-2 tracking-wide">All Done!</h1>
                <p className="text-gray-500 font-light text-sm">Your password has been reset successfully</p>
              </>
            )}
          </div>

          {/* Step indicator */}
          {step !== STEPS.DONE && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {[STEPS.EMAIL, STEPS.OTP, STEPS.NEW_PASSWORD].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step >= s ? 'bg-black w-8' : 'bg-gray-200 w-4'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-black/20 bg-white/50 focus:border-black"
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-light tracking-wide"
              >
                {loading ? 'Sending...' : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">6-digit OTP</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="______"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="h-12 rounded-xl border-black/20 bg-white/50 focus:border-black text-center text-xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-light tracking-wide"
              >
                {loading ? 'Verifying...' : (
                  <span className="flex items-center justify-center gap-2">
                    Verify OTP <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Didn't receive it?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-gray-400">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-black font-medium underline underline-offset-2 hover:no-underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep(STEPS.EMAIL); setOtp(''); setError(''); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors mx-auto"
              >
                <ArrowLeft className="w-3 h-3" /> Change email
              </button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === STEPS.NEW_PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 rounded-xl border-black/20 bg-white/50 focus:border-black pr-12"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl border-black/20 bg-white/50 focus:border-black pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full h-12 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-light tracking-wide"
              >
                {loading ? 'Resetting...' : (
                  <span className="flex items-center justify-center gap-2">
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

          {/* ── Step 4: Done ── */}
          {step === STEPS.DONE && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600 font-light text-sm">
                You can now sign in with your new password.
              </p>
              <Button
                onClick={() => router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`)}
                className="w-full h-12 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-light tracking-wide"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Back to login */}
          {step !== STEPS.DONE && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Remember your password?{' '}
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`}
                className="text-black font-medium underline underline-offset-2 hover:no-underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
