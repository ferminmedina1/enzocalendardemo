/**
 * Server Actions for Available Slots
 * Calculate and return available time slots for booking
 */
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  generateTimeSlots,
  isSlotAvailable,
  getDateRange,
  getDayOfWeek,
  fromUTC,
} from '@/utils/dateHelpers';
import type { TimeSlot, AvailabilityRule } from '@/types/database';

interface GetAvailableSlotsParams {
  startDate: Date;
  days?: number;
  slotDuration?: number;
  bufferTime?: number;
}

// Default availability: Monday to Friday, 9 AM to 6 PM
const DEFAULT_AVAILABILITY_RULES: AvailabilityRule[] = [
  { id: '1', user_id: 'default', day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true, created_at: new Date().toISOString() },
  { id: '2', user_id: 'default', day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true, created_at: new Date().toISOString() },
  { id: '3', user_id: 'default', day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true, created_at: new Date().toISOString() },
  { id: '4', user_id: 'default', day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true, created_at: new Date().toISOString() },
  { id: '5', user_id: 'default', day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true, created_at: new Date().toISOString() },
];

export async function getAvailableSlots(
  params: GetAvailableSlotsParams
): Promise<TimeSlot[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { startDate, days = 60, slotDuration = 30, bufferTime = 0 } = params;

    // Get all public events in the date range (these are BOOKED slots)
    const dateRange = getDateRange(startDate, days);
    const endDate = dateRange[dateRange.length - 1];

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, start_time, end_time, is_public')
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .eq('is_public', true);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    // Get availability rules
    let rules: AvailabilityRule[] | null = null;
    const { data: rulesData, error: rulesError } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('is_active', true);

    if (!rulesError && rulesData && rulesData.length > 0) {
      rules = rulesData;
    } else {
      // Use default availability rules if none are set in the database
      rules = DEFAULT_AVAILABILITY_RULES;
    }

    // Generate slots for each day
    const allSlots: TimeSlot[] = [];

    for (const date of dateRange) {
      const dayOfWeek = getDayOfWeek(date);
      
      // Find availability rule for this day
      const dayRule = rules?.find((r) => r.day_of_week === dayOfWeek);
      
      if (!dayRule) {
        continue; // No availability for this day (weekend, etc)
      }

      // Generate time slots for this day
      const daySlots = generateTimeSlots(date, {
        startTime: dayRule.start_time,
        endTime: dayRule.end_time,
        slotDuration,
        bufferTime,
      });

      // Convert booked events to date objects for this day
      const bookedSlots = (events || [])
        ?.filter((event) => {
          const eventStart = fromUTC(event.start_time);
          return eventStart.toDateString() === date.toDateString();
        })
        .map((event) => ({
          start: fromUTC(event.start_time),
          end: fromUTC(event.end_time),
        })) || [];

      // Check availability for each slot
      for (const slot of daySlots) {
        const available = isSlotAvailable(slot.start, slot.end, bookedSlots);
        
        allSlots.push({
          start: slot.start,
          end: slot.end,
          available,
        });
      }
    }

    return allSlots;
  } catch (error) {
    console.error('Unexpected error getting available slots:', error);
    return [];
  }
}

export async function getAvailableSlotsForDay(
  date: Date,
  slotDuration = 30,
  bufferTime = 0
): Promise<TimeSlot[]> {
  return getAvailableSlots({
    startDate: date,
    days: 1,
    slotDuration,
    bufferTime,
  });
}