-- ============================================
-- Vedantu AlumConnect — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Alumni profiles table
CREATE TABLE alumni_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT,

  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  profile_photo_url TEXT,

  -- Vedantu journey
  vedantu_study_years TEXT NOT NULL,        -- e.g. "2014–2017"
  vedantu_classes TEXT NOT NULL,            -- e.g. "Class 10, 11, 12"
  vedantu_subjects TEXT[],                  -- ["Physics", "Maths", "Chemistry"]

  -- College & education
  college_name TEXT NOT NULL,
  degree TEXT NOT NULL,                     -- e.g. "B.Tech Computer Science"
  college_year_of_passing INTEGER,

  -- Current status
  current_company TEXT,
  current_role TEXT,
  current_city TEXT,
  field TEXT NOT NULL,                      -- Engineering / Medicine / Finance / Civil Services / Law / Design / Other
  specialization TEXT,                      -- e.g. "MBBS", "CA", "IAS"

  -- Exam & achievement
  exam_cleared TEXT,                        -- JEE / NEET / CAT / UPSC / CLAT / CA / Other
  rank_or_result TEXT,                      -- e.g. "AIR 89", "99.2 Percentile"

  -- Profile
  bio TEXT,
  linkedin_url TEXT,
  tags TEXT[],                              -- ["DSA", "Biology", "Study Plan"]

  -- Mentorship preferences
  available_for_mentoring BOOLEAN DEFAULT TRUE,
  session_preference TEXT DEFAULT 'both' CHECK (session_preference IN ('1on1', 'group', 'both')),
  preferred_session_duration INTEGER DEFAULT 45, -- minutes

  -- Meta
  referral_source TEXT                      -- how did they hear about this
);

-- Enable RLS
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (public form submission)
CREATE POLICY "Anyone can submit alumni form"
  ON alumni_profiles FOR INSERT
  WITH CHECK (true);

-- Only approved profiles are publicly readable
CREATE POLICY "Public can read approved profiles"
  ON alumni_profiles FOR SELECT
  USING (status = 'approved');

-- Service role (admin) can read/update all
CREATE POLICY "Service role has full access"
  ON alumni_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Storage bucket for profile photos
-- Run this in Supabase Storage settings or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('alumni-photos', 'alumni-photos', true)
ON CONFLICT DO NOTHING;

-- Allow anyone to upload to alumni-photos
CREATE POLICY "Anyone can upload alumni photo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'alumni-photos');

-- Anyone can view photos (public bucket)
CREATE POLICY "Public can view alumni photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'alumni-photos');

-- Indexes for performance
CREATE INDEX idx_alumni_status ON alumni_profiles(status);
CREATE INDEX idx_alumni_field ON alumni_profiles(field);
CREATE INDEX idx_alumni_created ON alumni_profiles(created_at DESC);
CREATE INDEX idx_alumni_email ON alumni_profiles(email);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alumni_updated_at
  BEFORE UPDATE ON alumni_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
