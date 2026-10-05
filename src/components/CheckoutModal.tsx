import React, { useState } from 'react';
import { X, QrCode, CreditCard, Banknote, ShieldCheck, Copy, Check, ArrowLeft, Bike, Store, AlertCircle } from 'lucide-react';
import { CartItem, CustomerData, NeighborhoodDelivery, PaymentMethod, PaymentDetails, Order } from '../types/delivery';
import { RESTAURANT_INFO } from '../data/piracicabaNeighborhoods';
import { formatCurrency, formatPhone, generateOrderNumber, generatePixCode } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToCart: () => void;
  items: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  selectedNeighborhood: NeighborhoodDelivery;
  couponCode: string;
  discountAmount: number;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onBackToCart,
  items,
  deliveryType,
  selectedNeighborhood,
  couponCode,
  discountAmount,
  onOrderCreated,
}) => {
  if (!isOpen) return null;

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('19');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [neighborhood, setNeighborhood] = useState(selectedNeighborhood.name);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardType, setCardType] = useState<'credit' | 'debit' | 'voucher'>('credit');
  const [cardBrand, setCardBrand] = useState('Mastercard');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');

  // UI status
  const [copiedPix, setCopiedPix] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = deliveryType === 'delivery' ? selectedNeighborhood.fee : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Mock Pix code for immediate display
  const tempOrderId = generateOrderNumber();
  const pixCode = generatePixCode(total, tempOrderId);

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um telefone celular válido com DDD.');
      return;
    }
    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim()) {
        setErrorMessage('Por favor, preencha o nome da rua e o número para entrega.');
        return;
      }
    }

    setSubmitting(true);

    const customer: CustomerData = {
      name: name.trim(),
      phone: formatPhone(phone),
      deliveryType,
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim(),
      neighborhood: deliveryType === 'delivery' ? selectedNeighborhood.name : 'Piracicamirim (Balcão)',
      reference: reference.trim(),
      city: 'Piracicaba - SP',
      cep: RESTAURANT_INFO.cep,
    };

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      cardBrand: paymentMethod !== 'pix' && paymentMethod !== 'cash' ? `${cardBrand} (${cardType})` : undefined,
      cardPaymentTiming: 'on_delivery',
      cashChangeFor: paymentMethod === 'cash' && needsChange ? parseFloat(changeFor.replace(',', '.')) || undefined : undefined,
      pixTxId: paymentMethod === 'pix' ? `PIX-${Date.now().toString(36).toUpperCase()}` : undefined,
    };

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderNumber: tempOrderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      couponCode: couponCode || undefined,
      total,
      payment: paymentDetails,
      status: 'received',
      statusUpdates: [
        {
          status: 'received',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          message: 'Pedido recebido com sucesso na cozinha do Restaurante Kaipira!',
        },
      ],
    };

    // Slight delay for smooth UX
    setTimeout(() => {
      setSubmitting(false);
      onOrderCreated(newOrder);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-5 bg-[#FBF9F5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToCart}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
              title="Voltar à sacola"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900 leading-tight">
                Finalizar Pedido
              </h2>
              <p className="text-xs text-stone-500">
                {deliveryType === 'delivery'
                  ? `Entrega em Piracicaba (${selectedNeighborhood.name})`
                  : 'Retirada no Balcão (Av. Pompéia, 1018)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Customer Contact */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              1. Seus Dados para Contato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Celular / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(19) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address (if Delivery) */}
          {deliveryType === 'delivery' ? (
            <div className="border-t border-stone-200 pt-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                2. Endereço de Entrega em Piracicaba
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Rua Luiz Razera"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Complemento (Apto, Bloco)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bloco B, Apto 42"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Bairro Selecionado
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${selectedNeighborhood.name} (+${formatCurrency(selectedNeighborhood.fee)})`}
                      className="w-full p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Ponto de Referência para o Motoboy
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Próximo à praça / portão verde"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-stone-200 pt-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                2. Ponto de Retirada
              </h3>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                <span className="font-semibold block">{RESTAURANT_INFO.name}</span>
                <span className="block text-stone-700 mt-0.5">{RESTAURANT_INFO.fullAddress}</span>
                <span className="block text-stone-500 mt-1">Telefone: {RESTAURANT_INFO.phone}</span>
              </div>
            </div>
          )}

          {/* Section 3: Payment Method */}
          <div className="border-t border-stone-200 pt-5">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              3. Forma de Pagamento
            </h3>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <QrCode className="w-4 h-4 mb-1 text-emerald-600" />
                <span>PIX Instantâneo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1 text-amber-700" />
                <span>Cartão na Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-300'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Banknote className="w-4 h-4 mb-1 text-amber-700" />
                <span>Dinheiro</span>
              </button>
            </div>

            {/* PIX Details */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-900">
                      PIX com Confirmação Automática
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 tabular-nums">
                    Total: {formatCurrency(total)}
                  </span>
                </div>

                {/* QR Code and Copy Code Box */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-emerald-100">
                  {/* Clean SVG visual QR Code mockup */}
                  <div className="w-28 h-28 bg-stone-900 p-2 rounded-lg flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-white p-1 rounded grid grid-cols-6 gap-0.5">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            (i % 2 === 0 && i % 3 === 0) || i < 8 || i > 28 || i === 14 || i === 21
                              ? 'bg-black'
                              : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <p className="text-xs text-stone-600">
                      Chave PIX (Telefone):{' '}
                      <span className="font-bold text-stone-900">{RESTAURANT_INFO.phone}</span>
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Beneficiário: {RESTAURANT_INFO.pixName}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-200" />
                          <span>Código Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Código PIX Copia e Cola</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 leading-tight">
                  Ao clicar em <strong>"Confirmar Pedido"</strong>, seu pedido entrará diretamente para o fogão a lenha do Restaurante Kaipira!
                </p>
              </div>
            )}

            {/* Card Details */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold text-stone-800 block">
                  O entregador levará a máquina de cartão com aproximação (NFC):
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardType('credit')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border cursor-pointer ${
                      cardType === 'credit'
                        ? 'bg-white border-amber-800 text-amber-900 font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('debit')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border cursor-pointer ${
                      cardType === 'debit'
                        ? 'bg-white border-amber-800 text-amber-900 font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Débito
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('voucher')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border cursor-pointer ${
                      cardType === 'voucher'
                        ? 'bg-white border-amber-800 text-amber-900 font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Refeição (VR/VA)
                  </button>
                </div>

                <div>
                  <label className="text-xs text-stone-600 block mb-1">
                    Bandeira do Cartão:
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="Hipercard">Hipercard</option>
                    <option value="Alelo Refeição">Alelo Refeição</option>
                    <option value="Sodexo">Sodexo / Pluxee</option>
                    <option value="Ticket Restaurante">Ticket Restaurante</option>
                  </select>
                </div>
              </div>
            )}

            {/* Cash Details */}
            {paymentMethod === 'cash' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsChange}
                    onChange={(e) => setNeedsChange(e.target.checked)}
                    className="rounded border-stone-300 text-amber-800 focus:ring-amber-700"
                  />
                  <span>Preciso de troco em dinheiro</span>
                </label>

                {needsChange && (
                  <div>
                    <label className="text-xs text-stone-600 block mb-1">
                      Troco para quanto? (Valor total é {formatCurrency(total)})
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 50,00 ou 100,00"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Error banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Order Summary Recap */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <div className="flex justify-between">
              <span>{items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
              <span className="font-semibold text-stone-900 tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Entrega ({deliveryType === 'delivery' ? selectedNeighborhood.name : 'Retirada'})</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Desconto</span>
                <span className="tabular-nums">- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
              <span>Total a Pagar</span>
              <span className="text-amber-950 font-display text-base tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-5 bg-amber-800 hover:bg-amber-900 active:scale-98 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-amber-200" />
            <span>
              {submitting
                ? 'Enviando Pedido à Cozinha...'
                : `Confirmar Pedido (${formatCurrency(total)})`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
