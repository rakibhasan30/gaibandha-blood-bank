'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import PrimaryButton from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';

const DISCLAIMERS = [
  {
    title: 'Volunteer-Based Service',
    text: 'The app only connects donors and recipients; donations are purely voluntary.',
  },
  {
    title: 'No Financial Transactions',
    text: 'The app is not responsible for any monetary exchanges between users.',
  },
  {
    title: 'User Responsibility',
    text: 'Requesters must verify donor eligibility and follow proper medical procedures.',
  },
];

function AcceptedContent() {
  const router = useRouter();
  const params = useParams();
  const [donor, setDonor] = useState(null);
  const [donationId, setDonationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonation();
  }, [params.id]);

  async function fetchDonation() {
    const { data } = await supabase
      .from('donations')
      .select('*, profiles(id, full_name, profile_photo_url, blood_group, city)')
      .eq('request_id', params.id)
      .eq('status', 'accepted')
      .order('donated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setDonor(data.profiles);
      setDonationId(data.id);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8334A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!donor) {
    return <div className="p-8 text-center text-gray-400">No accepted donation found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] rounded-b-3xl px-5 pt-12 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">{donor.full_name}</h1>
        <p className="text-white text-base mt-1">Accepted Your Request</p>
        <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {donor.city}
        </p>
      </div>

      {/* Avatar overlapping */}
      <div className="flex justify-center -mt-12 mb-6">
        <div className="relative">
          <Avatar name={donor.full_name} size={88} photoUrl={donor.profile_photo_url} />
          {donor.blood_group && (
            <span className="absolute -bottom-1 -right-1 bg-[#E8334A] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
              {donor.blood_group}
            </span>
          )}
        </div>
      </div>

      {/* Disclaimers */}
      <div className="mx-5 bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col gap-4">
          {DISCLAIMERS.map(({ title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#E8334A] mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{title}</span> — {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5">
        <PrimaryButton onClick={() => router.push(`/donors/${donor.id}`)}>
          Connect
        </PrimaryButton>
      </div>

      <BottomNav />
    </div>
  );
}

export default function AcceptedPage() {
  return (
    <AuthGuard>
      <AcceptedContent />
    </AuthGuard>
  );
}
