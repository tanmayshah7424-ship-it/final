-- Add description and updated_at to players table
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Enable RLS on players (if not already enabled)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for players
DROP POLICY IF EXISTS "Enable read for public" ON public.players;
CREATE POLICY "Enable read for public" ON public.players
FOR SELECT USING (true);

-- Policy: Admin/Superadmin update access
DROP POLICY IF EXISTS "Admin update player bios" ON public.players;
CREATE POLICY "Admin update player bios" ON public.players
FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'superadmin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'superadmin')
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_players_updated_at ON public.players;
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
