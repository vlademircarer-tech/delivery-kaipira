import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { MenuItem, SelectedCustomizations, CartItem } from '../types/delivery';
import { formatCurrency } from '../utils/formatters';

interface CustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize default options when modal opens with a new item
  useEffect(() => {
    if (!item) return;

    setQuantity(1);
    setRemovedIngredients([]);
    setNotes('');
    setValidationError(null);

    const initialSelections: Record<string, string[]> = {};
    item.optionGroups?.forEach((group) => {
      const defaults = group.options
        .filter((opt) => opt.defaultSelected)
        .map((opt) => opt.id);

      if (defaults.length > 0) {
        initialSelections[group.id] = defaults;
      } else if (group.required && group.type === 'single' && group.options.length > 0) {
        initialSelections[group.id] = [group.options[0].id];
      } else {
        initialSelections[group.id] = [];
      }
    });

    setSelectedOptions(initialSelections);
  }, [item]);

  // Handle single selection
  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
    setValidationError(null);
  };

  // Handle multiple selection
  const handleMultipleToggle = (groupId: string, optionId: string, max?: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [groupId]: current.filter((id) => id !== optionId),
        };
      } else {
        if (max && current.length >= max) {
          return prev; // Reached limit
        }
        return {
          ...prev,
          [groupId]: [...current, optionId],
        };
      }
    });
    setValidationError(null);
  };

  // Handle toggle removed ingredient
  const handleToggleRemoveIngredient = (ing: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  // Calculate unit price and total price
  const { unitPrice, totalPrice } = useMemo(() => {
    let price = item.price;

    item.optionGroups?.forEach((group) => {
      const selected = selectedOptions[group.id] || [];
      group.options.forEach((opt) => {
        if (selected.includes(opt.id)) {
          price += opt.price;
        }
      });
    });

    return {
      unitPrice: price,
      totalPrice: price * quantity,
    };
  }, [item, selectedOptions, quantity]);

  // Validate required options before adding to cart
  const handleConfirmAddToCart = () => {
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        if (group.required) {
          const selected = selectedOptions[group.id] || [];
          if (selected.length === 0) {
            setValidationError(`Por favor, selecione uma opção em "${group.name}".`);
            return;
          }
        }
      }
    }

    const customizations: SelectedCustomizations = {
      selectedOptions,
      removedIngredients,
      notes: notes.trim(),
    };

    const cartItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      menuItem: item,
      quantity,
      customizations,
      unitPrice,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative aspect-16/9 w-full bg-stone-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-widest">
              Personalização de Ingredientes
            </span>
            <h2 className="font-display text-2xl font-bold text-stone-900 mt-1">
              {item.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              {item.description}
            </p>
            <div className="mt-2 text-base font-bold text-amber-900 tabular-nums">
              Preço base: {formatCurrency(item.price)}
            </div>
          </div>

          {/* Option Groups (Single & Multiple) */}
          {item.optionGroups && item.optionGroups.length > 0 && (
            <div className="space-y-6 pt-2">
              {item.optionGroups.map((group) => {
                const currentSelected = selectedOptions[group.id] || [];

                return (
                  <div key={group.id} className="border-t border-stone-200/80 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900">
                          {group.name}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {group.required
                            ? 'Obrigatório · Escolha 1 opção'
                            : group.max
                            ? `Opcional · Até ${group.max} escolhas`
                            : 'Opcional'}
                        </p>
                      </div>
                      {group.required && currentSelected.length > 0 && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Selecionado
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {group.options.map((opt) => {
                        const isSelected = currentSelected.includes(opt.id);

                        return (
                          <label
                            key={opt.id}
                            onClick={() => {
                              if (group.type === 'single') {
                                handleSingleSelect(group.id, opt.id);
                              } else {
                                handleMultipleToggle(group.id, opt.id, group.max);
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-amber-800 bg-amber-50/50 shadow-xs'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-${
                                  group.type === 'single' ? 'full' : 'md'
                                } border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-amber-800 border-amber-800 text-white'
                                    : 'border-stone-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-stone-800">
                                {opt.name}
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-stone-600 tabular-nums">
                              {opt.price > 0 ? `+ ${formatCurrency(opt.price)}` : 'Incluso'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Remove Ingredients Section */}
          {item.removableIngredients && item.removableIngredients.length > 0 && (
            <div className="border-t border-stone-200/80 pt-4">
              <h4 className="text-sm font-semibold text-stone-900">
                Deseja retirar algum ingrediente?
              </h4>
              <p className="text-xs text-stone-500 mb-3">
                Marque abaixo os itens que não quer no seu prato.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.removableIngredients.map((ing) => {
                  const isRemoved = removedIngredients.includes(ing);

                  return (
                    <label
                      key={ing}
                      onClick={() => handleToggleRemoveIngredient(ing)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        isRemoved
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                          isRemoved
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isRemoved && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <span>Sem {ing}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Notes Section */}
          <div className="border-t border-stone-200/80 pt-4">
            <h4 className="text-sm font-semibold text-stone-900">
              Observações especiais para a cozinha
            </h4>
            <p className="text-xs text-stone-500 mb-2">
              Alguma preferência especial? (Ex: caprichar no limão, vinagrete separado, etc.)
            </p>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite aqui sua observação..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 transition-all placeholder:text-stone-400"
            />
          </div>

          {/* Validation Error banner */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer: Quantity Stepper & Add Button */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1.5 hover:bg-stone-100 disabled:opacity-30 rounded-lg text-stone-700 transition-colors cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-bold text-sm text-stone-900 tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            onClick={handleConfirmAddToCart}
            className="flex-1 py-3 px-5 bg-amber-800 hover:bg-amber-900 active:scale-98 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-between cursor-pointer"
          >
            <span>Adicionar à Sacola</span>
            <span className="tabular-nums font-bold">
              {formatCurrency(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
