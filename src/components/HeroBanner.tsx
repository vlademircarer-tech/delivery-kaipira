import React from 'react';
import { MapPin, Phone, Clock, Sparkles, ChefHat, Bike, ShieldCheck } from 'lucide-react';
import { RESTAURANT_INFO, isRestaurantOpen } from '../data/piracicabaNeighborhoods';

interface HeroBannerProps {
  onExploreMenu: () => void;
  onOpenLocation: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreMenu,
  onOpenLocation,
}) => {
  const status = isRestaurantOpen();

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100">
      {/* Background Image with warm gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_kaipira_buffet_1791158434539.jpg"
          alt="Restaurante Kaipira Piracicaba buffet e fogão a lenha"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-900/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-18">
        <div className="max-w-2xl">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-600/30 text-amber-200 text-xs font-medium mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tradição Caipira & Rio Piracicaba</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance">
            Restaurante Kaipira Piracicaba
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-300 font-normal leading-relaxed">
            O sabor autêntico do fogão a lenha na sua mesa: Pintado na brasa, Cuscuz Piracicabano tradicional, Feijão Tropeiro e marmitex executivos com entrega rápida em Piracicaba.
          </p>

          {/* Quick info badges */}
          <div className="mt-6 flex flex-wrap items-center gap-y-3 gap-x-5 text-xs sm:text-sm text-stone-300">
            <button
              onClick={onOpenLocation}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Av. Pompéia, 1018 - Piracicamirim</span>
            </button>
            <a
              href={`tel:${RESTAURANT_INFO.phone.replace(/\D/g, '')}`}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>(19) 3302-9515</span>
            </a>
            <div className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Seg–Sáb: 11:00 às 14:00 (Dom. Fechado)</span>
            </div>
          </div>

          {/* Status notice */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-stone-200 bg-stone-900/80 px-3.5 py-1.5 rounded-lg border border-stone-700/60">
            <span
              className={`w-2 h-2 rounded-full ${
                status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{status.message}</span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreMenu}
              className="px-6 py-3 bg-amber-700 hover:bg-amber-600 active:scale-98 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>Ver Cardápio do Almoço</span>
            </button>
            <a
              href={`https://wa.me/${RESTAURANT_INFO.whatsappRaw}?text=${encodeURIComponent('Olá! Gostaria de fazer um pedido no Restaurante Kaipira Piracicaba.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-600/50 font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp (19) 3302-9515</span>
            </a>
          </div>

          {/* Features check */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-3 gap-3 text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>PIX ou Cartão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Entrega ou Balcão</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Comida Fresquinha</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
