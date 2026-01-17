/**
 * Database types generated from Supabase schema
 * These types ensure type-safety across the entire application
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          created_by: string | null;
          is_public: boolean;
          event_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          created_by?: string | null;
          is_public?: boolean;
          event_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          created_by?: string | null;
          is_public?: boolean;
          event_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string;
          phone: string | null;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email: string;
          phone?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      availability_rules: {
        Row: {
          id: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      upcoming_events_with_bookings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          created_by: string | null;
          is_public: boolean;
          event_type: string;
          created_at: string;
          updated_at: string;
          booking_id: string | null;
          booking_name: string | null;
          booking_email: string | null;
          booking_phone: string | null;
          booking_notes: string | null;
          booking_status: string | null;
        };
      };
    };
    Functions: {
      check_event_overlap: {
        Args: {
          p_start_time: string;
          p_end_time: string;
          p_event_id?: string;
        };
        Returns: boolean;
      };
    };
  };
}

// ============================================
// ENTITY TYPES (Business Logic Types)
// ============================================

export type Event = Database['public']['Tables']['events']['Row'];
export type InsertEvent = Database['public']['Tables']['events']['Insert'];
export type UpdateEvent = Database['public']['Tables']['events']['Update'];

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type InsertBooking = Database['public']['Tables']['bookings']['Insert'];
export type UpdateBooking = Database['public']['Tables']['bookings']['Update'];

export type AvailabilityRule = Database['public']['Tables']['availability_rules']['Row'];
export type InsertAvailabilityRule = Database['public']['Tables']['availability_rules']['Insert'];
export type UpdateAvailabilityRule = Database['public']['Tables']['availability_rules']['Update'];

// ============================================
// DOMAIN TYPES
// ============================================

export type EventType = 'meeting' | 'booking' | 'block' | 'personal';
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface EventWithBooking extends Event {
  booking?: Booking | null;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  eventId?: string;
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  slots: TimeSlot[];
}

export interface AvailabilityConfig {
  slotDuration: number; // in minutes
  bufferTime: number; // in minutes between slots
  advanceBookingDays: number; // how far in advance can bookings be made
  minNoticeHours: number; // minimum hours notice required for booking
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// CALENDAR SETTINGS TYPES
// ============================================

export interface CalendarSettings {
  id: string;
  user_id: string;
  slot_duration: number;
  buffer_time: number;
  advance_booking_days: number;
  min_notice_hours: number;
}

export interface DaySchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface FullCalendarConfig {
  settings: CalendarSettings;
  schedule: DaySchedule[];
}

// Day names in Spanish
export const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

// Default settings
export const DEFAULT_SETTINGS: Omit<CalendarSettings, 'id' | 'user_id'> = {
  slot_duration: 30,
  buffer_time: 0,
  advance_booking_days: 60,
  min_notice_hours: 12,
};

// Default schedule (Monday to Friday, 9-18)
export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day_of_week: 0, start_time: '09:00', end_time: '18:00', is_active: false }, // Sunday
  { day_of_week: 1, start_time: '09:00', end_time: '18:00', is_active: true },  // Monday
  { day_of_week: 2, start_time: '09:00', end_time: '18:00', is_active: true },  // Tuesday
  { day_of_week: 3, start_time: '09:00', end_time: '18:00', is_active: true },  // Wednesday
  { day_of_week: 4, start_time: '09:00', end_time: '18:00', is_active: true },  // Thursday
  { day_of_week: 5, start_time: '09:00', end_time: '18:00', is_active: true },  // Friday
  { day_of_week: 6, start_time: '09:00', end_time: '18:00', is_active: false }, // Saturday
];
