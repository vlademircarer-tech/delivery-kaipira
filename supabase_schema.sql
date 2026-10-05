-- ===============================================================
-- RESTAURANTE KAIPIRA PIRACICABA - SUPABASE DATABASE SCHEMA
-- Endereço: Av. Pompéia, 1018 - Piracicamirim, Piracicaba - SP
-- Modo: 100% em Nuvem (Sem armazenamento local)
-- ===============================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    cep TEXT DEFAULT '13425-060',
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    reference_point TEXT,
    city TEXT DEFAULT 'Piracicaba - SP',
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_timing TEXT,
    payment_details JSONB,
    status TEXT DEFAULT 'received' NOT NULL,
    status_updates JSONB DEFAULT '[]'::jsonb,
    items_json JSONB NOT NULL
);

-- Tabela de Clientes com busca de CEP
CREATE TABLE IF NOT EXISTS public.customers (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    cep TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Piracicaba - SP',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir criacao publica de pedidos" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura publica de pedidos" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Permitir atualizacao de pedidos" 
ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Permitir gestao de clientes" 
ON public.customers FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
