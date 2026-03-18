'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  {
    key: 'donors',
    label: 'Donors',
    href: '/donors',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#E8334A]' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'requests',
    label: 'Requests',
    href: '/requests',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#E8334A]' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'home',
    label: 'Home',
    href: '/home',
    isCenter: true,
    icon: () => (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: 'Alerts',
    href: '/notifications',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#E8334A]' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    key: 'account',
    label: 'Account',
    href: '/account',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#E8334A]' : 'text-gray-400'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href) {
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex items-end justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          if (tab.isCenter) {
            return (
              <button
                key={tab.key}
                onClick={() => router.push(tab.href)}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-[#E8334A] flex items-center justify-center shadow-lg">
                  {tab.icon(true)}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{tab.label}</span>
              </button>
            );
          }
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center gap-0.5 py-2 px-3"
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium ${active ? 'text-[#E8334A]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
