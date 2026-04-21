-- DELTA MIGRATION: ADD WEDDING_ID
-- Add multitenancy support to already created tables.

-- 1. Add columns with default value
ALTER TABLE confirmacoes ADD COLUMN IF NOT EXISTS wedding_id UUID DEFAULT 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';
ALTER TABLE chaves_pix ADD COLUMN IF NOT EXISTS wedding_id UUID DEFAULT 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';
ALTER TABLE lista_presentes ADD COLUMN IF NOT EXISTS wedding_id UUID DEFAULT 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a';

-- 2. Drop old generic policies
DROP POLICY IF EXISTS "Public Read/Write Confirmations" ON confirmacoes;
DROP POLICY IF EXISTS "Public Read/Write Pix" ON chaves_pix;
DROP POLICY IF EXISTS "Public Read/Write Gifts" ON lista_presentes;

-- 3. Create isolated policies for specific Wedding ID
CREATE POLICY "Isolated Read Confirmations" ON confirmacoes FOR SELECT TO anon 
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Isolated Insert Confirmations" ON confirmacoes FOR INSERT TO anon 
WITH CHECK (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Isolated Read Pix" ON chaves_pix FOR SELECT TO anon 
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Isolated Manage Pix" ON chaves_pix FOR ALL TO anon 
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Isolated Read Gifts" ON lista_presentes FOR SELECT TO anon 
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');

CREATE POLICY "Isolated Manage Gifts" ON lista_presentes FOR ALL TO anon 
USING (wedding_id = 'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a');
