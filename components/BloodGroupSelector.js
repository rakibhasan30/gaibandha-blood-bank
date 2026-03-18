'use client';

import { BLOOD_GROUPS } from '@/lib/constants';

export default function BloodGroupSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BLOOD_GROUPS.map((bg) => (
        <button
          key={bg}
          type="button"
          onClick={() => onSelect(bg)}
          className={`py-2 px-1 rounded-xl text-sm font-semibold transition-colors duration-150 ${
            selected === bg
              ? 'bg-[#E8334A] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {bg}
        </button>
      ))}
    </div>
  );
}
