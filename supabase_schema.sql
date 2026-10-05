-- ===============================================================
-- RESTAURANTE KAIPIRA PIRACICABA - SUPABASE DATABASE SCHEMA
-- Endereço: Av. Pompéia, 1018 - Piracicamirim, Piracicaba - SP
-- ===============================================================
-- Como usar:
-- 1. Acesse https://supabase.com e abra seu projeto.
-- 2. Vá em 'SQL Editor' no menu lateral esquerdo.
-- 3. Cole o código abaixo e clique em 'Run'.
-- 4. Copie sua URL e Chave Anon (em Project Settings -> API)
--    e adicione no app ou no arquivo .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
-- ===============================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL, -- 'delivery' ou 'pickup'
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    reference_point TEXT,
    city TEXT DEFAULT 'Piracicaba - SP',
    cep TEXT DEFAULT '13425-060',
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'pix', 'credit_card', 'debit_card', 'cash'
    payment_timing TEXT, -- 'on_delivery' ou 'online'
    payment_details JSONB,
    status TEXT DEFAULT 'received' NOT NULL, -- 'received', 'preparing', 'dispatched', 'delivered'
    items_json JSONB NOT NULL
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política de inserção pública (permite que clientes façam pedidos pelo app)
CREATE POLICY "Permitir criacao publica de pedidos" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Política de consulta pública (permite acompanhar o pedido pelo código)
CREATE POLICY "Permitir leitura publica de pedidos" 
ON public.orders FOR SELECT 
USING (true);

-- Criar tabela para produtos/cardápio opcional
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica do cardapio" 
ON public.menu_items FOR SELECT 
USING (true);

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
