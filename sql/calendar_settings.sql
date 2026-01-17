-- ============================================
-- CALENDAR SETTINGS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Table for general calendar settings
CREATE TABLE IF NOT EXISTS calendar_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_duration INTEGER NOT NULL DEFAULT 30, -- Duration in minutes
  buffer_time INTEGER NOT NULL DEFAULT 0, -- Cooldown between meetings in minutes
  advance_booking_days INTEGER NOT NULL DEFAULT 60, -- How far ahead users can book
  min_notice_hours INTEGER NOT NULL DEFAULT 12, -- Minimum hours notice required
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Only one settings row per user
  CONSTRAINT unique_user_settings UNIQUE (user_id),
  -- Validations
  CONSTRAINT valid_slot_duration CHECK (slot_duration >= 15 AND slot_duration <= 480),
  CONSTRAINT valid_buffer_time CHECK (buffer_time >= 0 AND buffer_time <= 120),
  CONSTRAINT valid_advance_days CHECK (advance_booking_days >= 1 AND advance_booking_days <= 365),
  CONSTRAINT valid_notice_hours CHECK (min_notice_hours >= 0 AND min_notice_hours <= 168)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_calendar_settings_user ON calendar_settings(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_calendar_settings_updated_at
BEFORE UPDATE ON calendar_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES FOR CALENDAR_SETTINGS
-- ============================================

ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read calendar settings (needed for public booking page)
CREATE POLICY "Calendar settings are viewable by everyone"
ON calendar_settings FOR SELECT
USING (true);

-- Only authenticated admin can create their settings
CREATE POLICY "Admin can create own settings"
ON calendar_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Only authenticated admin can update their settings
CREATE POLICY "Admin can update own settings"
ON calendar_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only authenticated admin can delete their settings
CREATE POLICY "Admin can delete own settings"
ON calendar_settings FOR DELETE
TO authenticated
USING (user_id = auth.uid());
