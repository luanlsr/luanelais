-- SAVE THE DATE: final guest confirmations.
-- This table stores the definitive attendance response used by the admin guest list.

CREATE TABLE IF NOT EXISTS convidados_confirmados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL DEFAULT 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a',
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_attending BOOLEAN NOT NULL DEFAULT TRUE,
  children JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_convidados_confirmados_wedding
ON convidados_confirmados(wedding_id);

CREATE INDEX IF NOT EXISTS idx_convidados_confirmados_created_at
ON convidados_confirmados(created_at DESC);

-- Keep existing RSVP data available in the new final list.
INSERT INTO convidados_confirmados (
  id,
  wedding_id,
  full_name,
  phone,
  email,
  is_attending,
  children,
  created_at
)
SELECT
  id,
  COALESCE(wedding_id, 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a'),
  full_name,
  phone,
  email,
  COALESCE(is_attending, TRUE),
  COALESCE(children, '[]'::jsonb),
  created_at
FROM confirmacoes
ON CONFLICT (id) DO NOTHING;

ALTER TABLE convidados_confirmados ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE convidados_confirmados TO anon, authenticated;

DROP POLICY IF EXISTS "Final Guests Read" ON convidados_confirmados;
DROP POLICY IF EXISTS "Final Guests Insert" ON convidados_confirmados;
DROP POLICY IF EXISTS "Final Guests Update" ON convidados_confirmados;
DROP POLICY IF EXISTS "Final Guests Delete" ON convidados_confirmados;

CREATE POLICY "Final Guests Read"
ON convidados_confirmados FOR SELECT
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Final Guests Insert"
ON convidados_confirmados FOR INSERT
TO anon, authenticated
WITH CHECK (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Final Guests Update"
ON convidados_confirmados FOR UPDATE
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a')
WITH CHECK (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Final Guests Delete"
ON convidados_confirmados FOR DELETE
TO anon, authenticated
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');
