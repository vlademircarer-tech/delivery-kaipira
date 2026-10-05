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
  serves: string; // ex: "1 a 2 pessoas"
  prepTime: string; // ex: "20-30 min"
  removableIngredients?: string[];
  optionGroups?: CustomizationOptionGroup[];
}

export interface SelectedCustomizations {
  selectedOptions: Record<string, string[]>; // groupId -> array of optionIds
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
  name: string;
  phone: string;
  deliveryType: 'delivery' | 'pickup';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  reference?: string;
  city: string;
  cep: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export interface PaymentDetails {
  method: PaymentMethod;
  cardBrand?: string;
  cardPaymentTiming?: 'on_delivery' | 'online';
  cashChangeFor?: number;
  pixTxId?: string;
}

export type OrderStatus = 'received' | 'preparing' | 'dispatched' | 'delivered';

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
  statusUpdates: {
    status: OrderStatus;
    timestamp: string;
    message: string;
  }[];
  syncedWithSupabase?: boolean;
}
