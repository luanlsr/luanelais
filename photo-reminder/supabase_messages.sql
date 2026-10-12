-- ==========================================
-- MIGRATION: MENSAGENS DOS CONVIDADOS
-- ==========================================

-- 1. Criar a tabela de mensagens (se não existir)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_image TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS na tabela de mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Criar política para permitir que qualquer um leia as mensagens
-- Usamos um bloco DO para evitar erro se a política já existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'Mensagens são públicas para leitura'
    ) THEN
        CREATE POLICY "Mensagens são públicas para leitura" 
        ON public.messages FOR SELECT 
        USING (true);
    END IF;
END
$$;

-- 4. Criar política para permitir inserção de mensagens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'messages' AND policyname = 'Permitir inserção de mensagens'
    ) THEN
        CREATE POLICY "Permitir inserção de mensagens" 
        ON public.messages FOR INSERT 
        WITH CHECK (true);
    END IF;
END
$$;
