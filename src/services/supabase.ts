import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../types/delivery';

const STORAGE_KEY_URL = 'kaipira_supabase_url';
const STORAGE_KEY_KEY = 'kaipira_supabase_anon_key';
const LOCAL_ORDERS_KEY = 'kaipira_local_orders';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  return {
    url: storedUrl || envUrl,
    anonKey: storedKey || envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: SupabaseConfig | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (
    cachedClient &&
    lastUsedConfig?.url === config.url &&
    lastUsedConfig?.anonKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    lastUsedConfig = config;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return null;
  }
}

// Local storage orders helper
export function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Falha ao salvar pedido local:', e);
  }
}

// Main save function: Attempts Supabase first, always persists to local storage
export async function persistOrder(order: Order): Promise<{ success: boolean; syncedWithSupabase: boolean; error?: string }> {
  // Always persist locally
  saveLocalOrder({ ...order, syncedWithSupabase: false });

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, syncedWithSupabase: false };
  }

  try {
    // Insert into orders table
    const { error: orderError } = await client.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      created_at: order.createdAt,
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      delivery_type: order.customer.deliveryType,
      street: order.customer.street,
      number: order.customer.number,
      complement: order.customer.complement,
      neighborhood: order.customer.neighborhood,
      reference_point: order.customer.reference,
      city: order.customer.city,
      cep: order.customer.cep,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      payment_method: order.payment.method,
      payment_timing: order.payment.cardPaymentTiming,
      payment_details: order.payment,
      status: order.status,
      items_json: order.items,
    });

    if (orderError) {
      console.warn('Aviso ao sincronizar pedido com Supabase:', orderError.message);
      return { success: true, syncedWithSupabase: false, error: orderError.message };
    }

    // Update local cache as synced
    saveLocalOrder({ ...order, syncedWithSupabase: true });
    return { success: true, syncedWithSupabase: true };
  } catch (err: any) {
    console.error('Erro de conexão Supabase:', err);
    return { success: true, syncedWithSupabase: false, error: err?.message || 'Falha de conexão com Supabase' };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Schema Supabase para o Restaurante Kaipira Piracicaba
-- Copie e cole este script no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
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
    payment_method TEXT NOT NULL,
    payment_timing TEXT,
    payment_details JSONB,
    status TEXT DEFAULT 'received' NOT NULL,
    items_json JSONB NOT NULL
);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política de inserção pública (permite que os clientes façam pedidos via web)
CREATE POLICY "Permitir criacao publica de pedidos" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Política de leitura pública (permite consultar status de pedidos)
CREATE POLICY "Permitir leitura publica de pedidos" 
ON public.orders FOR SELECT 
USING (true);

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
`;
