import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  QrCode,
  CreditCard,
  Banknote,
  Split,
  Search,
  Check,
  Copy,
  ShieldCheck,
  AlertCircle,
  Loader2,
  MapPin,
  Bike,
  Store,
  HelpCircle
} from 'lucide-react';
import {
  CartItem,
  CustomerData,
  NeighborhoodDelivery,
  PaymentMethod,
  BasePaymentMethod,
  PaymentDetails,
  Order,
  SplitPaymentConfig
} from '../types/delivery';
import { RESTAURANT_INFO, PIRACICABA_NEIGHBORHOODS } from '../data/piracicabaNeighborhoods';
import { lookupCep } from '../services/cep';
import { formatCurrency, formatPhone, generateOrderNumber, generatePixCode } from '../utils/formatters';

interface CheckoutPaymentPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToCart: () => void;
  items: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  onSetDeliveryType: (type: 'delivery' | 'pickup') => void;
  selectedNeighborhood: NeighborhoodDelivery;
  onSelectNeighborhood: (neighborhood: NeighborhoodDelivery) => void;
  couponCode: string;
  discountAmount: number;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutPaymentPage: React.FC<CheckoutPaymentPageProps> = ({
  isOpen,
  onClose,
  onBackToCart,
  items,
  deliveryType,
  onSetDeliveryType,
  selectedNeighborhood,
  onSelectNeighborhood,
  couponCode,
  discountAmount,
  onOrderCreated,
}) => {
  if (!isOpen) return null;

  // Customer registration state (Cloud only, no localstorage)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('19');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // CEP lookup loading & feedback
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Financial values
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = deliveryType === 'delivery' ? selectedNeighborhood.fee : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Single payment configs
  const [cardType, setCardType] = useState<'credit' | 'debit' | 'voucher'>('credit');
  const [cardBrand, setCardBrand] = useState('Mastercard');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');

  // Split payment configs (Combinação de formas)
  const [splitMethod1, setSplitMethod1] = useState<BasePaymentMethod>('pix');
  const [splitAmount1, setSplitAmount1] = useState<number>(() => Math.round(total / 2));
  const [splitMethod2, setSplitMethod2] = useState<BasePaymentMethod>('credit_card');
  const [splitCardBrand1, setSplitCardBrand1] = useState('Mastercard');
  const [splitCardBrand2, setSplitCardBrand2] = useState('Visa');
  const [splitNeedsChange2, setSplitNeedsChange2] = useState(false);
  const [splitChangeFor2, setSplitChangeFor2] = useState('');

  // UI state
  const [copiedPix, setCopiedPix] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tempOrderId = generateOrderNumber();
  const pixCode = generatePixCode(total, tempOrderId);

  // Recalculate splitAmount1 when total changes
  useEffect(() => {
    setSplitAmount1(Math.round(total / 2));
  }, [total]);

  // Handle CEP automatic search
  const handleCepChange = async (val: string) => {
    setCep(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length === 8) {
      triggerCepLookup(clean);
    }
  };

  const triggerCepLookup = async (cleanCep?: string) => {
    const targetCep = cleanCep || cep.replace(/\D/g, '');
    if (targetCep.length !== 8) {
      setCepFeedback({ text: 'O CEP deve ter 8 números.', isError: true });
      return;
    }

    setIsSearchingCep(true);
    setCepFeedback(null);

    const res = await lookupCep(targetCep);
    setIsSearchingCep(false);

    if (res.success && res.data) {
      setStreet(res.data.street);
      setCep(res.data.cep);
      setCepFeedback({
        text: `Endereço localizado: ${res.data.neighborhood}, ${res.data.city}!`,
        isError: false,
      });

      // Automatically match Piracicaba neighborhood if found
      if (res.data.matchedNeighborhood) {
        onSelectNeighborhood(res.data.matchedNeighborhood);
      }
    } else {
      setCepFeedback({
        text: res.error || 'CEP não localizado. Preencha manualmente.',
        isError: true,
      });
    }
  };

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  // Split calculation
  const splitAmount2 = Math.max(0, total - splitAmount1);

  // Change calculation for single cash
  const parsedChangeFor = parseFloat(changeFor.replace(',', '.')) || 0;
  const changeToReturn = parsedChangeFor > total ? parsedChangeFor - total : 0;

  // Change calculation for split cash
  const parsedSplitChangeFor2 = parseFloat(splitChangeFor2.replace(',', '.')) || 0;
  const splitChangeToReturn2 = parsedSplitChangeFor2 > splitAmount2 ? parsedSplitChangeFor2 - splitAmount2 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate customer
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD de Piracicaba (19).');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim()) {
        setErrorMessage('Por favor, informe a Rua e o Número para entrega.');
        return;
      }
    }

    // Validate payment
    let paymentSummaryText = '';
    let finalPaymentDetails: PaymentDetails;

    if (paymentMethod === 'pix') {
      paymentSummaryText = `PIX Integral (${formatCurrency(total)})`;
      finalPaymentDetails = {
        method: 'pix',
        pixTxId: `PIX-${Date.now().toString(36).toUpperCase()}`,
        summaryText: paymentSummaryText,
      };
    } else if (paymentMethod === 'credit_card') {
      paymentSummaryText = `Cartão de Crédito ${cardBrand} na entrega (${formatCurrency(total)})`;
      finalPaymentDetails = {
        method: 'credit_card',
        cardBrand,
        cardPaymentTiming: 'on_delivery',
        summaryText: paymentSummaryText,
      };
    } else if (paymentMethod === 'debit_card') {
      paymentSummaryText = `Cartão de Débito / Vale ${cardBrand} na entrega (${formatCurrency(total)})`;
      finalPaymentDetails = {
        method: 'debit_card',
        cardBrand,
        cardPaymentTiming: 'on_delivery',
        summaryText: paymentSummaryText,
      };
    } else if (paymentMethod === 'cash') {
      if (needsChange && parsedChangeFor < total) {
        setErrorMessage(`O valor para troco deve ser maior que o total (${formatCurrency(total)}).`);
        return;
      }
      paymentSummaryText = needsChange
        ? `Dinheiro (Troco para ${formatCurrency(parsedChangeFor)} - Devolver ${formatCurrency(changeToReturn)})`
        : `Dinheiro sem troco (${formatCurrency(total)})`;

      finalPaymentDetails = {
        method: 'cash',
        cashChangeFor: needsChange ? parsedChangeFor : undefined,
        summaryText: paymentSummaryText,
      };
    } else {
      // Split payment
      if (splitAmount1 <= 0 || splitAmount1 >= total) {
        setErrorMessage('Por favor, divida os valores entre as duas formas de pagamento.');
        return;
      }

      const splitConfig: SplitPaymentConfig = {
        part1: {
          method: splitMethod1,
          amount: splitAmount1,
          cardBrand: splitMethod1.includes('card') ? splitCardBrand1 : undefined,
          pixTxId: splitMethod1 === 'pix' ? `PIX-P1-${Date.now().toString(36).toUpperCase()}` : undefined,
        },
        part2: {
          method: splitMethod2,
          amount: splitAmount2,
          cardBrand: splitMethod2.includes('card') ? splitCardBrand2 : undefined,
          cashChangeFor: splitMethod2 === 'cash' && splitNeedsChange2 ? parsedSplitChangeFor2 : undefined,
          pixTxId: splitMethod2 === 'pix' ? `PIX-P2-${Date.now().toString(36).toUpperCase()}` : undefined,
        },
      };

      paymentSummaryText = `Pagamento Combinado: ${splitMethod1.toUpperCase()} (${formatCurrency(splitAmount1)}) + ${splitMethod2.toUpperCase()} (${formatCurrency(splitAmount2)})`;

      finalPaymentDetails = {
        method: 'split',
        split: splitConfig,
        summaryText: paymentSummaryText,
      };
    }

    setSubmitting(true);

    const customer: CustomerData = {
      name: name.trim(),
      phone: formatPhone(phone),
      email: email.trim() || undefined,
      deliveryType,
      cep: cep.trim() || '13425-060',
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim(),
      neighborhood: deliveryType === 'delivery' ? selectedNeighborhood.name : 'Piracicamirim (Balcão)',
      reference: reference.trim(),
      city: 'Piracicaba - SP',
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
      payment: finalPaymentDetails,
      status: 'received',
      statusUpdates: [
        {
          status: 'received',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          message: 'Pedido recebido com sucesso na cozinha do Restaurante Kaipira!',
        },
      ],
    };

    setTimeout(() => {
      setSubmitting(false);
      onOrderCreated(newOrder);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FBF9F5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToCart}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              title="Voltar ao Seu Pedido"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Página de Pagamento & Cadastro
              </h2>
              <p className="text-xs text-stone-500">
                Restaurante Kaipira Piracicaba · Conexão direta com a Nuvem
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

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Modalidade de Recebimento */}
          <div>
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2">
              1. Modalidade de Recebimento
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => onSetDeliveryType('delivery')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  deliveryType === 'delivery'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Entrega em Casa</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDeliveryType('pickup')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  deliveryType === 'pickup'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retirada Balcão (Av. Pompéia, 1018)</span>
              </button>
            </div>
          </div>

          {/* Cadastro de Cliente com Busca CEP */}
          <div className="border-t border-stone-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                2. Cadastro do Cliente & Endereço
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Salvo diretamente na Nuvem
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
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
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                />
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                {/* CEP Input with search button */}
                <div>
                  <label className="text-xs font-semibold text-stone-800 block mb-1">
                    CEP de Piracicaba (Busca Automática)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={9}
                        placeholder="Ex: 13425-060"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerCepLookup()}
                      disabled={isSearchingCep}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {isSearchingCep ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Buscando...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Buscar CEP</span>
                        </>
                      )}
                    </button>
                  </div>

                  {cepFeedback && (
                    <p
                      className={`text-[11px] font-medium mt-1.5 flex items-center gap-1 ${
                        cepFeedback.isError ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {cepFeedback.isError ? (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{cepFeedback.text}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Av. Pompéia ou Rua Luiz Razera"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1018"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Complemento (Apto, Bloco, etc.)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Apto 12"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-700 block mb-1">
                      Bairro em Piracicaba (Taxa de Entrega)
                    </label>
                    <select
                      value={selectedNeighborhood.name}
                      onChange={(e) => {
                        const found = PIRACICABA_NEIGHBORHOODS.find((n) => n.name === e.target.value);
                        if (found) onSelectNeighborhood(found);
                      }}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-600"
                    >
                      {PIRACICABA_NEIGHBORHOODS.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name} — Taxa: {formatCurrency(n.fee)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Próximo à padaria / portão branco"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Formas de Pagamento & Combinações */}
          <div className="border-t border-stone-200 pt-5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              3. Forma de Pagamento
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              Escolha uma forma individual ou selecione <strong>Combinação</strong> para dividir o pagamento.
            </p>

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-orange-600" />
                <span className="text-xs">Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debit_card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'debit_card'
                    ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1 text-orange-600" />
                <span className="text-xs">Débito / VR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-stone-800 bg-stone-100 text-stone-900 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-700" />
                <span className="text-xs">Dinheiro</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('split')}
                className={`col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  paymentMethod === 'split'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <Split className="w-5 h-5 mb-1 text-purple-600" />
                <span className="text-xs">Combinação</span>
              </button>
            </div>

            {/* Individual Option 1: PIX */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">
                    Pagamento via PIX (Total: {formatCurrency(total)})
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    Chave Telefone: {RESTAURANT_INFO.phone}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="w-24 h-24 bg-stone-900 p-2 rounded-lg flex items-center justify-center shrink-0">
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

                  <div className="flex-1 w-full space-y-1.5">
                    <p className="text-xs text-stone-700">
                      Beneficiário: <strong>{RESTAURANT_INFO.pixName}</strong>
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
                          <span>Copiar PIX Copia e Cola</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Option 2: Cartão de Crédito */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold text-stone-800 block">
                  Pagamento com Cartão de Crédito na Entrega (Maquininha com Aproximação):
                </span>
                <div>
                  <label className="text-xs text-stone-600 block mb-1">
                    Selecione a Bandeira do Cartão:
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="Hipercard">Hipercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>
              </div>
            )}

            {/* Individual Option 3: Cartão de Débito / Vale */}
            {paymentMethod === 'debit_card' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold text-stone-800 block">
                  Pagamento com Cartão de Débito ou Vale Refeição na Entrega:
                </span>
                <div>
                  <label className="text-xs text-stone-600 block mb-1">
                    Bandeira / Convênio:
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => setCardBrand(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                  >
                    <option value="Mastercard Débito">Mastercard Débito</option>
                    <option value="Visa Débito">Visa Débito</option>
                    <option value="Elo Débito">Elo Débito</option>
                    <option value="Alelo Refeição">Alelo Refeição</option>
                    <option value="Sodexo / Pluxee">Sodexo / Pluxee</option>
                    <option value="Ticket Restaurante">Ticket Restaurante</option>
                    <option value="VR Benefícios">VR Benefícios</option>
                  </select>
                </div>
              </div>
            )}

            {/* Individual Option 4: Dinheiro com Troco */}
            {paymentMethod === 'cash' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsChange}
                    onChange={(e) => setNeedsChange(e.target.checked)}
                    className="rounded text-amber-800 focus:ring-amber-700 w-4 h-4"
                  />
                  <span>Preciso de troco em dinheiro</span>
                </label>

                {needsChange ? (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-stone-200">
                    <label className="text-xs text-stone-700 block">
                      Troco para quanto? (Total do pedido: {formatCurrency(total)})
                    </label>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-stone-500">R$</span>
                      <input
                        type="text"
                        placeholder="Ex: 100,00 ou 50,00"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-700"
                      />
                    </div>

                    {parsedChangeFor > total && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-semibold flex items-center justify-between">
                        <span>Troco a ser devolvido pelo motoboy:</span>
                        <span className="text-sm font-bold text-emerald-800 tabular-nums">
                          {formatCurrency(changeToReturn)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-stone-600">
                    Você pagará o valor exato de <strong>{formatCurrency(total)}</strong> em dinheiro.
                  </p>
                )}
              </div>
            )}

            {/* Option 5: Combinação de Formas de Pagamento (Split / Misto) */}
            {paymentMethod === 'split' && (
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Split className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-950">
                      Dividir o Pagamento em 2 Formas
                    </span>
                  </div>
                  <span className="text-xs font-bold text-purple-900 tabular-nums">
                    Total: {formatCurrency(total)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Parte 1 */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-2.5">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      1ª Parte do Pagamento
                    </span>

                    <div>
                      <label className="text-[11px] text-stone-600 block mb-1">
                        Forma da 1ª Parte:
                      </label>
                      <select
                        value={splitMethod1}
                        onChange={(e) => setSplitMethod1(e.target.value as BasePaymentMethod)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium"
                      >
                        <option value="pix">PIX</option>
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="cash">Dinheiro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-600 block mb-1">
                        Valor da 1ª Parte:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={total - 1}
                        step="0.5"
                        value={splitAmount1}
                        onChange={(e) => setSplitAmount1(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-900"
                      />
                    </div>
                  </div>

                  {/* Parte 2 */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-2.5">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      2ª Parte do Pagamento (Restante)
                    </span>

                    <div>
                      <label className="text-[11px] text-stone-600 block mb-1">
                        Forma da 2ª Parte:
                      </label>
                      <select
                        value={splitMethod2}
                        onChange={(e) => setSplitMethod2(e.target.value as BasePaymentMethod)}
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium"
                      >
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="cash">Dinheiro</option>
                        <option value="pix">PIX</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-600 block mb-1">
                        Valor Restante Calculado:
                      </label>
                      <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-900 tabular-nums">
                        {formatCurrency(splitAmount2)}
                      </div>
                    </div>

                    {splitMethod2 === 'cash' && (
                      <div className="pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={splitNeedsChange2}
                            onChange={(e) => setSplitNeedsChange2(e.target.checked)}
                            className="rounded text-amber-800"
                          />
                          <span>Precisa de troco nesta parte em dinheiro?</span>
                        </label>
                        {splitNeedsChange2 && (
                          <input
                            type="text"
                            placeholder="Troco para quanto nesta parte?"
                            value={splitChangeFor2}
                            onChange={(e) => setSplitChangeFor2(e.target.value)}
                            className="mt-1 w-full p-1.5 bg-stone-50 border border-stone-200 rounded text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-purple-100 text-xs text-stone-700 flex items-center justify-between">
                  <span>Soma das partes:</span>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatCurrency(splitAmount1)} + {formatCurrency(splitAmount2)} = {formatCurrency(total)}
                  </span>
                </div>
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

          {/* Resumo Financeiro */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal dos Pratos e Bebidas ({items.length} itens)</span>
              <span className="font-semibold text-stone-900 tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de Entrega ({deliveryType === 'delivery' ? selectedNeighborhood.name : 'Balcão'})</span>
              <span className="font-semibold text-stone-900 tabular-nums">
                {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Desconto ({couponCode})</span>
                <span className="tabular-nums">- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Final</span>
              <span className="text-orange-950 font-display text-lg tabular-nums font-extrabold">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-5 bg-orange-600 hover:bg-orange-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-orange-200" />
            <span>
              {submitting
                ? 'Gravando Pedido na Nuvem...'
                : `Confirmar e Enviar Pedido (${formatCurrency(total)})`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
