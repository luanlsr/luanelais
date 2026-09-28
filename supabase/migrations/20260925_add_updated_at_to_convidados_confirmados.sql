-- Track changes to final guest confirmations from this point forward.

ALTER TABLE convidados_confirmados
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

UPDATE convidados_confirmados
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

ALTER TABLE convidados_confirmados
ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE convidados_confirmados
ALTER COLUMN updated_at SET NOT NULL;

CREATE OR REPLACE FUNCTION set_convidados_confirmados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = COALESCE(NEW.updated_at, NOW());
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_convidados_confirmados_updated_at ON convidados_confirmados;

CREATE TRIGGER trg_convidados_confirmados_updated_at
BEFORE INSERT OR UPDATE ON convidados_confirmados
FOR EACH ROW
EXECUTE FUNCTION set_convidados_confirmados_updated_at();

CREATE INDEX IF NOT EXISTS idx_convidados_confirmados_updated_at
ON convidados_confirmados(updated_at DESC);
