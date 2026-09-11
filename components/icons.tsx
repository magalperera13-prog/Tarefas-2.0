export function TodayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10.3l2 2 4-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <circle cx="10" cy="10.5" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.8v3.9l2.6 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 2.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ExpensesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <rect x="2.5" y="5" width="15" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 12.3h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SubscriptionsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M15.5 6.5A5.7 5.7 0 004.7 8.3M4.5 13.5A5.7 5.7 0 0015.3 11.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M15.5 3.5v3h-3M4.5 16.5v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BalanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <circle cx="7.5" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path
        d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M13 13l3.5-3.5L13 6M16 9.5H7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
