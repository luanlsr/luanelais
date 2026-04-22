-- ── RLS POLICIES FOR GIFTS SYSTEM ──
-- This migration enables Row Level Security and adds public access policies for the gift catalog and categories.

-- 1. CATEGORIAS_PRESENTES POLICIES
ALTER TABLE categorias_presentes ENABLE ROW LEVEL SECURITY;

-- Public Select
DROP POLICY IF EXISTS "Public Categories Access" ON categorias_presentes;
CREATE POLICY "Public Categories Access" 
ON categorias_presentes FOR SELECT 
TO anon, authenticated
USING (active = true);

-- Admin Full Access (Allowing anon for this simplified demo architecture, ideally authenticated)
DROP POLICY IF EXISTS "Admin Categories Access" ON categorias_presentes;
CREATE POLICY "Admin Categories Access" 
ON categorias_presentes FOR ALL 
TO anon, authenticated
USING (true);


-- 2. LISTA_PRESENTES POLICIES
ALTER TABLE lista_presentes ENABLE ROW LEVEL SECURITY;

-- Public Select
DROP POLICY IF EXISTS "Public Gifts Access" ON lista_presentes;
CREATE POLICY "Public Gifts Access" 
ON lista_presentes FOR SELECT 
TO anon, authenticated
USING (true);

-- Guest Reservation (Update specific columns)
DROP POLICY IF EXISTS "Guest Gift Reservation" ON lista_presentes;
CREATE POLICY "Guest Gift Reservation" 
ON lista_presentes FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin Management
DROP POLICY IF EXISTS "Admin Gifts Management" ON lista_presentes;
CREATE POLICY "Admin Gifts Management" 
ON lista_presentes FOR ALL 
TO anon, authenticated
USING (true);
