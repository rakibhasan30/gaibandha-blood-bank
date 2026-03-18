'use client';

export default function SelectField({ label, id, value, onChange, options, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && <span className="text-[#E8334A] ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-[#E8334A] transition-all text-sm w-full appearance-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
