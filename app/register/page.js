'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import BloodGroupSelector from '@/components/BloodGroupSelector';
import PrimaryButton from '@/components/PrimaryButton';
import { DISTRICTS } from '@/lib/constants';
import { uploadToCloudinary } from '@/lib/cloudinary';

const STEPS = 3;

function ProgressDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i === step ? 'bg-[#E8334A]' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Step 2 fields
  const [donatedBefore, setDonatedBefore] = useState(null);
  const [lastDonationDate, setLastDonationDate] = useState('');

  // Step 3 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoUrl(url);
    } catch {
      setError('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (step === 0) {
      if (!fullName || !city || !dob || !sex || !phone || !bloodGroup) {
        setError('Please fill all required fields.');
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    // Step 3 — final submit
    if (!email || !password) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register({
        phone,
        password,
        email,
        profileData: {
          full_name: fullName,
          city,
          date_of_birth: dob,
          sex,
          permanent_address: permanentAddress,
          blood_group: bloodGroup,
          donated_before: donatedBefore === 'yes',
          last_donation_date: lastDonationDate || null,
          profile_photo_url: photoUrl || null,
          lives_saved: 0,
        },
      });
      router.replace('/home');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-br from-[#E8334A] to-[#C4253A] px-5 pt-12 pb-6 flex items-center gap-3">
        {step === 0 ? (
          <Link href="/login">
            <button className="text-white p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
        ) : (
          <button className="text-white p-1" onClick={() => setStep(step - 1)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img src="/icon-192x192.png" width="28" height="28" alt="Gaibandha Blood Bank" className="rounded-md" />
        <h1 className="text-white font-bold text-lg">Gaibandha Blood Bank</h1>
      </div>

      <div className="flex-1 px-5 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Step 1 */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-800">
                Register Yourself as <span className="text-[#E8334A]">Donor</span>
              </h2>

              <InputField label="Full Name" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />

              <SelectField
                label="Currently Residing City"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                options={DISTRICTS}
                placeholder="Select district"
                required
              />

              <InputField label="Date of Birth" id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />

              <SelectField
                label="Sex"
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                options={['Male', 'Female']}
                placeholder="Select sex"
                required
              />

              <InputField label="Permanent Address" id="permanentAddress" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} placeholder="Your permanent address" />

              <div>
                <InputField label="Phone Number" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
                <p className="text-[13px] mt-1" style={{ color: '#E8334A' }}>
                  Your Number will be hidden until you want to donate
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Blood Group <span className="text-[#E8334A]">*</span></label>
                <BloodGroupSelector selected={bloodGroup} onSelect={setBloodGroup} />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-gray-800">Your Donation History</h2>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Did you donate blood previously?</label>
                <div className="flex gap-3">
                  {['yes', 'no'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDonatedBefore(val)}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                        donatedBefore === val ? 'bg-[#E8334A] text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {val.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {donatedBefore === 'yes' && (
                <InputField
                  label="Last date of donation"
                  id="lastDonationDate"
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                />
              )}

              <div className="bg-red-50 rounded-2xl p-4 flex items-start gap-3 mt-4">
                <img src="/icon-192x192.png" width="24" height="24" alt="" className="rounded-md shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 italic">
                  &ldquo;Save a life, give blood — because someone, somewhere, is counting on you today.&rdquo;
                </p>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-gray-800">
                <span className="text-[#E8334A]">Great!</span> You are almost done.
              </h2>

              <InputField label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <InputField label="Create Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                <label className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : photoUrl ? 'Photo uploaded ✓' : 'Upload profile photo'}
                  </span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <p className="text-center text-sm text-gray-500 mt-2">
                be a <span className="text-[#E8334A] font-semibold">hero</span>, give blood.
              </p>
            </>
          )}

          <PrimaryButton type="submit" disabled={loading || uploading}>
            {loading ? 'Submitting...' : step < 2 ? 'Next' : 'Submit'}
          </PrimaryButton>
        </form>

        <ProgressDots step={step} />
      </div>
    </div>
  );
}
