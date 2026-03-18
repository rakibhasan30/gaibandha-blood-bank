'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import DonorCard from '@/components/DonorCard';
import SelectField from '@/components/SelectField';
import { supabase } from '@/lib/supabase';
import { BLOOD_GROUPS } from '@/lib/constants';

function DonorsContent() {
  const router = useRouter();
  const [donors, setDonors] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, [filter]);

  async function fetchDonors() {
    setLoading(true);
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (filter) query = query.eq('blood_group', filter);
    const { data } = await query;
    setDonors(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] rounded-b-3xl px-5 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Need Blood?</h1>
            <p className="text-white/70 text-sm mt-1">Make a request</p>
          </div>
          <button
            onClick={() => router.push('/requests/create')}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md"
          >
            <svg className="w-6 h-6 text-[#E8334A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#E8334A] text-base">Donors</h2>
          <div className="w-36">
            <SelectField
              id="filterBloodGroup"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={BLOOD_GROUPS}
              placeholder="All Groups"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : donors.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No donors found</p>
        ) : (
          <div className="flex flex-col gap-3">
            {donors.map((donor) => (
              <DonorCard
                key={donor.id}
                name={donor.full_name}
                photoUrl={donor.profile_photo_url}
                hospital={donor.city}
                date={donor.last_donation_date}
                bloodGroup={donor.blood_group}
                onClick={() => router.push(`/donors/${donor.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function DonorsPage() {
  return (
    <AuthGuard>
      <DonorsContent />
    </AuthGuard>
  );
}
