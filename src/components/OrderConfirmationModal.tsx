import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Clock, ChefHat, Bike, MessageCircle, Copy, Check, Share2, Printer, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, OrderStatus } from '../types/delivery';
import { RESTAURANT_INFO } from '../data/piracicabaNeighborhoods';
import { formatCurrency, generatePixCode } from '../utils/formatters';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrderStatus,
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order?.status || 'received');

  // Trigger celebration confetti once modal opens
  useEffect(() => {
    if (isOpen && order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#c2410c', '#fb923c', '#9a3412'],
        });
      } catch {
        // Ignored if canvas-confetti is not available
      }
    }
  }, [isOpen, order?.id]);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  if (!isOpen || !order) return null;

  const steps: { key: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'received',
      label: '1. Pedido Recebido',
      icon: <CheckCircle className="w-4 h-4" />,
      desc: 'Confirmado na cozinha do Restaurante Kaipira',
    },
    {
      key: 'preparing',
      label: '2. No Fogão a Lenha',
      icon: <ChefHat className="w-4 h-4" />,
      desc: 'Cozinhando com tempero caipira fresquinho',
    },
    {
      key: 'dispatched',
      label: order.customer.deliveryType === 'delivery' ? '3. Saiu com Motoboy' : '3. Pronto no Balcão',
      icon: <Bike className="w-4 h-4" />,
      desc: order.customer.deliveryType === 'delivery' ? 'A caminho do seu endereço em Piracicaba' : 'Pode retirar na Av. Pompéia, 1018',
    },
    {
      key: 'delivered',
      label: '4. Concluído',
      icon: <Check className="w-4 h-4" />,
      desc: 'Bom apetite!',
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'dispatched': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(currentStatus);

  // Advance status simulation helper
  const handleAdvanceStatus = () => {
    const sequence: OrderStatus[] = ['received', 'preparing', 'dispatched', 'delivered'];
    const nextIndex = Math.min(sequence.length - 1, currentStepIndex + 1);
    const nextStatus = sequence[nextIndex];
    setCurrentStatus(nextStatus);
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(order.id, nextStatus);
    }
  };

  // WhatsApp text builder
  const buildWhatsAppMessage = () => {
    const itemsList = order.items
      .map((it) => `• ${it.quantity}x ${it.menuItem.name} (${formatCurrency(it.totalPrice)})`)
      .join('\n');

    let paymentStr = '';
    if (order.payment.method === 'pix') paymentStr = 'PIX';
    else if (order.payment.method === 'credit_card') paymentStr = `Cartão ${order.payment.cardBrand || ''}`;
    else if (order.payment.method === 'cash') paymentStr = `Dinheiro (Troco: ${order.payment.cashChangeFor ? formatCurrency(order.payment.cashChangeFor) : 'Não precisa'})`;

    const addressStr = order.customer.deliveryType === 'delivery'
      ? `Endereço: ${order.customer.street}, ${order.customer.number} - ${order.customer.neighborhood}, Piracicaba`
      : 'Retirada no Balcão (Av. Pompéia, 1018)';

    return `*Novo Pedido #${order.orderNumber} - Restaurante Kaipira*\n\n` +
      `*Cliente:* ${order.customer.name}\n` +
      `*Telefone:* ${order.customer.phone}\n` +
      `*Modalidade:* ${order.customer.deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada no Restaurante'}\n` +
      `${addressStr}\n\n` +
      `*Itens do Pedido:*\n${itemsList}\n\n` +
      `*Subtotal:* ${formatCurrency(order.subtotal)}\n` +
      `*Taxa de Entrega:* ${formatCurrency(order.deliveryFee)}\n` +
      (order.discount > 0 ? `*Desconto:* -${formatCurrency(order.discount)}\n` : '') +
      `*TOTAL:* ${formatCurrency(order.total)}\n` +
      `*Forma de Pagamento:* ${paymentStr}\n\n` +
      `Obrigado pela preferência!`;
  };

  const whatsappUrl = `https://wa.me/${RESTAURANT_INFO.whatsappRaw}?text=${encodeURIComponent(buildWhatsAppMessage())}`;

  const pixPayload = generatePixCode(order.total, order.orderNumber);

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixPayload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider">
                Pedido Confirmado com Sucesso!
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Pedido #{order.orderNumber}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-700/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Stepper Tracker */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Acompanhamento em Tempo Real</span>
              </h3>
              <button
                type="button"
                onClick={handleAdvanceStatus}
                title="Avançar status para testar o fluxo"
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-100/60 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Simular Avanço de Status</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent
                          ? 'bg-amber-800 text-white ring-4 ring-amber-100'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-bold leading-tight ${
                        isCurrent ? 'text-amber-900' : isPassed ? 'text-emerald-800' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-center text-stone-600 font-medium pt-1 bg-white p-2.5 rounded-xl border border-stone-100">
              {steps[currentStepIndex].desc}
            </div>
          </div>

          {/* PIX Payment Alert if chosen */}
          {order.payment.method === 'pix' && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  Pagamento via PIX (Total: {formatCurrency(order.total)})
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Chave: {RESTAURANT_INFO.phone}
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Copie o código PIX abaixo para pagar no app do seu banco ou pague pela chave telefone.
              </p>
              <button
                onClick={handleCopyPix}
                className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Chave PIX Copiada com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar PIX Copia e Cola ({formatCurrency(order.total)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* WhatsApp Direct Action Button */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  Notificar o Restaurante no WhatsApp
                </h4>
                <p className="text-[11px] text-stone-600">
                  Envie o comprovante ou detalhes do pedido para o WhatsApp oficial de Piracicaba (19) 3302-9515.
                </p>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Pedido para WhatsApp do Kaipira</span>
            </a>
          </div>

          {/* Itemized Order Receipt */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Resumo dos Itens
            </h4>

            <div className="space-y-2 divide-y divide-stone-100 text-xs">
              {order.items.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 flex justify-between">
                  <div>
                    <span className="font-semibold text-stone-900">
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    {item.customizations.removedIngredients.length > 0 && (
                      <span className="block text-[11px] text-red-600">
                        Sem {item.customizations.removedIngredients.join(', ')}
                      </span>
                    )}
                    {item.customizations.notes && (
                      <span className="block text-[11px] text-stone-500 italic">
                        Obs: "{item.customizations.notes}"
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Entrega ({order.customer.neighborhood})</span>
                <span className="tabular-nums font-medium">
                  {order.deliveryFee === 0 ? 'Grátis' : formatCurrency(order.deliveryFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto</span>
                  <span className="tabular-nums">- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total</span>
                <span className="text-amber-950 font-display text-base tabular-nums">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Delivery address info */}
            <div className="bg-stone-50 p-2.5 rounded-xl text-[11px] text-stone-600 space-y-0.5">
              <span className="font-bold text-stone-800 block">Dados da Entrega:</span>
              <p>Cliente: {order.customer.name} · {order.customer.phone}</p>
              {order.customer.deliveryType === 'delivery' ? (
                <p>
                  Endereço: {order.customer.street}, {order.customer.number}{' '}
                  {order.customer.complement ? `(${order.customer.complement})` : ''} -{' '}
                  {order.customer.neighborhood}, Piracicaba - SP
                </p>
              ) : (
                <p>Retirada no Balcão: {RESTAURANT_INFO.fullAddress}</p>
              )}
              <p>
                Pagamento:{' '}
                {order.payment.method === 'pix'
                  ? 'PIX'
                  : order.payment.method === 'credit_card'
                  ? `Cartão (${order.payment.cardBrand || 'Crédito'})`
                  : 'Dinheiro'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprovante</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ml-auto"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    </div>
  );
};
