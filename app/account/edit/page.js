'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { DISTRICTS } from '@/lib/constants';
import { uploadToCloudinary } from '@/lib/cloudinary';

function EditProfileContent() {
  const router = useRouter();
  const { profile, user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [donatedBefore, setDonatedBefore] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCity(profile.city || '');
      setDob(profile.date_of_birth || '');
      setSex(profile.sex || '');
      setPermanentAddress(profile.permanent_address || '');
      setPhone(profile.phone || '');
      setBloodGroup(profile.blood_group || '');
      setDonatedBefore(profile.donated_before ? 'yes' : 'no');
      setLastDonationDate(profile.last_donation_date || '');
      setPhotoUrl(profile.profile_photo_url || '');
    }
  }, [profile]);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch {
      setError('Photo upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (step === 0) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          city,
          date_of_birth: dob,
          sex,
          permanent_address: permanentAddress,
          phone,
          blood_group: bloodGroup,
          donated_before: donatedBefore === 'yes',
          last_donation_date: lastDonationDate || null,
          profile_photo_url: photoUrl || null,
        })
        .eq('id', user.id);

      if (profileErr) throw profileErr;

      if (newPassword) {
        const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
        if (passErr) throw passErr;
      }

      await refreshProfile();
      router.push('/account');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => step === 0 ? router.back() : setStep(0)} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
      </div>

      <div className="px-5 py-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <InputField label="Full Name" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <SelectField label="Currently Residing City" id="city" value={city} onChange={(e) => setCity(e.target.value)} options={DISTRICTS} placeholder="Select district" required />
              <InputField label="Date of Birth" id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              <SelectField label="Sex" id="sex" value={sex} onChange={(e) => setSex(e.target.value)} options={['Male', 'Female']} placeholder="Select sex" />
              <InputField label="Permanent Address" id="permanentAddress" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
              <InputField label="Phone Number" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Did you donate blood previously?</label>
                <div className="flex gap-3">
                  {['yes', 'no'].map((val) => (
                    <button key={val} type="button" onClick={() => setDonatedBefore(val)}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm ${donatedBefore === val ? 'bg-[#E8334A] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {val.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {donatedBefore === 'yes' && (
                <InputField label="Last date of donation" id="lastDonationDate" type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)} />
              )}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                <BloodGroupSelector selected={bloodGroup} onSelect={setBloodGroup} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <InputField label="New Password (leave blank to keep)" id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                <label className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : photoUrl ? 'Photo uploaded ✓' : 'Change profile photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </>
          )}

          <PrimaryButton type="submit" disabled={loading || uploading}>
            {loading ? 'Saving...' : step === 0 ? 'Next' : 'Save Changes'}
          </PrimaryButton>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4">
          {[0, 1].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[#E8334A]' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <EditProfileContent />
    </AuthGuard>
  );
}
