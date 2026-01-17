-- ============================================
-- AGENDA BOOKING SYSTEM - DATABASE SCHEMA
-- ============================================
-- Production-ready schema with Row Level Security
-- For Supabase Postgres

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Events table: stores all calendar events (admin-created and bookings)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  event_type VARCHAR(50) DEFAULT 'meeting', -- meeting, booking, block, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (end_time - start_time <= INTERVAL '24 hours')
);

-- Bookings table: stores visitor reservations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Availability rules: defines when the admin is available
CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_day CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT valid_time_range_av CHECK (end_time > start_time)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end_time ON events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_time_range ON events(start_time, end_time);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability_rules(day_of_week);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to check for event overlaps
CREATE OR REPLACE FUNCTION check_event_overlap(
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_event_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO overlap_count
  FROM events
  WHERE
    (id != p_event_id OR p_event_id IS NULL)
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );
  
  RETURN overlap_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;

-- ==================== EVENTS POLICIES ====================

-- Policy: Anyone can read public events
CREATE POLICY "Public events are viewable by everyone"
ON events FOR SELECT
USING (is_public = true);

-- Policy: Authenticated admin can read all events
CREATE POLICY "Admin can view all events"
ON events FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Policy: Only authenticated admin can create events
CREATE POLICY "Admin can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Policy: Only event creator can update their events
CREATE POLICY "Admin can update own events"
ON events FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy: Only event creator can delete their events
CREATE POLICY "Admin can delete own events"
ON events FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ==================== BOOKINGS POLICIES ====================

-- Policy: Anyone can create a booking (visitors)
CREATE POLICY "Anyone can create bookings"
ON bookings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Admin can view all bookings
CREATE POLICY "Admin can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.created_by = auth.uid()
  )
);

-- Policy: Admin can update bookings for their events
CREATE POLICY "Admin can update own event bookings"
ON bookings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.created_by = auth.uid()
  )
);

-- Policy: Admin can delete bookings for their events
CREATE POLICY "Admin can delete own event bookings"
ON bookings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = bookings.event_id
    AND events.created_by = auth.uid()
  )
);

-- ==================== AVAILABILITY RULES POLICIES ====================

-- Policy: Admin can read their own availability rules
CREATE POLICY "Admin can view own availability"
ON availability_rules FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admin can create their own availability rules
CREATE POLICY "Admin can create own availability"
ON availability_rules FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Admin can update their own availability rules
CREATE POLICY "Admin can update own availability"
ON availability_rules FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admin can delete their own availability rules
CREATE POLICY "Admin can delete own availability"
ON availability_rules FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Get all upcoming events with booking info
CREATE OR REPLACE VIEW upcoming_events_with_bookings AS
SELECT
  e.*,
  b.id as booking_id,
  b.name as booking_name,
  b.email as booking_email,
  b.phone as booking_phone,
  b.notes as booking_notes,
  b.status as booking_status
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
WHERE e.end_time >= NOW()
ORDER BY e.start_time ASC;

-- ============================================
-- SEED DATA (OPTIONAL - for development)
-- ============================================

-- Insert default availability rules for the admin
-- Run this after creating your admin user
-- UPDATE: user_id with your actual admin user ID

/*
INSERT INTO availability_rules (user_id, day_of_week, start_time, end_time) VALUES
  ('YOUR_ADMIN_USER_ID', 1, '09:00', '17:00'), -- Monday
  ('YOUR_ADMIN_USER_ID', 2, '09:00', '17:00'), -- Tuesday
  ('YOUR_ADMIN_USER_ID', 3, '09:00', '17:00'), -- Wednesday
  ('YOUR_ADMIN_USER_ID', 4, '09:00', '17:00'), -- Thursday
  ('YOUR_ADMIN_USER_ID', 5, '09:00', '13:00'); -- Friday
*/
