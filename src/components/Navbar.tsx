import React from 'react';
import {
  ShoppingBag,
  Database,
  Clock,
  MapPin,
  Phone,
  Lock,
  UtensilsCrossed,
  Tag,
  Package,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { isRestaurantOpen, RESTAURANT_INFO } from '../data/piracicabaNeighborhoods';
import { NeighborhoodDelivery } from '../types/delivery';

interface NavbarProps {
  cartItemCount: number;
  cartTotal: number;
  selectedNeighborhood: NeighborhoodDelivery;
  deliveryType: 'delivery' | 'pickup';
  onOpenCart: () => void;
  onOpenRestaurantInfo: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenOrdersHistory: () => void;
  onOpenAdminPanel: () => void;
  onToggleDeliveryTypeOrNeighborhood: () => void;
  hasOrders: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  cartTotal,
  selectedNeighborhood,
  deliveryType,
  onOpenCart,
  onOpenRestaurantInfo,
  onOpenSupabaseConfig,
  onOpenOrdersHistory,
  onOpenAdminPanel,
  onToggleDeliveryTypeOrNeighborhood,
  hasOrders,
}) => {
  const storeStatus = isRestaurantOpen();

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Main Orange Header (iFood Style in vibrant Orange) */}
      <div className="bg-orange-600 text-white border-b border-orange-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex flex-col text-left focus:outline-none group"
            >
              <span className="font-display text-2xl font-extrabold tracking-tight text-white group-hover:text-orange-100 transition-colors">
                Kaipira Piracicaba
              </span>
              <span className="text-[10px] font-semibold text-orange-200 uppercase tracking-widest -mt-1 hidden sm:block">
                Delivery Oficial · Fogão a Lenha
              </span>
            </a>
          </div>

          {/* Quick Sub-navigation tabs (desktop / tablet) */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-orange-100">
            <a
              href="#cardapio"
              className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Cardápio</span>
            </a>
            <button
              onClick={onOpenRestaurantInfo}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Clock className="w-4 h-4" />
              <span>Horários & Contato</span>
            </button>
            {hasOrders && (
              <button
                onClick={onOpenOrdersHistory}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Package className="w-4 h-4" />
                <span>Meus Pedidos</span>
              </button>
            )}
            <button
              onClick={onOpenSupabaseConfig}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap text-orange-200 hover:text-white"
              title="Banco de Dados Supabase em Nuvem"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Nuvem</span>
            </button>
          </nav>

          {/* Right Action Zone: Store Status + Seu Pedido + Lock Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Store open status */}
            <button
              onClick={onOpenRestaurantInfo}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-700/80 hover:bg-orange-700 text-white transition-colors cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-300'
                }`}
              />
              <span>{storeStatus.isOpen ? 'Aberto Almoço' : 'Fechado Agora'}</span>
            </button>

            {/* Seu Pedido Button in bright contrasting white/amber */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white hover:bg-orange-50 active:scale-98 text-orange-900 rounded-xl shadow-xs transition-all cursor-pointer font-bold text-xs sm:text-sm"
              aria-label="Abrir Seu Pedido"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] uppercase tracking-wider text-orange-600 font-bold">
                  Seu Pedido
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-stone-900 tabular-nums">
                  {cartTotal > 0 ? formatCurrency(cartTotal) : 'R$ 0,00'}
                </span>
              </div>
            </button>

            {/* Lock Icon for Admin Panel on top right corner */}
            <button
              onClick={onOpenAdminPanel}
              className="p-2 sm:p-2.5 bg-orange-700/80 hover:bg-orange-800 text-white rounded-xl transition-colors cursor-pointer border border-orange-500/40"
              title="Painel Administrativo Kaipira (Acesso Restrito)"
              aria-label="Painel Administrativo"
            >
              <Lock className="w-4 h-4 text-orange-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Address Strip (Exactly as shown in iFood screenshot layout: "Entregar em ... TROCAR") */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-stone-700 truncate">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="text-stone-500 hidden sm:inline">
              {deliveryType === 'delivery' ? 'Entregar em:' : 'Retirar em:'}
            </span>
            <span className="font-bold text-stone-900 truncate">
              {deliveryType === 'delivery'
                ? `${selectedNeighborhood.name} (Taxa: ${formatCurrency(selectedNeighborhood.fee)})`
                : `${RESTAURANT_INFO.address} - ${RESTAURANT_INFO.neighborhood} (Grátis)`}
            </span>
          </div>

          <button
            onClick={onToggleDeliveryTypeOrNeighborhood}
            className="text-orange-600 hover:text-orange-700 font-extrabold text-xs uppercase tracking-wider px-2 py-1 rounded-md hover:bg-orange-50 transition-colors cursor-pointer shrink-0"
          >
            TROCAR
          </button>
        </div>
      </div>
    </header>
  );
};
