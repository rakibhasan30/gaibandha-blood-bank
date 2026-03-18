'use client';

export default function PrimaryButton({ children, onClick, type = 'button', disabled = false, className = '', fullWidth = true }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} bg-[#E8334A] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#C4253A] active:bg-[#A81E2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
