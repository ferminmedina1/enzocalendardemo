/**
 * Server Actions for Calendar Settings
 * Manage availability rules and calendar configuration
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth, getCurrentUser } from '@/utils/auth';
import type { ApiResponse, AvailabilityRule, CalendarSettings, DaySchedule } from '@/types/database';

// Local constants (cannot be exported from 'use server' files)
const DEFAULT_SETTINGS: Omit<CalendarSettings, 'id' | 'user_id'> = {
  slot_duration: 30,
  buffer_time: 0,
  advance_booking_days: 60,
  min_notice_hours: 12,
};

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day_of_week: 0, start_time: '09:00', end_time: '18:00', is_active: false },
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },
  { day_of_week: 6, start_time: '09:00', end_time: '18:00', is_active: false },
];

// ============================================
// GET SETTINGS
// ============================================

export async function getCalendarSettings(): Promise<ApiResponse<CalendarSettings>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // If table doesn't exist or error, return defaults
    if (error) {
      console.error('Error fetching settings:', error);
      // Return defaults if table doesn't exist yet
      return {
        success: true,
        data: {
          id: '',
          user_id: user.id,
          ...DEFAULT_SETTINGS,
        },
      };
    }

    // If no settings exist, return defaults (will be created on first save)
    if (!data) {
      return {
        success: true,
        data: {
          id: '',
          user_id: user.id,
          ...DEFAULT_SETTINGS,
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// ============================================
// SAVE SETTINGS
// ============================================

export async function saveCalendarSettings(
  settings: Omit<CalendarSettings, 'id' | 'user_id'>
): Promise<ApiResponse<void>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Upsert settings
    const { error } = await supabase
      .from('calendar_settings')
      .upsert(
        {
          user_id: user.id,
          slot_duration: settings.slot_duration,
          buffer_time: settings.buffer_time,
          advance_booking_days: settings.advance_booking_days,
          min_notice_hours: settings.min_notice_hours,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: 'Error al guardar la configuración' };
    }

    revalidatePath('/admin');
    revalidatePath('/appointment');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// ============================================
// GET SCHEDULE (Availability Rules)
// ============================================

export async function getSchedule(): Promise<ApiResponse<DaySchedule[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'No autenticado' };
    }
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('availability_rules')
      .select('day_of_week, start_time, end_time, is_active')
      .eq('user_id', user.id)
      .order('day_of_week');

    // If error or no data, return defaults
    if (error) {
      console.error('Error fetching schedule:', error);
      return { success: true, data: DEFAULT_SCHEDULE };
    }

    // If no rules exist, return defaults
    if (!data || data.length === 0) {
      return { success: true, data: DEFAULT_SCHEDULE };
    }

    // Merge with defaults to ensure all days are present
    const schedule = DEFAULT_SCHEDULE.map((defaultDay) => {
      const existingRule = data.find((r) => r.day_of_week === defaultDay.day_of_week);
      if (existingRule) {
        return {
          day_of_week: existingRule.day_of_week,
          start_time: existingRule.start_time,
          end_time: existingRule.end_time,
          is_active: existingRule.is_active,
        };
      }
      return defaultDay;
    });

    return { success: true, data: schedule };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// ============================================
// SAVE SCHEDULE (Availability Rules)
// ============================================

export async function saveSchedule(
  schedule: DaySchedule[]
): Promise<ApiResponse<void>> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabaseClient();

    // Delete existing rules
    await supabase
      .from('availability_rules')
      .delete()
      .eq('user_id', user.id);

    // Insert new rules (only active days or all for tracking)
    const rulesToInsert = schedule.map((day) => ({
      user_id: user.id,
      day_of_week: day.day_of_week,
      start_time: day.start_time,
      end_time: day.end_time,
      is_active: day.is_active,
    }));

    const { error } = await supabase
      .from('availability_rules')
      .insert(rulesToInsert);

    if (error) {
      console.error('Error saving schedule:', error);
      return { success: false, error: 'Error al guardar el horario' };
    }

    revalidatePath('/admin');
    revalidatePath('/appointment');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

// ============================================
// GET FULL CONFIG (for public use)
// ============================================

export async function getPublicCalendarConfig(): Promise<{
  slotDuration: number;
  bufferTime: number;
  advanceBookingDays: number;
  minNoticeHours: number;
  schedule: DaySchedule[];
}> {
  const supabase = await createServerSupabaseClient();

  // Get settings (public read)
  const { data: settings } = await supabase
    .from('calendar_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  // Get active availability rules
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('day_of_week, start_time, end_time, is_active')
    .eq('is_active', true)
    .order('day_of_week');

  return {
    slotDuration: settings?.slot_duration ?? DEFAULT_SETTINGS.slot_duration,
    bufferTime: settings?.buffer_time ?? DEFAULT_SETTINGS.buffer_time,
    advanceBookingDays: settings?.advance_booking_days ?? DEFAULT_SETTINGS.advance_booking_days,
    minNoticeHours: settings?.min_notice_hours ?? DEFAULT_SETTINGS.min_notice_hours,
    schedule: rules?.length ? rules : DEFAULT_SCHEDULE.filter((d) => d.is_active),
  };
}
