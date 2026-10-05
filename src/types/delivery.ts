export interface CustomizationOptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required?: boolean;
  min?: number;
  max?: number;
  options: {
    id: string;
    name: string;
    price: number;
    defaultSelected?: boolean;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'executivos' | 'peixes' | 'tradicionais' | 'porcoes' | 'sobremesas' | 'bebidas';
  image: string;
  popular?: boolean;
  serves: string;
  prepTime: string;
  removableIngredients?: string[];
  optionGroups?: CustomizationOptionGroup[];
}

export interface SelectedCustomizations {
  selectedOptions: Record<string, string[]>;
  removedIngredients: string[];
  notes: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomizations;
  unitPrice: number;
  totalPrice: number;
}

export interface NeighborhoodDelivery {
  name: string;
  zone: string;
  fee: number;
  estimatedMinutes: string;
}

export interface CustomerData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  deliveryType: 'delivery' | 'pickup';
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  reference?: string;
  city: string;
  state?: string;
}

export type BasePaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';
export type PaymentMethod = BasePaymentMethod | 'split';

export interface SinglePaymentConfig {
  method: BasePaymentMethod;
  amount: number;
  cardBrand?: string;
  cardTiming?: 'on_delivery' | 'online';
  cashChangeFor?: number;
  pixTxId?: string;
}

export interface SplitPaymentConfig {
  part1: SinglePaymentConfig;
  part2: SinglePaymentConfig;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cardBrand?: string;
  cardPaymentTiming?: 'on_delivery' | 'online';
  cashChangeFor?: number;
  pixTxId?: string;
  split?: SplitPaymentConfig;
  summaryText: string;
}

export type OrderStatus = 'received' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  payment: PaymentDetails;
  status: OrderStatus;
  statusUpdates: OrderStatusUpdate[];
  syncedWithSupabase?: boolean;
}
