-- MASTER WEDDING SCHEMA
-- Consolidates all tables: Confirmations (RSVP), Pix, and Gifts List.
-- Execute this single script in the Supabase SQL Editor.

-- 1. Table: confirmacoes (Guest Registry)
CREATE TABLE IF NOT EXISTS confirmacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  children JSONB DEFAULT '[]'::jsonb, -- Store list of kids: { name: string, age: string }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: chaves_pix (Finance Configuration)
CREATE TABLE IF NOT EXISTS chaves_pix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_value TEXT NOT NULL,
  key_type TEXT DEFAULT 'email',
  holder_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: lista_presentes (Gift Registry)
CREATE TABLE IF NOT EXISTS lista_presentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10, 2),
  buy_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SECURITY (RLS)
-- =============================================

ALTER TABLE confirmacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chaves_pix ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_presentes ENABLE ROW LEVEL SECURITY;

-- Policies for Anon usage (Simplest for static landing pages)
CREATE POLICY "Public Read/Write Confirmations" ON confirmacoes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Pix" ON chaves_pix FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Gifts" ON lista_presentes FOR ALL TO anon USING (true) WITH CHECK (true);
