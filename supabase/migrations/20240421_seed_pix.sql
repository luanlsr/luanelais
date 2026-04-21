-- SEED: INITIAL PIX CONFIGURATION
-- Sets up the default Pix key for the wedding portal.

INSERT INTO chaves_pix (wedding_id, key_value, key_type, holder_name)
VALUES (
  'c28206d4-9c4b-4cb3-8a4a-9045e7b0bd8a', 
  '21966785809', 
  'cell', 
  'Luan da Silva Ramalho' -- Você pode alterar o nome do titular aqui ou no painel admin
)
ON CONFLICT (id) DO NOTHING;
