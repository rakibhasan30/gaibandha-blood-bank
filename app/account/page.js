'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import Avatar from '@/components/Avatar';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';

function AccountContent() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  const details = [
    { label: 'Blood Type', value: profile?.blood_group },
    { label: 'Date of Birth', value: profile?.date_of_birth },
    { label: 'Sex', value: profile?.sex },
    { label: 'Phone Number', value: profile?.phone },
    { label: 'Last Donation', value: profile?.last_donation_date || '—' },
    { label: 'City', value: profile?.city },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] rounded-b-3xl px-5 pt-12 pb-16">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm font-medium">Account</span>
          <button
            onClick={() => router.push('/account/edit')}
            className="text-white text-sm font-medium border border-white/40 rounded-full px-4 py-1.5"
          >
            Edit Info
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'User'}</h1>
        <p className="text-white/70 text-sm mt-1">You are Amazing</p>
        <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {profile?.city || '—'}
        </p>
      </div>

      {/* Avatar overlapping */}
      <div className="flex flex-col items-center -mt-12 mb-4">
        <div className="relative">
          <Avatar name={profile?.full_name} size={88} photoUrl={profile?.profile_photo_url} />
          {profile?.blood_group && (
            <span className="absolute -bottom-1 -right-1 bg-[#E8334A] text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
              {profile.blood_group}
            </span>
          )}
        </div>

        {/* Lives saved */}
        <div className="mt-4 text-center">
          <p className="text-4xl font-bold text-[#E8334A]">{profile?.lives_saved || 0}</p>
          <p className="text-gray-500 text-sm">Lives Saved</p>
        </div>
      </div>

      {/* Personal Details */}
      <div className="mx-5 bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
        <div className="bg-[#E8334A] px-4 py-3">
          <p className="text-white font-semibold text-sm">Personal Details</p>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          {details.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-[#E8334A] mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 flex flex-col gap-3">
        <PrimaryButton onClick={() => router.push('/account/requests')}>
          My Blood Requests
        </PrimaryButton>
        <PrimaryButton onClick={() => router.push('/account/history')}>
          Donation History
        </PrimaryButton>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-full border border-gray-200 text-gray-500 text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
