import React from 'react';
import { MapPin, Phone, Clock, Heart, Database, Github } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/piracicabaNeighborhoods';

interface FooterProps {
  onOpenRestaurantInfo: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenRestaurantInfo,
  onOpenSupabaseConfig,
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              Restaurante Kaipira Piracicaba
            </span>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed">
              Tradição em comida caipira e peixes do Rio Piracicaba preparados com amor no fogão a lenha. Marmitex executivos, porções artesanais e delivery rápido para toda a cidade.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onOpenSupabaseConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-xs text-stone-300 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Database</span>
              </button>
              <button
                onClick={onOpenSupabaseConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-xs text-stone-300 transition-colors cursor-pointer"
              >
                <Github className="w-3.5 h-3.5 text-stone-300" />
                <span>GitHub Ready</span>
              </button>
            </div>
          </div>

          {/* Col 2: Endereço & Contato */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">
              Endereço & Contato
            </h4>
            <div className="space-y-1 text-stone-400">
              <p className="font-medium text-stone-200">{RESTAURANT_INFO.address}</p>
              <p>{RESTAURANT_INFO.neighborhood}</p>
              <p>{RESTAURANT_INFO.city}</p>
              <p>CEP: {RESTAURANT_INFO.cep}</p>
            </div>
            <div className="pt-2">
              <a
                href={`tel:${RESTAURANT_INFO.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 font-semibold text-amber-400 hover:text-amber-300"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{RESTAURANT_INFO.phone}</span>
              </a>
            </div>
          </div>

          {/* Col 3: Horários */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">
              Horário do Almoço
            </h4>
            <div className="space-y-1 text-stone-400">
              <p>Segunda a Sexta: 11:00 às 14:00</p>
              <p>Sábado: 11:00 às 14:00</p>
              <p className="text-amber-400 font-semibold">Domingo: Fechado</p>
            </div>
            <button
              onClick={onOpenRestaurantInfo}
              className="mt-2 text-stone-400 hover:text-white underline text-[11px] cursor-pointer"
            >
              Ver horários detalhados
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} Restaurante Kaipira Piracicaba. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            <span>Desenvolvido para Mobile, Tablet e Desktop</span>
            <span>·</span>
            <span>Piracicaba - SP</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
