'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      router.replace('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Check your phone and password.');
    } finally {
      setLoading(false);
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
        <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Phone Number"
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />
          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

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
      </div>
    </div>
  );
}
