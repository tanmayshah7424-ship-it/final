-- Add short_description and image_url to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify RLS is enabled and policies allow read access (already done in previous migration)
-- But ensuring columns are accessible
GRANT SELECT ON public.players TO anon, authenticated;
