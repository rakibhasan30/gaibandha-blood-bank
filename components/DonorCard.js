'use client';

import Avatar from './Avatar';

export default function DonorCard({ name, hospital, date, bloodGroup, timeAgo, onClick, photoUrl, showDonate = true, isOwn = false }) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow duration-200 ${
        isOwn ? 'border-[#E8334A]/40 bg-red-50/20' : 'border-gray-100'
      }`}
    >
      {isOwn && (
        <span className="absolute top-2 right-2 bg-[#E8334A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Your Request
        </span>
      )}
      <Avatar name={name} size={48} photoUrl={photoUrl} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{name || 'Unknown'}</p>
        {hospital && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {hospital}
          </p>
        )}
        {date && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {date}
          </p>
        )}
        {timeAgo && <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>}
      </div>

      <div className="flex flex-col items-end shrink-0">
        {bloodGroup && (
          <span className="text-[#E8334A] font-bold text-lg leading-none">{bloodGroup}</span>
        )}
        {showDonate && (
          <span className="text-[#E8334A] text-xs font-medium mt-1">Donate &gt;</span>
        )}
      </div>
    </div>
  );
}
