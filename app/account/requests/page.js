'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const STATUS_LABEL = {
  active: { text: 'Active', cls: 'bg-green-100 text-green-700' },
  fulfilled: { text: 'Fulfilled', cls: 'bg-blue-100 text-blue-700' },
  closed: { text: 'Managed', cls: 'bg-gray-100 text-gray-500' },
};

function MyRequestsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null); // id being acted on

  useEffect(() => {
    if (!user) return;
    fetchMyRequests();
  }, [user]);

  async function fetchMyRequests() {
    const { data } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  async function handleClose(req, type) {
    const confirmed = window.confirm(
      type === 'delete'
        ? 'Delete this request permanently?'
        : 'Mark this request as managed? It will be removed from the active list.'
    );
    if (!confirmed) return;
    setClosing(req.id);
    try {
      if (type === 'delete') {
        const { data, error } = await supabase.from('blood_requests').delete().eq('id', req.id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Delete failed — permission denied or row not found.');
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
      } else {
        const { data, error } = await supabase.from('blood_requests').update({ status: 'closed' }).eq('id', req.id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Update failed — permission denied or row not found.');
        setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: 'closed' } : r));
      }
    } catch (err) {
      alert('Failed: ' + (err.message || 'Something went wrong. Check Supabase RLS policies.'));
    } finally {
      setClosing(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#E8334A]">My Requests</h1>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
          ))
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-gray-400 text-sm">You have not made any requests yet</p>
            <button
              onClick={() => router.push('/requests/create')}
              className="bg-[#E8334A] text-white font-semibold px-6 py-3 rounded-full text-sm"
            >
              Create a Request
            </button>
          </div>
        ) : (
          requests.map((req) => {
            const badge = STATUS_LABEL[req.status] || STATUS_LABEL.closed;
            const isActive = req.status === 'active';
            const busy = closing === req.id;
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{req.hospital_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{req.city} · {req.date_needed || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-base font-bold text-[#E8334A]">{req.blood_group}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleClose(req, 'managed')}
                      disabled={busy}
                      className="flex-1 bg-green-500 text-white text-xs font-semibold py-2 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {busy ? '...' : 'Blood Managed'}
                    </button>
                    <button
                      onClick={() => router.push(`/requests/${req.id}`)}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs font-semibold py-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleClose(req, 'delete')}
                      disabled={busy}
                      className="flex-1 bg-red-50 text-[#E8334A] text-xs font-semibold py-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {busy ? '...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default function MyRequestsPage() {
  return (
    <AuthGuard>
      <MyRequestsContent />
    </AuthGuard>
  );
}
