-- Add sport column to players table for better Wikipedia disambiguation
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS sport TEXT;

-- Update the comment to describe usage
COMMENT ON COLUMN public.players.sport IS 'Professional sport of the player (e.g., cricket, football) used for Wikipedia search fallbacks.';
