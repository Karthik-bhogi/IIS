-- Clean up unused columns in the entries table
ALTER TABLE public.entries 
  DROP COLUMN IF EXISTS meetings,
  DROP COLUMN IF EXISTS people_met,
  DROP COLUMN IF EXISTS voice_notes,
  DROP COLUMN IF EXISTS files,
  DROP COLUMN IF EXISTS decisions,
  DROP COLUMN IF EXISTS reflections;

-- Clean up unused columns in the meetings table
ALTER TABLE public.meetings
  DROP COLUMN IF EXISTS participants;
