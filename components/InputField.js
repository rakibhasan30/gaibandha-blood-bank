'use client';

export default function InputField({ label, id, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && <span className="text-[#E8334A] ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-[#E8334A] transition-all text-sm w-full"
      />
    </div>
  );
}
