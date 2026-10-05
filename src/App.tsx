import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MenuSection } from './components/MenuSection';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPaymentPage } from './components/CheckoutPaymentPage';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { RestaurantInfoModal } from './components/RestaurantInfoModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { Footer } from './components/Footer';

import { MenuItem, CartItem, NeighborhoodDelivery, Order, OrderStatus } from './types/delivery';
import { PIRACICABA_NEIGHBORHOODS } from './data/piracicabaNeighborhoods';
import { persistOrderInCloud, fetchCloudOrders, updateCloudOrderStatus } from './services/supabase';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from './utils/formatters';

export default function App() {
  // Session memory only: Cart items (NO LOCALSTORAGE RECORDING AS INSTRUCTED)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodDelivery>(
    PIRACICABA_NEIGHBORHOODS[0] // Piracicamirim default
  );

  // Session memory only: Coupon
  const [couponCode, setCouponCode] = useState<string>('');

  // Orders loaded directly from Cloud (Supabase)
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Modal visibility states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isRestaurantInfoOpen, setIsRestaurantInfoOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);

  // Load orders directly from Cloud on mount
  useEffect(() => {
    fetchCloudOrders().then((res) => {
      setOrders(res.orders);
    });
  }, []);

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Discount calculation
  const discountAmount = couponCode === 'KAIPIRA10' ? cartSubtotal * 0.1 : 0;
  const deliveryFee = deliveryType === 'delivery' ? selectedNeighborhood.fee : 0;
  const cartTotal = Math.max(0, cartSubtotal + deliveryFee - discountAmount);

  // Cart operations (Memory only)
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) =>
          it.menuItem.id === newItem.menuItem.id &&
          JSON.stringify(it.customizations) === JSON.stringify(newItem.customizations)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + newItem.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) =>
        it.cartItemId === cartItemId
          ? { ...it, quantity: newQuantity, totalPrice: it.unitPrice * newQuantity }
          : it
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleApplyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'KAIPIRA10') {
      setCouponCode('KAIPIRA10');
      return { success: true, message: 'Cupom KAIPIRA10 aplicado! 10% de desconto.' };
    }
    if (clean === 'PIRACICABA') {
      setCouponCode('PIRACICABA');
      return { success: true, message: 'Cupom PIRACICABA aplicado! Frete com desconto especial.' };
    }
    return { success: false, message: 'Cupom inválido. Tente KAIPIRA10.' };
  };

  const handleSelectItemForCustomization = (item: MenuItem) => {
    setCustomizingItem(item);
    setIsCustomizeOpen(true);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order created -> Persists exclusively in cloud Supabase
  const handleOrderCreated = async (order: Order) => {
    await persistOrderInCloud(order);

    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
    setActiveTrackingOrder(order);

    // Clear session cart
    setCartItems([]);

    setIsCheckoutOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateCloudOrderStatus(orderId, status);
    const updated = await fetchCloudOrders();
    setOrders(updated.orders);

    if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
      setActiveTrackingOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const scrollToMenu = () => {
    const el = document.getElementById('cardapio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 selection:bg-amber-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        cartItemCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRestaurantInfo={() => setIsRestaurantInfoOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        onOpenOrdersHistory={() => setIsOrdersHistoryOpen(true)}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
        hasOrders={orders.length > 0}
      />

      {/* Main Content */}
      <main className="flex-1 pb-20 sm:pb-12">
        {/* Hero Banner */}
        <HeroBanner
          onExploreMenu={scrollToMenu}
          onOpenLocation={() => setIsRestaurantInfoOpen(true)}
        />

        {/* Menu Section with expanded beverages and food */}
        <MenuSection
          onSelectItemForCustomization={handleSelectItemForCustomization}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenRestaurantInfo={() => setIsRestaurantInfoOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
      />

      {/* Mobile Floating Bottom Bar: "Ver Seu Pedido" */}
      {cartCount > 0 && !isCartOpen && !isCheckoutOpen && !isConfirmationOpen && (
        <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg md:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold flex items-center justify-between shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-200" />
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="text-sm">Ver Seu Pedido</span>
            </div>

            <div className="flex items-center gap-1.5 font-bold tabular-nums text-sm">
              <span>{formatCurrency(cartTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <CustomizeModal
        item={customizingItem}
        isOpen={isCustomizeOpen}
        onClose={() => {
          setIsCustomizeOpen(false);
          setCustomizingItem(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Drawer renamed to Seu Pedido */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        deliveryType={deliveryType}
        onSetDeliveryType={setDeliveryType}
        selectedNeighborhood={selectedNeighborhood}
        onSelectNeighborhood={setSelectedNeighborhood}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        couponCode={couponCode}
        onApplyCoupon={handleApplyCoupon}
        discountAmount={discountAmount}
      />

      {/* Página de Pagamentos & Cadastro com Busca CEP */}
      <CheckoutPaymentPage
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        items={cartItems}
        deliveryType={deliveryType}
        onSetDeliveryType={setDeliveryType}
        selectedNeighborhood={selectedNeighborhood}
        onSelectNeighborhood={setSelectedNeighborhood}
        couponCode={couponCode}
        discountAmount={discountAmount}
        onOrderCreated={handleOrderCreated}
      />

      {/* Confirmação e Acompanhamento de Pedido */}
      <OrderConfirmationModal
        order={activeTrackingOrder}
        isOpen={isConfirmationOpen}
        onClose={() => {
          setIsConfirmationOpen(false);
          setActiveTrackingOrder(null);
        }}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Painel Administrativo com Senha dndigqol e usuário admin */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshOrders={() => fetchCloudOrders().then((r) => setOrders(r.orders))}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <RestaurantInfoModal
        isOpen={isRestaurantInfoOpen}
        onClose={() => setIsRestaurantInfoOpen(false)}
      />

      <OrdersHistoryModal
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
        orders={orders}
        onSelectOrder={(order) => {
          setActiveTrackingOrder(order);
          setIsOrdersHistoryOpen(false);
          setIsConfirmationOpen(true);
        }}
      />
    </div>
  );
}
