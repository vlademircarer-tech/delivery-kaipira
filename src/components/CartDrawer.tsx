import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Bike, Store, ArrowRight, Tag, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CartItem, NeighborhoodDelivery } from '../types/delivery';
import { PIRACICABA_NEIGHBORHOODS, RESTAURANT_INFO } from '../data/piracicabaNeighborhoods';
import { formatCurrency } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  onSetDeliveryType: (type: 'delivery' | 'pickup') => void;
  selectedNeighborhood: NeighborhoodDelivery;
  onSelectNeighborhood: (neighborhood: NeighborhoodDelivery) => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  couponCode: string;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  deliveryType,
  onSetDeliveryType,
  selectedNeighborhood,
  onSelectNeighborhood,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  onApplyCoupon,
  discountAmount,
}) => {
  if (!isOpen) return null;

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = deliveryType === 'delivery' ? selectedNeighborhood.fee : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = onApplyCoupon(inputCoupon);
    setCouponFeedback({
      text: res.message,
      isError: !res.success,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-stone-900">
                Seu Pedido
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 tabular-nums">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Fechar Seu Pedido"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery or Pickup Toggle */}
          <div className="p-4 bg-white border-b border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Como deseja receber seu pedido?
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => onSetDeliveryType('delivery')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  deliveryType === 'delivery'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Entrega em Casa</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDeliveryType('pickup')}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  deliveryType === 'pickup'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retirada Balcão</span>
              </button>
            </div>

            {/* Delivery address / Neighborhood calculator */}
            {deliveryType === 'delivery' ? (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-700">
                    Bairro de Piracicaba para entrega:
                  </label>
                  <span className="text-xs font-semibold text-amber-800 tabular-nums">
                    Taxa: {formatCurrency(selectedNeighborhood.fee)}
                  </span>
                </div>
                <select
                  value={selectedNeighborhood.name}
                  onChange={(e) => {
                    const found = PIRACICABA_NEIGHBORHOODS.find(
                      (n) => n.name === e.target.value
                    );
                    if (found) onSelectNeighborhood(found);
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-colors"
                >
                  {PIRACICABA_NEIGHBORHOODS.map((n) => (
                    <option key={n.name} value={n.name}>
                      {n.name} — {formatCurrency(n.fee)} ({n.estimatedMinutes})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  Tempo estimado de entrega: <span className="font-semibold text-stone-700">{selectedNeighborhood.estimatedMinutes}</span>
                </p>
              </div>
            ) : (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                <span className="font-semibold block">Retirada sem taxa no restaurante:</span>
                <span className="text-stone-700">{RESTAURANT_INFO.fullAddress}</span>
                <span className="block text-[11px] text-stone-500 mt-0.5">Pronto em 15–25 minutos após confirmação.</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <Store className="w-12 h-12 text-stone-300 mb-2 stroke-1" />
                <p className="text-sm font-semibold text-stone-700">
                  Seu pedido está vazio
                </p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Adicione pratos típicos caipiras, peixes na brasa ou marmitas executivas para começar.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-white rounded-xl border border-stone-200 p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-stone-900 leading-tight">
                        {item.menuItem.name}
                      </h4>
                      <span className="text-xs text-stone-500 font-medium tabular-nums">
                        {formatCurrency(item.unitPrice)} un.
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remover prato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customizations display */}
                  <div className="text-[11px] text-stone-600 bg-stone-50 rounded-lg p-2 space-y-1">
                    {/* Selected options */}
                    {Object.entries(item.customizations.selectedOptions).map(([groupId, optIds]) => {
                      const group = item.menuItem.optionGroups?.find((g) => g.id === groupId);
                      if (!group || optIds.length === 0) return null;
                      const names = group.options
                        .filter((o) => optIds.includes(o.id))
                        .map((o) => o.name)
                        .join(', ');
                      return (
                        <div key={groupId}>
                          <span className="font-semibold text-stone-700">{group.name}:</span>{' '}
                          <span>{names}</span>
                        </div>
                      );
                    })}

                    {/* Removed items */}
                    {item.customizations.removedIngredients.length > 0 && (
                      <div className="text-red-700 font-medium">
                        <span>Retirar:</span> {item.customizations.removedIngredients.join(', ')}
                      </div>
                    )}

                    {/* Special notes */}
                    {item.customizations.notes && (
                      <div className="text-stone-500 italic">
                        <span>Obs:</span> "{item.customizations.notes}"
                      </div>
                    )}
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1 hover:bg-stone-200 rounded-md text-stone-600 transition-colors"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-800 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 hover:bg-stone-200 rounded-md text-stone-600 transition-colors"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-amber-950 tabular-nums">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Coupon, Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-stone-200 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cupom (ex: KAIPIRA10)"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs uppercase font-medium focus:outline-none focus:border-amber-700"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Aplicar
                </button>
              </form>

              {couponFeedback && (
                <p
                  className={`text-[11px] font-medium ${
                    couponFeedback.isError ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {couponFeedback.text}
                </p>
              )}

              {/* Financial Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-1 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Entrega ({deliveryType === 'delivery' ? selectedNeighborhood.name.split(' ')[0] : 'Balcão'})</span>
                  <span className="font-medium tabular-nums">
                    {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Desconto ({couponCode})</span>
                    <span className="tabular-nums">- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>Total</span>
                  <span className="text-amber-950 font-display text-base tabular-nums">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Proceed CTA */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 bg-amber-800 hover:bg-amber-900 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avançar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
