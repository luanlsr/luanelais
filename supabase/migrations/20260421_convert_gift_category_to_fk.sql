-- ── CONVERT GIFT CATEGORY TO FOREIGN KEY ──
-- This migration transforms the 'category' text column into a UUID foreign key referencing 'categorias_presentes'.

-- 1. Add temporary category_id column
ALTER TABLE lista_presentes ADD COLUMN IF NOT EXISTS category_id UUID;

-- 2. Link existing gifts to categories by NAME match
-- Matches categories for the same wedding ID
UPDATE lista_presentes lp
SET category_id = cp.id
FROM categorias_presentes cp
WHERE lp.category = cp.name AND lp.wedding_id = cp.wedding_id;

-- 3. Clean up the old column
-- Step A: Drop old text column
ALTER TABLE lista_presentes DROP COLUMN category;

-- Step B: Rename ID column to 'category'
ALTER TABLE lista_presentes RENAME COLUMN category_id TO category;

-- 4. Set the Foreign Key constraint
ALTER TABLE lista_presentes 
ADD CONSTRAINT fk_gift_category 
FOREIGN KEY (category) 
REFERENCES categorias_presentes(id)
ON DELETE SET NULL;

-- 5. Add index for join optimization
CREATE INDEX IF NOT EXISTS idx_gifts_category_fk ON lista_presentes(category);
