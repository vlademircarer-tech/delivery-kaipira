import React from 'react';
import { X, MapPin, Phone, Clock, MessageCircle, ExternalLink, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { RESTAURANT_INFO, isRestaurantOpen } from '../data/piracicabaNeighborhoods';

interface RestaurantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantInfoModal: React.FC<RestaurantInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentStatus = isRestaurantOpen();

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Restaurante Kaipira, Av. Pompéia, 1018 - Piracicamirim, Piracicaba - SP, 13425-060'
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-orange-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-orange-200 font-semibold">
              Informações Oficiais
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Restaurante Kaipira
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-orange-100 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {/* Status highlight */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              currentStatus.isOpen
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-orange-50 border-orange-200 text-orange-950'
            }`}
          >
            {currentStatus.isOpen ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-orange-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block">
                {currentStatus.isOpen ? 'Cozinha Aberta Agora' : 'Horário de Atendimento'}
              </span>
              <p className="text-xs mt-0.5">{currentStatus.message}</p>
            </div>
          </div>

          {/* Address and location */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Endereço em Piracicaba</span>
            </h3>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
              <p className="font-semibold text-stone-900">
                {RESTAURANT_INFO.address}
              </p>
              <p className="text-xs text-stone-600">
                {RESTAURANT_INFO.neighborhood} · {RESTAURANT_INFO.city} · CEP {RESTAURANT_INFO.cep}
              </p>
              <p className="text-xs text-stone-500">
                Localizado próximo ao Trevo de Piracicamirim, fácil acesso e estacionamento para retirada rápida.
              </p>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 pt-1"
              >
                <span>Como chegar no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Operating Hours Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Horário de Funcionamento do Almoço</span>
            </h3>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
              {RESTAURANT_INFO.scheduleDescription.map((item) => (
                <div
                  key={item.day}
                  className={`flex items-center justify-between p-2.5 ${
                    item.isOpen ? 'bg-white' : 'bg-stone-50 text-stone-500'
                  }`}
                >
                  <span className="font-medium text-stone-800">{item.day}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      item.isOpen ? 'text-orange-700 font-bold' : 'text-stone-400'
                    }`}
                  >
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Direct */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-orange-600" />
              <span>Telefone & WhatsApp</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${RESTAURANT_INFO.phone.replace(/\D/g, '')}`}
                className="p-3 bg-stone-100 hover:bg-stone-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-stone-800 transition-colors"
              >
                <Phone className="w-4 h-4 text-orange-600" />
                <span>Ligar (19) 3302-9515</span>
              </a>

              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
