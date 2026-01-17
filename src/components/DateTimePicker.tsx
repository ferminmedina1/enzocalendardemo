'use client';

import { useMemo, useState } from 'react';
import { format, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeSlot } from '@/types/database';
import Calendar from './Calendar';
import * as ScrollArea from '@radix-ui/react-scroll-area';

interface DateTimePickerProps {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotClick: (slot: TimeSlot) => void;
  onNextClick: () => void;
  loading?: boolean;
}

export default function DateTimePicker({
  slots,
  selectedSlot,
  onSlotClick,
  onNextClick,
  loading = false,
}: DateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Ventana: desde +12h hasta +7d
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    return {
      minDate: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      maxDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }, []);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [] as TimeSlot[];
    const target = startOfDay(selectedDate);

    return slots
      .filter((s) => s.available)
      .filter((s) => {
        const slotTime = new Date(s.start);
        if (slotTime < minDate || slotTime > maxDate) return false;

        const slotDay = startOfDay(slotTime);
        return isSameDay(slotDay, target);
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [selectedDate, slots, minDate, maxDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-10 items-start">
      {/* Left: Calendar */}
      <div className="min-w-0">
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          slots={slots}
          selectedDate={selectedDate}
          onSelectDate={(d: Date) => setSelectedDate(d)}
          weekStartsOn={1}
          size="lg"
          // Si tu Calendar soporta este filtro, genial; si no, no pasa nada.
          // Si NO existe en tu CalendarProps, borrá estas 2 líneas:
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>

      {/* Right (Time slots) */}
      <div className="min-w-0">
        {selectedDate ? (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 capitalize">
              {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
            </h3>

            {loading ? (
              <div className="py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
              </div>
            ) : selectedDateSlots.length > 0 ? (
              <ScrollArea.Root className="w-80 h-[420px]">
                <ScrollArea.Viewport className="w-full h-full pr-2">
                  <div className="space-y-3">
                    {selectedDateSlots.map((slot) => {
                      const isSelected = selectedSlot?.start === slot.start;

                      if (isSelected) {
                        return (
                          <div key={String(slot.start)} className="grid grid-cols-2 gap-2">
                            <div className="h-10 rounded-lg bg-slate-600 text-white text-sm font-semibold flex items-center justify-center">
                              {format(new Date(slot.start), 'HH:mm')}
                            </div>
                            <button
                              type="button"
                              onClick={onNextClick}
                              className="h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors"
                            >
                              Siguiente
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={String(slot.start)}
                          onClick={() => onSlotClick(slot)}
                          type="button"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                          {format(new Date(slot.start), 'HH:mm')}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea.Viewport>

                <ScrollArea.Scrollbar
                  orientation="vertical"
                  className="flex w-2.5 touch-none select-none p-0.5"
                >
                  <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-200" />

                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-500 text-sm">No hay horarios disponibles</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10" />
        )}
      </div>
    </div>
  );
}
