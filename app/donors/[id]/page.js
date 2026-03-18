'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import DonorCard from '@/components/DonorCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

function DonorProfileContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [canCall, setCanCall] = useState(false);
  const [acceptedDonationId, setAcceptedDonationId] = useState(null);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDonor();
  }, [params.id, user]);

  async function fetchDonor() {
    const [{ data: donorData }, { data: donationsData }, { data: acceptedData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', params.id).single(),
      supabase
        .from('donations')
        .select('*, blood_requests(hospital_name, date_needed, blood_group, city)')
        .eq('donor_id', params.id)
        .order('donated_at', { ascending: false }),
      // Check if this donor accepted a request made by the current user
      supabase
        .from('donations')
        .select('id, blood_requests(requester_id)')
        .eq('donor_id', params.id)
        .eq('status', 'accepted'),
    ]);

    setDonor(donorData);
    setDonations(donationsData || []);

    // Allow call only if current user is the requester of an accepted donation
    const acceptedEntry = (acceptedData || []).find(
      (d) => d.blood_requests?.requester_id === user?.id
    );
    setCanCall(!!acceptedEntry);
    if (acceptedEntry) setAcceptedDonationId(acceptedEntry.id);
    setLoading(false);
  }

  async function markAsDonated() {
    if (!acceptedDonationId) return;
    setMarking(true);
    try {
      const { error } = await supabase.rpc('complete_donation', {
        p_donation_id: acceptedDonationId,
        p_donor_profile_id: params.id,
      });
      if (error) throw error;
      setMarked(true);
    } catch (err) {
      console.error(err);
      alert('Could not mark as complete. Please try again.');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8334A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!donor) {
    return <div className="p-8 text-center text-gray-400">Donor not found.</div>;
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

      {/* Recent Donations */}
      <div className="px-5">
        <h2 className="font-bold text-gray-800 text-base mb-3">Donation History</h2>
        {donations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No donations yet</p>
        ) : (
          <div className="flex flex-col gap-3 mb-5">
            {donations.map((d) => (
              <DonorCard
                key={d.id}
                name={donor.full_name}
                photoUrl={donor.profile_photo_url}
                hospital={d.blood_requests?.hospital_name}
                date={d.blood_requests?.date_needed}
                bloodGroup={d.blood_requests?.blood_group}
                showDonate={false}
              />
            ))}
          </div>
        )}

        {/* Call Now — only visible to requesters whose request this donor accepted */}
        {canCall ? (
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${donor.phone}`}
              className="block w-full bg-[#E8334A] text-white font-bold py-4 rounded-full text-center text-base hover:bg-[#C4253A] transition-colors"
            >
              Call Now — {donor.phone}
            </a>

            {/* Mark as Donated — shown only to requester, disappears after marked */}
            {marked ? (
              <div className="w-full bg-green-50 border border-green-200 text-green-700 py-4 rounded-full text-center text-sm font-semibold">
                ✓ Donation marked as complete — added to history!
              </div>
            ) : (
              <button
                onClick={markAsDonated}
                disabled={marking}
                className="w-full bg-white border-2 border-[#E8334A] text-[#E8334A] font-bold py-4 rounded-full text-center text-base hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {marking ? 'Saving...' : 'Donation Done? Mark as Complete'}
              </button>
            )}
          </div>
        ) : (
          <div className="w-full bg-gray-100 text-gray-400 py-4 rounded-full text-center text-sm">
            Phone number hidden — only visible after donor accepts your request
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function DonorProfilePage() {
  return (
    <AuthGuard>
      <DonorProfileContent />
    </AuthGuard>
  );
}
