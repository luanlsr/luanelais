-- EXTEND GIFTS METADATA
-- Adding rich filtering columns to the marketplace system.

ALTER TABLE lista_presentes 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Outros',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update the seed item if it exists
UPDATE lista_presentes 
SET 
  title = 'Air Fryer',
  subtitle = 'Electrolux Air Fryer Forno 5 em 1 12L 1700W',
  brand = 'Electrolux',
  category = 'Eletroportáteis',
  is_featured = true
WHERE title LIKE '%Electrolux Air Fryer%';
