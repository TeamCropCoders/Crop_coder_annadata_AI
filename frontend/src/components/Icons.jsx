export function LeafIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M19 4C11 4 6 8.5 6 15c0 3.2 2.2 5 5 5 6.5 0 9-5 9-13V4Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M8 16c2.5-2.5 5-4.3 8-5.5M9 20c.3-2 1-3.6 2.2-4.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CropIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 9c-2.5 0-4-1.6-4.8-4C10 5.2 11.6 6.6 12 9ZM12 13c-2.2 0-3.6-1.4-4.3-3.6C10.1 9.6 11.5 10.8 12 13ZM12 9c2.5 0 4-1.6 4.8-4C14 5.2 12.4 6.6 12 9ZM12 13c2.2 0 3.6-1.4 4.3-3.6C13.9 9.6 12.5 10.8 12 13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SunIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path
        d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8M19.1 19.1l-1.8-1.8M6.7 6.7 4.9 4.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
