'use client';

import { useMemo } from 'react';
import {
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  format,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '@/types/database';

type CalendarSize = 'md' | 'lg';

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (nextMonth: Date) => void;

  slots: TimeSlot[];
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;

  weekStartsOn?: 0 | 1; // default 1 (lunes)
  size?: CalendarSize; // default lg
   minDate?: Date;  // Add this
  maxDate?: Date;
}

export default function Calendar({
  currentMonth,
  onMonthChange,
  slots,
  selectedDate,
  onSelectDate,
  weekStartsOn = 1,
  size = 'lg',
}: CalendarProps) {
  const today = new Date();
  const now = new Date();
  const minDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Map de disponibilidad por día
  const availableByDay = useMemo(() => {
  const map = new Map<string, number>();
  for (const s of slots) {
    if (!s.available) continue;
    const slotDate = new Date(s.start);
    if (slotDate < minDate || slotDate > maxDate) continue;
    const key = format(startOfDay(slotDate), 'yyyy-MM-dd');
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}, [slots]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const days = useMemo(() => {
    const result: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      result.push(d);
      d = addDays(d, 1);
    }
    // Garantiza 6 filas (42 celdas) siempre -> alineación perfecta
    while (result.length < 42) {
      result.push(addDays(result[result.length - 1], 1));
    }
    return result;
  }, [gridStart, gridEnd]);

  const weekdays = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn });
    return Array.from({ length: 7 }).map((_, i) =>
      format(addDays(base, i), 'EEE', { locale: es })
    );
  }, [weekStartsOn]);

  const ui = {
    navBtn:
      'h-11 w-11 inline-flex items-center justify-center ' +
      'bg-white/10 hover:bg-white/20 ' +
      'backdrop-blur-xl ' +
      'border border-white/20 hover:border-white/50 ' +
      'rounded-2xl ' +
      'shadow-lg shadow-black/5 hover:shadow-blue-400/10 ' +
      'transition-all duration-300 ease-out ' +
      'active:scale-90 active:bg-white/30 ' +
      'hover:-translate-y-0.5',
    headerTitle: 
      'text-2xl font-300 tracking-tight text-slate-900 capitalize ' +
      'drop-shadow-sm',
    weekday:
      size === 'lg'
        ? 'text-[11px] font-light tracking-[0.08em] uppercase text-slate-600/70 ' +
          'font-medium'
        : 'text-[10px] font-light tracking-[0.08em] uppercase text-slate-600/70 ' +
          'font-medium',
    dayBase:
      'relative inline-flex items-center justify-center select-none ' +
      'transition-all duration-300 font-light rounded-2xl ' +
      'focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:ring-offset-2 focus:ring-offset-white/40',
    daySize:
      size === 'lg'
        ? 'h-13 w-13 text-[15px]'
        : 'h-11 w-11 text-[14px]',
    dot:
      'absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full',
  } as const;

  const prev = () => onMonthChange(subMonths(currentMonth, 1));
  const next = () => onMonthChange(addMonths(currentMonth, 1));

  return (
    <div className="w-full">
      {/* Fondo ambiental etéreo mejorado */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Container principal con glassmorphism mejorado */}
      <div className={`relative bg-white/35 backdrop-blur-3xl rounded-4xl p-10 border border-white/40 shadow-2xl shadow-blue-900/10 before:absolute before:inset-0 before:rounded-4xl before:bg-gradient-to-br before:from-white/50 before:via-white/30 before:to-white/10 before:pointer-events-none after:absolute after:inset-0 after:rounded-4xl after:bg-gradient-to-t after:from-blue-50/5 after:to-transparent after:pointer-events-none`}>
        
        {/* Texture overlay premium */}
        <div className="absolute inset-0 opacity-40 pointer-events-none rounded-4xl" 
             style={{
               backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 1px)',
               backgroundSize: '60px 60px'
             }} />

        {/* Header mes centrado + flechas a lados */}
        <div className="relative flex items-center justify-center h-14 mb-10 px-2">
          <button 
            type="button" 
            onClick={prev} 
            className={`${ui.navBtn} absolute left-0`}
            aria-label="Mes anterior"
          >
            <svg className="h-5 w-5 text-slate-700/80 group-hover:text-slate-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={`${ui.headerTitle} text-center`}>
            {format(currentMonth, 'MMMM', { locale: es })}
            <span className="text-slate-500/60 ml-2 font-light text-lg">{format(currentMonth, 'yyyy')}</span>
          </div>

          <button 
            type="button" 
            onClick={next} 
            className={`${ui.navBtn} absolute right-0`}
            aria-label="Mes siguiente"
          >
            <svg className="h-5 w-5 text-slate-700/80 group-hover:text-slate-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Divider elegante */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-8" />

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-6 gap-2">
          {weekdays.map((w, i) => (
            <div key={i} className={`text-center ${ui.weekday} py-3`}>
              {w}
            </div>
          ))}
        </div>

        {/* Days grid con espaciado mejorado */}
        <div className="grid grid-cols-7 gap-4">
          {days.map((day, idx) => {
            const dayKey = format(startOfDay(day), 'yyyy-MM-dd');

            const inMonth = isSameMonth(day, currentMonth);
            const hasAvailability = availableByDay.has(dayKey);

            // Regla: fuera del mes o sin disponibilidad => disabled
            const disabled = !inMonth || !hasAvailability;

            const isSelected = !!selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            // Enhanced glassmorphism styling
            let styling = '';
            let textColor = '';
            let animationDelay = '';
            
            if (!inMonth) {
              textColor = 'text-slate-300/20';
              styling = 'bg-transparent';
            } else if (isSelected) {
              textColor = 'text-white font-medium';
              styling = 
                'bg-gradient-to-br from-blue-400/85 via-blue-400/75 to-cyan-400/65 ' +
                'backdrop-blur-xl ' +
                'shadow-xl shadow-blue-400/25 ' +
                'border border-blue-300/70 ' +
                'glow-effect-premium';
            } else if (isToday) {
              textColor = 'text-blue-600 font-medium';
              styling = 
                'bg-white/25 backdrop-blur-md ' +
                'border border-blue-300/60 ' +
                'ring-2 ring-blue-300/40 ring-offset-2 ring-offset-white/30 ' +
                'shadow-lg shadow-blue-300/15';
            } else if (hasAvailability) {
              textColor = 'text-slate-700 hover:text-slate-900';
              styling = 
                'bg-white/12 hover:bg-white/30 backdrop-blur-md ' +
                'border border-white/20 hover:border-blue-300/50 ' +
                'hover:shadow-lg hover:shadow-blue-300/15 ' +
                'hover:scale-110 hover:-translate-y-1';
              animationDelay = `${idx * 20}ms`;
            } else {
              textColor = 'text-slate-300/30';
              styling = 'bg-transparent border border-transparent';
            }

            const interaction = disabled ? 'opacity-20 pointer-events-none' : 'cursor-pointer';

            return (
              <div key={dayKey} className="flex items-center justify-center" style={{ transitionDelay: animationDelay }}>
                <button
                  type="button"
                  onClick={() => onSelectDate(day)}
                  disabled={disabled}
                  className={`${ui.dayBase} ${ui.daySize} ${styling} ${textColor} ${interaction}`}
                  aria-label={dayKey}
                >
                  <span className="relative z-10">{format(day, 'd')}</span>

                  {/* Dot de disponibilidad - premium */}
                  {inMonth && hasAvailability && !isSelected && (
                    <span className={`${ui.dot} bg-gradient-to-r from-blue-400/80 to-cyan-400/60 shadow-lg shadow-blue-300/40 animate-pulse`} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estilos dinámicos para efectos premium */}
      <style jsx>{`
        @keyframes soft-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.35), 0 0 40px rgba(34, 211, 238, 0.2);
          }
          50% {
            box-shadow: 0 0 35px rgba(96, 165, 250, 0.5), 0 0 65px rgba(34, 211, 238, 0.3);
          }
        }
        
        @keyframes soft-glow-premium {
          0%, 100% {
            box-shadow: 0 0 25px rgba(96, 165, 250, 0.4), 0 0 50px rgba(34, 211, 238, 0.25), inset 0 1px 0 rgba(255,255,255,0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(96, 165, 250, 0.55), 0 0 75px rgba(34, 211, 238, 0.35), inset 0 1px 0 rgba(255,255,255,0.5);
          }
        }
        
        :global(.glow-effect) {
          animation: soft-glow 3.5s ease-in-out infinite;
        }

        :global(.glow-effect-premium) {
          animation: soft-glow-premium 3s ease-in-out infinite;
        }

        :global(button:not(:disabled):hover) {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
