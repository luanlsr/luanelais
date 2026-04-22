-- ── CREATE GIFT CATEGORIES TABLE ──
-- This table allows dynamic management of categories for the gift marketplace.

CREATE TABLE IF NOT EXISTS categorias_presentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster filtering by wedding
CREATE INDEX IF NOT EXISTS idx_categories_wedding ON categorias_presentes(wedding_id);

-- ── SEED INITIAL CATEGORIES ──
-- Populate with standard professional categories for the specific wedding ID.

INSERT INTO categorias_presentes (wedding_id, name) VALUES 
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Eletroportáteis'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Cozinha & Utensílios'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Cama, Mesa & Banho'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Sala de Estar'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Sala de Jantar'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Quarto do Casal'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Decoração & Design'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Limpeza & Lavanderia'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Eletrodomésticos'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Tecnologia & Smart Home'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Área de Churrasco & Lazer'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Bar & Adega'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Experiências & Viagens'),
('c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 'Cotas de Lua de Mel')
ON CONFLICT DO NOTHING;
