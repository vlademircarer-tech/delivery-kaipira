import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderStatus, CustomerData } from '../types/delivery';

// Memory-only storage for session (STRICTLY NO LOCALSTORAGE AS REQUESTED)
let memoryOrders: Order[] = [];
let memoryCustomers: CustomerData[] = [];

// Supabase environment keys or runtime memory config
let memorySupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let memorySupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseConfig() {
  return {
    url: memorySupabaseUrl,
    anonKey: memorySupabaseAnonKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  memorySupabaseUrl = url.trim();
  memorySupabaseAnonKey = anonKey.trim();
  cachedClient = null; // reset cached client
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!memorySupabaseUrl || !memorySupabaseAnonKey) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(memorySupabaseUrl, memorySupabaseAnonKey);
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return null;
  }
}

// Fetch all orders from Supabase Cloud
export async function fetchCloudOrders(): Promise<{ orders: Order[]; source: 'cloud' | 'memory'; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { orders: memoryOrders, source: 'memory' };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar pedidos no Supabase:', error.message);
      return { orders: memoryOrders, source: 'memory', error: error.message };
    }

    if (data && Array.isArray(data)) {
      const parsedOrders: Order[] = data.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number || row.id,
        createdAt: row.created_at,
        customer: {
          name: row.customer_name,
          phone: row.customer_phone,
          deliveryType: row.delivery_type || 'delivery',
          cep: row.cep || '13425-060',
          street: row.street || '',
          number: row.number || '',
          complement: row.complement || '',
          neighborhood: row.neighborhood || '',
          reference: row.reference_point || '',
          city: row.city || 'Piracicaba - SP',
        },
        subtotal: Number(row.subtotal || 0),
        deliveryFee: Number(row.delivery_fee || 0),
        discount: Number(row.discount || 0),
        total: Number(row.total || 0),
        payment: typeof row.payment_details === 'object' && row.payment_details !== null
          ? row.payment_details
          : {
              method: row.payment_method,
              summaryText: row.payment_method,
            },
        status: (row.status as OrderStatus) || 'received',
        statusUpdates: Array.isArray(row.status_updates) ? row.status_updates : [],
        items: Array.isArray(row.items_json) ? row.items_json : [],
        syncedWithSupabase: true,
      }));

      memoryOrders = parsedOrders;
      return { orders: parsedOrders, source: 'cloud' };
    }

    return { orders: memoryOrders, source: 'memory' };
  } catch (err: any) {
    return { orders: memoryOrders, source: 'memory', error: err?.message };
  }
}

// Persist order directly in cloud Supabase (No local storage!)
export async function persistOrderInCloud(order: Order): Promise<{ success: boolean; syncedWithSupabase: boolean; error?: string }> {
  // Keep in session memory so immediate UI updates are instantaneous
  memoryOrders = [order, ...memoryOrders.filter((o) => o.id !== order.id)];

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, syncedWithSupabase: false };
  }

  try {
    const { error: orderError } = await client.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      created_at: order.createdAt,
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      delivery_type: order.customer.deliveryType,
      cep: order.customer.cep,
      street: order.customer.street,
      number: order.customer.number,
      complement: order.customer.complement,
      neighborhood: order.customer.neighborhood,
      reference_point: order.customer.reference,
      city: order.customer.city,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      payment_method: order.payment.method,
      payment_timing: order.payment.cardPaymentTiming,
      payment_details: order.payment,
      status: order.status,
      status_updates: order.statusUpdates,
      items_json: order.items,
    });

    if (orderError) {
      console.warn('Aviso ao sincronizar pedido com Supabase:', orderError.message);
      return { success: true, syncedWithSupabase: false, error: orderError.message };
    }

    // Also persist customer to customers table in cloud
    await client.from('customers').upsert({
      phone: order.customer.phone,
      name: order.customer.name,
      cep: order.customer.cep,
      street: order.customer.street,
      number: order.customer.number,
      complement: order.customer.complement,
      neighborhood: order.customer.neighborhood,
      city: order.customer.city,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'phone' });

    order.syncedWithSupabase = true;
    return { success: true, syncedWithSupabase: true };
  } catch (err: any) {
    console.error('Erro de conexão Supabase:', err);
    return { success: true, syncedWithSupabase: false, error: err?.message };
  }
}

// Update order status in cloud Supabase
export async function updateCloudOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const statusLabels: Record<OrderStatus, string> = {
    received: 'Pedido recebido na cozinha',
    preparing: 'No fogão a lenha / Em preparo',
    dispatched: 'Saiu para entrega com motoboy',
    delivered: 'Entregue com sucesso',
    cancelled: 'Pedido cancelado',
  };

  const newUpdate = {
    status,
    timestamp: timeStr,
    message: statusLabels[status] || `Status alterado para ${status}`,
  };

  // Update in memory
  memoryOrders = memoryOrders.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        status,
        statusUpdates: [...ord.statusUpdates, newUpdate],
      };
    }
    return ord;
  });

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const target = memoryOrders.find((o) => o.id === orderId);
    await client
      .from('orders')
      .update({
        status,
        status_updates: target?.statusUpdates || [newUpdate],
      })
      .eq('id', orderId);
    return true;
  } catch (err) {
    console.error('Falha ao atualizar status no Supabase:', err);
    return false;
  }
}

export function getSessionOrders(): Order[] {
  return memoryOrders;
}

export const SUPABASE_SQL_SCHEMA = `-- Schema Supabase para o Restaurante Kaipira Piracicaba
-- Sem armazenamento local - 100% em Nuvem Supabase
-- Copie e cole no SQL Editor do Supabase (https://supabase.com)

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

-- Tabela de Clientes para cadastro em Nuvem
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
`;
