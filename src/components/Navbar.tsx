import React from 'react';
import { ShoppingBag, Database, Clock, MapPin, Phone, Lock } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { isRestaurantOpen } from '../data/piracicabaNeighborhoods';

interface NavbarProps {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenRestaurantInfo: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenOrdersHistory: () => void;
  onOpenAdminPanel: () => void;
  hasOrders: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  cartTotal,
  onOpenCart,
  onOpenRestaurantInfo,
  onOpenSupabaseConfig,
  onOpenOrdersHistory,
  onOpenAdminPanel,
  hasOrders,
}) => {
  const storeStatus = isRestaurantOpen();

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="group flex flex-col text-left focus:outline-none"
          >
            <span className="font-display text-2xl font-bold tracking-tight text-amber-950 group-hover:text-amber-800 transition-colors">
              Kaipira Piracicaba
            </span>
            <span className="text-[11px] font-medium text-stone-500 uppercase tracking-widest -mt-1 hidden sm:block">
              Almoço Caipira & Peixes do Rio
            </span>
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <a
            href="#cardapio"
            className="hover:text-amber-900 transition-colors whitespace-nowrap"
          >
            Cardápio
          </a>
          <button
            onClick={onOpenRestaurantInfo}
            className="hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Horários & Localização</span>
          </button>
          {hasOrders && (
            <button
              onClick={onOpenOrdersHistory}
              className="hover:text-amber-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              Meus Pedidos
            </button>
          )}
          <button
            onClick={onOpenSupabaseConfig}
            className="hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1.5 text-stone-500 hover:text-emerald-700 whitespace-nowrap"
            title="Banco de Dados Supabase em Nuvem"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase / Nuvem</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions (Store state + Seu Pedido + Lock Icon) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick status button */}
          <button
            onClick={onOpenRestaurantInfo}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              storeStatus.isOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                storeStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="truncate max-w-[130px] lg:max-w-none">
              {storeStatus.isOpen ? 'Cozinha Aberta' : 'Almoço 11h às 14h'}
            </span>
          </button>

          {/* Cart button renamed to Seu Pedido */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 bg-amber-800 hover:bg-amber-900 active:scale-98 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            aria-label="Abrir Seu Pedido"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-100" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FBF9F5]">
                  {cartItemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[10px] uppercase tracking-wider text-amber-200 font-semibold">
                Seu Pedido
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {cartTotal > 0 ? formatCurrency(cartTotal) : 'R$ 0,00'}
              </span>
            </div>
          </button>

          {/* Lock Icon for Admin Panel on top right corner */}
          <button
            onClick={onOpenAdminPanel}
            className="p-2 sm:p-2.5 text-stone-600 hover:text-amber-950 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer border border-stone-200/80"
            title="Painel Administrativo (Acesso Restrito)"
            aria-label="Painel Administrativo"
          >
            <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-700 hover:text-amber-900" />
          </button>
        </div>
      </div>
    </header>
  );
};

