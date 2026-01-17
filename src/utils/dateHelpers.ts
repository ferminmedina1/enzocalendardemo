/**
 * Date and time utility functions
 * All dates use date-fns for consistent timezone handling
 */
import {
  format,
  parseISO,
  isWithinInterval,
  addMinutes,
  addDays,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  isSameDay,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  setHours,
  setMinutes,
} from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// FORMATTING
// ============================================

export const formatDate = (date: Date | string, formatStr = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP HH:mm', { locale: es });
};

export const formatTimeRange = (start: Date | string, end: Date | string): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

// ============================================
// VALIDATION
// ============================================

export const isValidTimeRange = (start: Date, end: Date): boolean => {
  return isBefore(start, end);
};

export const isInPast = (date: Date): boolean => {
  return isBefore(date, new Date());
};

export const isInFuture = (date: Date): boolean => {
  return isAfter(date, new Date());
};

export const hasMinimumNotice = (date: Date, minHours: number): boolean => {
  const minDate = addMinutes(new Date(), minHours * 60);
  return isAfter(date, minDate);
};

// ============================================
// TIME SLOT GENERATION
// ============================================

export interface TimeSlotConfig {
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '17:00'
  slotDuration: number; // in minutes
  bufferTime?: number; // in minutes
}

export const generateTimeSlots = (
  date: Date,
  config: TimeSlotConfig
): { start: Date; end: Date }[] => {
  const slots: { start: Date; end: Date }[] = [];
  const [startHour, startMin] = config.startTime.split(':').map(Number);
  const [endHour, endMin] = config.endTime.split(':').map(Number);

  let currentSlot = setMinutes(setHours(date, startHour), startMin);
  const dayEnd = setMinutes(setHours(date, endHour), endMin);

  while (isBefore(currentSlot, dayEnd)) {
    const slotEnd = addMinutes(currentSlot, config.slotDuration);
    
    if (isBefore(slotEnd, dayEnd) || slotEnd.getTime() === dayEnd.getTime()) {
      slots.push({
        start: new Date(currentSlot),
        end: new Date(slotEnd),
      });
    }

    currentSlot = addMinutes(slotEnd, config.bufferTime || 0);
  }

  return slots;
};

// ============================================
// OVERLAP DETECTION
// ============================================

export const doTimesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return (
    (isBefore(start1, end2) && isAfter(end1, start2)) ||
    (isBefore(start2, end1) && isAfter(end2, start1))
  );
};

export const isSlotAvailable = (
  slotStart: Date,
  slotEnd: Date,
  bookedSlots: { start: Date; end: Date }[]
): boolean => {
  return !bookedSlots.some((booked) =>
    doTimesOverlap(slotStart, slotEnd, booked.start, booked.end)
  );
};

// ============================================
// CALENDAR HELPERS
// ============================================

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getDayOfWeek = (date: Date): number => {
  return getDay(date); // 0 = Sunday, 1 = Monday, etc.
};

export const isSameDayHelper = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const getDateRange = (startDate: Date, days: number): Date[] => {
  return Array.from({ length: days }, (_, i) => addDays(startDate, i));
};

// ============================================
// DURATION CALCULATIONS
// ============================================

export const getDurationInMinutes = (start: Date, end: Date): number => {
  return differenceInMinutes(end, start);
};

export const getDurationDisplay = (start: Date, end: Date): string => {
  const minutes = getDurationInMinutes(start, end);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// ============================================
// TIMEZONE HANDLING
// ============================================

export const toUTC = (date: Date): string => {
  return date.toISOString();
};

export const fromUTC = (dateString: string): Date => {
  return parseISO(dateString);
};

// ============================================
// BUSINESS LOGIC HELPERS
// ============================================

export const getAvailableDates = (
  advanceDays: number,
  excludedDates: Date[] = []
): Date[] => {
  const today = startOfDay(new Date());
  const dates = getDateRange(today, advanceDays);

  return dates.filter(
    (date) => !excludedDates.some((excluded) => isSameDay(date, excluded))
  );
};

export const isWithinBookingWindow = (
  date: Date,
  minNoticeHours: number,
  maxAdvanceDays: number
): boolean => {
  const now = new Date();
  const minDate = addMinutes(now, minNoticeHours * 60);
  const maxDate = addDays(now, maxAdvanceDays);

  return isWithinInterval(date, { start: minDate, end: maxDate });
};
