import React from 'react';
import { X, Clock, CheckCircle2, ChevronRight, Package, ArrowUpRight } from 'lucide-react';
import { Order } from '../types/delivery';
import { formatCurrency } from '../utils/formatters';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-xl font-bold">Meus Pedidos</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-2 stroke-1" />
              <p className="text-sm font-semibold text-stone-700">
                Você ainda não fez nenhum pedido
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Seus pedidos realizados aparecerão aqui para acompanhamento do almoço.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  onSelectOrder(order);
                }}
                className="bg-stone-50 hover:bg-amber-50/50 border border-stone-200 hover:border-amber-300 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">
                      Pedido #{order.orderNumber}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-200 text-stone-700">
                      {order.status === 'received'
                        ? 'Recebido'
                        : order.status === 'preparing'
                        ? 'No Fogão a Lenha'
                        : order.status === 'dispatched'
                        ? 'Em Trânsito'
                        : 'Entregue'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-1">
                    {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-amber-950 tabular-nums">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                <div className="p-2 text-stone-400 hover:text-amber-800">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
