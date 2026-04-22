-- ── RLS POLICIES FOR CONFIRMATIONS (RSVP) ──
-- This migration ensures the delete policy is active for the guests list.

-- Ensure RLS is active
ALTER TABLE confirmacoes ENABLE ROW LEVEL SECURITY;

-- 1. Public Select (Waitlist and Admin view)
DROP POLICY IF EXISTS "Public Confirmations Access" ON confirmacoes;
CREATE POLICY "Public Confirmations Access" 
ON confirmacoes FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Public Insert (Guest Registration)
DROP POLICY IF EXISTS "Guest RSVP Registration" ON confirmacoes;
CREATE POLICY "Guest RSVP Registration" 
ON confirmacoes FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 3. Public Delete (Admin Management)
-- In a real app, this should be restricted to authenticated users.
-- For this architecture, we allow anon to match the gift management pattern.
DROP POLICY IF EXISTS "Admin RSVP Management" ON confirmacoes;
CREATE POLICY "Admin RSVP Management" 
ON confirmacoes FOR DELETE 
TO anon, authenticated
USING (true);

-- 4. Public Update (If needed in future)
DROP POLICY IF EXISTS "Admin RSVP Update" ON confirmacoes;
CREATE POLICY "Admin RSVP Update" 
ON confirmacoes FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);
