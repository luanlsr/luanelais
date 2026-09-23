-- FIX: restore RSVP/guest visibility and management for the wedding app.
-- Run this in Supabase after the previous schema migrations.

ALTER TABLE confirmacoes
ADD COLUMN IF NOT EXISTS wedding_id UUID DEFAULT 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';

ALTER TABLE confirmacoes
ADD COLUMN IF NOT EXISTS is_attending BOOLEAN DEFAULT TRUE;

-- This project has a single wedding configured in the frontend. If older rows
-- were inserted before wedding_id existed, or with a different value, they must
-- be attached to the app's current wedding_id to appear in /admin.
UPDATE confirmacoes
SET wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a'
WHERE wedding_id IS DISTINCT FROM 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';

UPDATE confirmacoes
SET is_attending = TRUE
WHERE is_attending IS NULL;

ALTER TABLE confirmacoes ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE confirmacoes TO anon, authenticated;

DROP POLICY IF EXISTS "Public Read/Write Confirmations" ON confirmacoes;
DROP POLICY IF EXISTS "Isolated Read Confirmations" ON confirmacoes;
DROP POLICY IF EXISTS "Isolated Insert Confirmations" ON confirmacoes;
DROP POLICY IF EXISTS "Public Confirmations Access" ON confirmacoes;
DROP POLICY IF EXISTS "Guest RSVP Registration" ON confirmacoes;
DROP POLICY IF EXISTS "Admin RSVP Management" ON confirmacoes;
DROP POLICY IF EXISTS "Admin RSVP Update" ON confirmacoes;

CREATE POLICY "Wedding RSVP Read"
ON confirmacoes FOR SELECT
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Wedding RSVP Insert"
ON confirmacoes FOR INSERT
TO anon, authenticated
WITH CHECK (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Wedding RSVP Update"
ON confirmacoes FOR UPDATE
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a')
WITH CHECK (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Wedding RSVP Delete"
ON confirmacoes FOR DELETE
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');
