import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Receipt } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import apiConfig from '../services/api-config';
import { MenuItem, Promotion } from '../types';
import PaymentConfirmation from '../components/PaymentConfirmation';
import ReceiptModal from '../components/ReceiptModal';

const OrderPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const {
    items,
    subtotal,
    discount,
    total,
    selectedPromotion,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromotion,
  } = useCartStore();

  useEffect(() => {
    fetchMenuItems();
    fetchPromotions();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await apiConfig.menu.getAll();
      if (response.success && response.data) {
        setMenuItems(response.data);
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดเมนูได้');
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await apiConfig.promotion.getAll();
      if (response.success && response.data) {
        setPromotions(response.data.filter((p: Promotion) => p.active));
      }
    } catch (error) {
      toast.error('ไม่สามารถโหลดโปรโมชั่นได้');
    }
  };

  const categories = ['ทั้งหมด', ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const filteredMenuItems = selectedCategory === 'ทั้งหมด' 
    ? menuItems.filter(item => item.available)
    : menuItems.filter(item => item.category === selectedCategory && item.available);

  const handlePayment = () => {
    if (items.length === 0) {
      toast.error('กรุณาเลือกสินค้าก่อนชำระเงิน');
      return;
    }
    setShowPaymentConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => {
          const menuItem = menuItems.find(m => m.id === item.menuItemId);
          return {
            id: `item-${Date.now()}-${Math.random()}`, // temporary ID for frontend
            menuItemId: item.menuItemId,
            menuItemName: menuItem?.name || '',
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          };
        }),
        subtotal,
        discount,
        promotionId: selectedPromotion?.id,
        total,
        status: 'completed' as const,
      };

      const response = await apiConfig.order.create(orderData);
      if (response.success && response.data) {
        setCompletedOrder(response.data);
        setShowPaymentConfirmation(false);
        setShowReceipt(true);
        clearCart();
        toast.success('ชำระเงินสำเร็จ!');
      } else {
        toast.error(response.message || 'เกิดข้อผิดพลาดในการสร้างออเดอร์');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Menu Section */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">เมนูเครื่องดื่ม</h2>
          
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenuItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addItem(item)}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-gray-400 text-4xl">🥤</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ฿{item.price.toFixed(2)}
                  </span>
                  <button
                    className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-800">รายการสั่งซื้อ</h3>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.menuItem?.name}</h4>
                      <p className="text-sm text-gray-600">฿{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="p-1 text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promotion Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  โปรโมชั่น
                </label>
                <select
                  value={selectedPromotion?.id || ''}
                  onChange={(e) => {
                    const promo = promotions.find(p => p.id === e.target.value);
                    applyPromotion(promo);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">ไม่ใช้โปรโมชั่น</option>
                  {promotions.map(promo => (
                    <option key={promo.id} value={promo.id}>
                      {promo.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Summary */}
              <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span>ยอดรวม</span>
                  <span>฿{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด</span>
                    <span>-฿{discount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>ยอดสุทธิ</span>
                  <span className="text-primary-600">฿{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  ชำระเงิน
                </button>
                <button
                  onClick={clearCart}
                  className="w-full btn-secondary"
                >
                  ล้างรายการ
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && (
        <PaymentConfirmation
          items={items}
          subtotal={subtotal}
          discount={discount}
          total={total}
          promotion={selectedPromotion}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowPaymentConfirmation(false)}
          loading={loading}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default OrderPage;
