'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

function RequestDetailContent() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuth();
  const [request, setRequest] = useState(null);
  const [requester, setRequester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  async function fetchRequest() {
    const { data: req } = await supabase
      .from('blood_requests')
      .select('*, profiles(id, full_name, profile_photo_url, city, blood_group)')
      .eq('id', params.id)
      .single();

    if (req) {
      setRequest(req);
      setRequester(req.profiles);
    }
    setLoading(false);
  }

  async function handleDonate() {
    if (!user || !request) return;
    setDonating(true);
    try {
      // Create donation record
      const { error: donErr } = await supabase.from('donations').insert({
        donor_id: user.id,
        request_id: request.id,
        status: 'accepted',
      });
      if (donErr) throw donErr;

      // Increment units_fulfilled
      await supabase
        .from('blood_requests')
        .update({ units_fulfilled: (request.units_fulfilled || 0) + 1 })
        .eq('id', request.id);

      // Create in-app notification for requester
      const donorName = profile?.full_name || 'A donor';
      await supabase.from('notifications').insert({
        user_id: requester.id,
        request_id: request.id,
        title: `${donorName} Accepted Your Request`,
        message: `${donorName} has agreed to donate ${request.blood_group} blood at ${request.hospital_name}.`,
        is_read: false,
      });

      // Send push notification
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blood_group: request.blood_group,
            city: request.city,
            request_id: request.id,
            requester_name: requester.full_name,
            hospital_name: request.hospital_name,
            donor_name: donorName,
            target_user_id: requester.id,
          }),
        });
      } catch {}

      setToast('You have accepted to donate! The requester has been notified.');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      setToast(err.message || 'Something went wrong');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setDonating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E8334A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return <div className="p-8 text-center text-gray-400">Request not found.</div>;
  }

  const details = [
    { label: 'Blood Type', value: request.blood_group },
    { label: 'Date & Time', value: `${request.date_needed || '—'} ${request.time_needed || ''}` },
    { label: 'Donation Type', value: request.donation_type },
    { label: "Patient's Sex", value: request.patient_sex },
    { label: 'Units Needed', value: request.units_needed },
    { label: 'Phone', value: request.phone || 'Hidden' },
  ];

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
        <h1 className="text-xl font-bold text-white">{requester?.full_name}, Requested for Blood</h1>
        <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {request.city}
        </p>
      </div>

      {/* Avatar overlapping */}
      <div className="flex justify-center -mt-12 mb-6">
        <div className="relative">
          <Avatar name={requester?.full_name} size={88} photoUrl={requester?.profile_photo_url} />
          {request.blood_group && (
            <span className="absolute -bottom-1 -right-1 bg-[#E8334A] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
              {request.blood_group}
            </span>
          )}
        </div>
      </div>

      {/* Request details card */}
      <div className="mx-5 bg-white rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="bg-[#E8334A] px-4 py-3">
          <p className="text-white font-semibold text-sm">Request Details</p>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          {details.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-[#E8334A] mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400">Location of Donation</p>
          <p className="text-sm font-semibold text-[#E8334A] mt-0.5">
            {request.hospital_name}{request.department ? `, ${request.department}` : ''}
          </p>
          {request.address && <p className="text-xs text-gray-500 mt-0.5">{request.address}</p>}
        </div>
      </div>

      <div className="mx-5">
        <PrimaryButton onClick={handleDonate} disabled={donating || request.requester_id === user?.id}>
          {donating ? 'Processing...' : request.requester_id === user?.id ? 'Your Request' : 'Donate'}
        </PrimaryButton>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-4 right-4 bg-gray-900 text-white text-sm rounded-2xl px-4 py-3 text-center z-50 max-w-[440px] mx-auto">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <AuthGuard>
      <RequestDetailContent />
    </AuthGuard>
  );
}
