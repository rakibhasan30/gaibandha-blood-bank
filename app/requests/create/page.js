'use client';

import { useState } from 'react';
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

const DONATION_TYPES = [
  'Whole Blood Donation',
  'Platelet Donation',
  'Plasma Donation',
  'Double Red Cell',
];

const DISCLAIMERS = [
  { title: 'Volunteer-Based Service', text: 'Donations are purely voluntary.' },
  { title: 'No Financial Transactions', text: 'The app is not responsible for monetary exchanges.' },
  { title: 'User Responsibility', text: 'Requesters must follow proper medical procedures.' },
];

function CreateRequestContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [donationType, setDonationType] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
  const [timeNeeded, setTimeNeeded] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [unitsNeeded, setUnitsNeeded] = useState('1');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!donationType || !dateNeeded || !patientSex || !city || !phone || !bloodGroup) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data: req, error: reqErr } = await supabase
        .from('blood_requests')
        .insert({
          requester_id: user.id,
          donation_type: donationType,
          date_needed: dateNeeded,
          time_needed: timeNeeded,
          patient_sex: patientSex,
          blood_group: bloodGroup,
          units_needed: parseInt(unitsNeeded) || 1,
          units_fulfilled: 0,
          phone,
          hospital_name: hospitalName,
          department,
          address,
          city,
          status: 'active',
        })
        .select()
        .single();

      if (reqErr) throw reqErr;

      // Send push notification to matching donors
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blood_group: bloodGroup,
            city,
            request_id: req.id,
            requester_name: profile?.full_name,
            hospital_name: hospitalName,
          }),
        });
      } catch {}

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8334A] to-[#C4253A] flex flex-col items-center justify-center px-6 pb-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Donation Request created successfully</h2>
          <p className="text-white/80 text-sm">Please Note: You can connect to donor only if they agree for donation</p>
          <button
            onClick={() => router.push('/requests')}
            className="bg-white text-[#E8334A] font-bold py-3 px-8 rounded-full mt-4"
          >
            View Requests
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          Create a <span className="text-[#E8334A]">request</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <SelectField label="Donation Type" id="donationType" value={donationType} onChange={(e) => setDonationType(e.target.value)} options={DONATION_TYPES} placeholder="Select type" required />
        <InputField label="Date of Donation" id="dateNeeded" type="date" value={dateNeeded} onChange={(e) => setDateNeeded(e.target.value)} required />
        <InputField label="Time Needed" id="timeNeeded" type="time" value={timeNeeded} onChange={(e) => setTimeNeeded(e.target.value)} />
        <SelectField label="Patient's Sex" id="patientSex" value={patientSex} onChange={(e) => setPatientSex(e.target.value)} options={['Male', 'Female', 'Other']} placeholder="Select sex" required />
        <SelectField label="City" id="city" value={city} onChange={(e) => setCity(e.target.value)} options={DISTRICTS} placeholder="Select district" required />
        <InputField label="Hospital Name" id="hospitalName" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="Hospital or clinic name" />
        <InputField label="Department" id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. ICU, Emergency" />
        <InputField label="Address" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
        <InputField label="Phone Number" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
        <InputField label="Units Needed" id="unitsNeeded" type="number" value={unitsNeeded} onChange={(e) => setUnitsNeeded(e.target.value)} min="1" max="10" />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Blood Group <span className="text-[#E8334A]">*</span></label>
          <BloodGroupSelector selected={bloodGroup} onSelect={setBloodGroup} />
        </div>

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Request'}
        </PrimaryButton>

        {/* Disclaimers */}
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 mt-2">
          {DISCLAIMERS.map(({ title, text }) => (
            <div key={title} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">{title}</span> — {text}</p>
            </div>
          ))}
        </div>
      </form>

      <BottomNav />
    </div>
  );
}

export default function CreateRequestPage() {
  return (
    <AuthGuard>
      <CreateRequestContent />
    </AuthGuard>
  );
}
