/**
 * TimeSlot Component
 * Calendly-inspired time slot button (soft)
 */
'use client';

import { formatTime } from '@/utils/dateHelpers';

interface TimeSlotProps {
  start: Date;
  end: Date;
  available: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export default function TimeSlot({
  start,
  available,
  onClick,
  selected = false,
  disabled = false,
}: TimeSlotProps) {
  const handleClick = () => {
    if (available && !disabled && onClick) onClick();
  };

  const base =
    'w-full h-11 px-4 rounded-full text-sm font-semibold transition-colors ' +
    'focus:outline-none focus:ring-4 focus:ring-blue-500/15';

  if (!available) {
    return (
      <button
        type="button"
        disabled
        className={`${base} bg-white border border-slate-200 text-slate-400 opacity-40 cursor-not-allowed`}
      >
        {formatTime(start)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={[
        base,
        selected
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {formatTime(start)}
    </button>
  );
}
