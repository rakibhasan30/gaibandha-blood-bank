'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import DonorCard from '@/components/DonorCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

function HistoryContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    const { data } = await supabase
      .from('donations')
      .select('*, blood_requests(hospital_name, date_needed, blood_group, city, profiles(full_name, profile_photo_url))')
      .eq('donor_id', user.id)
      .order('donated_at', { ascending: false });

    setDonations(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#E8334A]">Donation History</h1>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
          ))
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
            <p className="text-gray-400 text-sm">No donations yet</p>
          </div>
        ) : (
          donations.map((d) => (
            <DonorCard
              key={d.id}
              name={d.blood_requests?.profiles?.full_name || 'Unknown'}
              photoUrl={d.blood_requests?.profiles?.profile_photo_url}
              hospital={d.blood_requests?.hospital_name}
              date={d.blood_requests?.date_needed}
              bloodGroup={d.blood_requests?.blood_group}
              onClick={() => router.push(`/requests/${d.request_id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function DonationHistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}
