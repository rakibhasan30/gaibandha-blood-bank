'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import DonorCard from '@/components/DonorCard';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function HomeContent() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { foregroundMessage } = useNotifications(user?.id);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ requestCount: 0, livesSaved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('blood_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, fetchData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchData() {
    const [{ data: reqs }, { count: reqCount }, { data: profiles }] = await Promise.all([
      supabase
        .from('blood_requests')
        .select('*, profiles(full_name, profile_photo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('profiles').select('lives_saved'),
    ]);

    setRequests(reqs || []);
    const totalLives = (profiles || []).reduce((sum, p) => sum + (p.lives_saved || 0), 0);
    setStats({ requestCount: reqCount || 0, livesSaved: totalLives });
    setLoading(false);
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] rounded-b-3xl px-5 pt-12 pb-8">
        {/* Top row: Home label + avatar */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-white/80 text-sm font-medium">Home</span>
          <Avatar name={profile?.full_name} size={40} photoUrl={profile?.profile_photo_url} />
        </div>

        {/* Greeting + Blood Group side by side */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hello, {firstName}</h1>
            <p className="text-white/70 text-sm mt-1">Hope you&apos;re well today</p>
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 flex flex-col items-center justify-center min-w-18">
            <span className="text-gray-900 font-bold text-xl leading-tight">{profile?.blood_group || '--'}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-center items-center gap-10 mt-5">
          <div className="text-white text-center">
            <p className="text-2xl font-bold leading-tight">{stats.requestCount}</p>
            <p className="text-white/70 text-xs mt-0.5">New Request</p>
          </div>
          <div className="w-px h-8 bg-white/30" />
          <div className="text-white text-center">
            <p className="text-2xl font-bold leading-tight">
              {stats.livesSaved >= 1000 ? `${(stats.livesSaved / 1000).toFixed(0)}K+` : `${stats.livesSaved}`}
            </p>
            <p className="text-white/70 text-xs mt-0.5">Lives Saved</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-5">
        {/* Blog CTA */}
        {/* TODO: Replace # with your Facebook page URL */}
        <a href="#" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-600">Follow Facebook Page to know More</p>
        </a>

        {/* Donation Requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">Donation Requests</h2>
            <Link href="/requests" className="text-[#E8334A] text-sm font-medium">View All &gt;</Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No active requests</p>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <DonorCard
                  key={req.id}
                  name={req.profiles?.full_name}
                  photoUrl={req.profiles?.profile_photo_url}
                  hospital={req.hospital_name}
                  date={req.date_needed}
                  bloodGroup={req.blood_group}
                  timeAgo={timeAgo(req.created_at)}
                  isOwn={req.requester_id === user?.id}
                  onClick={() => router.push(`/requests/${req.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {foregroundMessage && (
        <div className="fixed top-4 left-4 right-4 bg-white rounded-2xl shadow-lg p-4 z-50 max-w-110 mx-auto">
          <p className="font-semibold text-gray-800 text-sm">{foregroundMessage.notification?.title}</p>
          <p className="text-gray-500 text-xs mt-1">{foregroundMessage.notification?.body}</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
