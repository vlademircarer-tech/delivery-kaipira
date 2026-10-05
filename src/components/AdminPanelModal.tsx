import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  Printer,
  MessageCircle,
  AlertCircle,
  Database,
  DollarSign,
  Package,
  Layers,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { Order, OrderStatus } from '../types/delivery';
import { fetchCloudOrders, updateCloudOrderStatus } from '../services/supabase';
import { formatCurrency } from '../utils/formatters';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshOrders?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onRefreshOrders,
}) => {
  // Session-only admin authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders and filtering
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetchCloudOrders();
    setOrders(res.orders);
    setLoading(false);
    if (onRefreshOrders) onRefreshOrders();
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadOrders();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'dndigqol') {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Usuário ou senha incorretos. Verifique as credenciais.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateCloudOrderStatus(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setFeedback(`Status do pedido #${orderId} atualizado com sucesso!`);
      setTimeout(() => setFeedback(null), 3500);
      if (onRefreshOrders) onRefreshOrders();
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'todos' || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customer.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'received' || o.status === 'preparing').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                Painel Administrativo Kaipira
              </h2>
              <p className="text-xs text-stone-400">
                Gestão de Pedidos em Tempo Real · Restaurante Kaipira Piracicaba
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Sair
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          /* Login Form */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center flex-1 max-w-md mx-auto w-full">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 text-orange-900">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="font-display text-2xl font-bold text-stone-900 mb-1">
              Acesso Restrito da Cozinha
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Informe as credenciais do gerente para acessar o painel de pedidos na nuvem.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Login de Administrador
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-orange-600"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Entrar no Painel Administrativo
              </button>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Feedback alert */}
            {feedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Total de Pedidos
                </span>
                <span className="text-2xl font-bold text-stone-900 tabular-nums">
                  {orders.length}
                </span>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">
                  Faturamento Total
                </span>
                <span className="text-2xl font-extrabold text-orange-950 tabular-nums font-display">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Cozinha / Em Aberto
                </span>
                <span className="text-2xl font-bold text-amber-950 tabular-nums">
                  {pendingCount}
                </span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Sincronização Nuvem
                </span>
                <button
                  onClick={loadOrders}
                  disabled={loading}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-700 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Buscando...' : 'Atualizar Nuvem'}</span>
                </button>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-stone-100 rounded-xl">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'received', label: 'Recebido' },
                  { id: 'preparing', label: 'Fogão a Lenha' },
                  { id: 'dispatched', label: 'Em Trânsito' },
                  { id: 'delivered', label: 'Entregue' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === tab.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar cliente, número..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-orange-600"
                />
              </div>
            </div>

            {/* Orders Table / List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 text-stone-400">
                <Package className="w-10 h-10 mx-auto mb-2 stroke-1 text-stone-300" />
                <p className="text-sm font-semibold text-stone-700">
                  Nenhum pedido encontrado
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Novos pedidos realizados no delivery aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-stone-900">
                            Pedido #{ord.orderNumber}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(ord.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-800">
                          {ord.customer.name} · {ord.customer.phone}
                        </p>
                        <p className="text-xs text-stone-500">
                          {ord.customer.deliveryType === 'delivery'
                            ? `Entrega: ${ord.customer.street}, ${ord.customer.number} - ${ord.customer.neighborhood} (CEP: ${ord.customer.cep})`
                            : 'Retirada no Balcão (Av. Pompéia, 1018)'}
                        </p>
                      </div>

                      {/* Status Stepper Controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-800 cursor-pointer"
                        >
                          <option value="received">1. Recebido</option>
                          <option value="preparing">2. No Fogão a Lenha</option>
                          <option value="dispatched">3. Saiu com Motoboy</option>
                          <option value="delivered">4. Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>

                        <a
                          href={`https://wa.me/${ord.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${ord.customer.name}, aqui é do Restaurante Kaipira Piracicaba! Seu pedido #${ord.orderNumber} está com status: ${ord.status}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Falar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Items and payment breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-stone-700 block">Itens da Cozinha:</span>
                        {ord.items.map((it) => (
                          <div key={it.cartItemId} className="text-stone-800">
                            • {it.quantity}x {it.menuItem.name}
                            {it.customizations.removedIngredients.length > 0 && (
                              <span className="text-red-600 text-[11px] block pl-3">
                                [Sem: {it.customizations.removedIngredients.join(', ')}]
                              </span>
                            )}
                            {it.customizations.notes && (
                              <span className="text-stone-500 italic text-[11px] block pl-3">
                                [Obs: {it.customizations.notes}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="font-bold text-stone-700 block">Forma de Pagamento:</span>
                        <p className="text-amber-950 font-semibold">{ord.payment.summaryText}</p>
                        <p className="font-bold text-stone-900 pt-1">
                          Total: <span className="text-amber-900 tabular-nums">{formatCurrency(ord.total)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
