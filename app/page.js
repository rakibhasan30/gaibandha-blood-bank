'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SplashPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#E8334A] to-[#C4253A]">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-linear-to-br from-[#E8334A] to-[#C4253A] px-6 py-16 fade-in">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <img src="/icon-192x192.png" width="200" height="200" alt="Gaibandha Blood Bank" className="rounded-2xl" />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Gaibandha Blood Bank</h1>
          <p className="text-white/80 mt-2 text-lg">Request.Donate.Save Lives</p>
        </div>
      </div>

      <button
        onClick={() => router.push('/login')}
        className="w-full bg-white text-[#E8334A] font-bold py-4 rounded-full text-lg hover:bg-gray-100 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
