'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import DonorCard from '@/components/DonorCard';
import SelectField from '@/components/SelectField';
import { supabase } from '@/lib/supabase';
import { BLOOD_GROUPS } from '@/lib/constants';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RequestsContent() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('requests_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, fetchRequests)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [filter]);

  async function fetchRequests() {
    setLoading(true);
    let query = supabase
      .from('blood_requests')
      .select('*, profiles(full_name, profile_photo_url)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (filter) query = query.eq('blood_group', filter);
    const { data } = await query;
    setRequests(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#E8334A]">Donation Requests</h1>
          <div className="w-36">
            <SelectField
              id="filterBG"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={BLOOD_GROUPS}
              placeholder="All Groups"
            />
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
          ))
        ) : requests.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">No active requests</p>
        ) : (
          requests.map((req) => (
            <DonorCard
              key={req.id}
              name={req.profiles?.full_name}
              photoUrl={req.profiles?.profile_photo_url}
              hospital={req.hospital_name}
              date={req.date_needed}
              bloodGroup={req.blood_group}
              timeAgo={timeAgo(req.created_at)}
              onClick={() => router.push(`/requests/${req.id}`)}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function RequestsPage() {
  return (
    <AuthGuard>
      <RequestsContent />
    </AuthGuard>
  );
}
