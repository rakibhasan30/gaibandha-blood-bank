'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Check your phone and password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || 'Failed to send reset email. Check the address and try again.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Red header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] pt-16 pb-20 flex flex-col items-center gap-3">
        <img src="/icon-192x192.png" width="56" height="56" alt="Gaibandha Blood Bank" className="rounded-xl" />
        <h1 className="text-2xl font-bold text-white">Gaibandha Blood Bank</h1>
        <p className="text-white/80">Request.Donate.Save Lives</p>
      </div>

      {/* White card overlapping */}
      <div className="flex-1 bg-white rounded-t-3xl -mt-8 px-6 pt-8 pb-8 shadow-lg">

        {!showForgot ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputField
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <div>
                <InputField
                  label="Password"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-[#E8334A] font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <PrimaryButton type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </PrimaryButton>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[#E8334A] font-semibold">
                Register Here!
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => { setShowForgot(false); setResetSuccess(false); setResetError(''); setResetEmail(''); }}
              className="flex items-center gap-2 text-gray-500 text-sm mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Sign In
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Forgot Password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the email address you used during registration. We&apos;ll send you a reset link.
            </p>

            {resetSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-4 text-center">
                ✓ Reset link sent! Check your email inbox and follow the link to reset your password.
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                    {resetError}
                  </div>
                )}
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <InputField
                    label="Email Address"
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <PrimaryButton type="submit" disabled={resetLoading}>
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </PrimaryButton>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
