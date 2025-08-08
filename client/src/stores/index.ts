import { create } from 'zustand';
import { MenuItem, OrderItem, Promotion } from '../types';

interface CartStore {
  items: OrderItem[];
  selectedPromotion?: Promotion;
  subtotal: number;
  discount: number;
  total: number;
  
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromotion: (promotion?: Promotion) => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  selectedPromotion: undefined,
  subtotal: 0,
  discount: 0,
  total: 0,

  addItem: (menuItem: MenuItem) => {
    const state = get();
    const existingItem = state.items.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      get().updateQuantity(menuItem.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        menuItemId: menuItem.id,
        menuItem,
        quantity: 1,
        price: menuItem.price,
        subtotal: menuItem.price,
      };
      
      set({ items: [...state.items, newItem] });
      get().calculateTotals();
    }
  },

  removeItem: (menuItemId: string) => {
    const state = get();
    set({ items: state.items.filter(item => item.menuItemId !== menuItemId) });
    get().calculateTotals();
  },

  updateQuantity: (menuItemId: string, quantity: number) => {
    const state = get();
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }

    const updatedItems = state.items.map(item => {
      if (item.menuItemId === menuItemId) {
        return {
          ...item,
          quantity,
          subtotal: item.price * quantity,
        };
      }
      return item;
    });

    set({ items: updatedItems });
    get().calculateTotals();
  },

  clearCart: () => {
    set({ 
      items: [], 
      selectedPromotion: undefined,
      subtotal: 0,
      discount: 0,
      total: 0 
    });
  },

  applyPromotion: (promotion?: Promotion) => {
    set({ selectedPromotion: promotion });
    get().calculateTotals();
  },

  calculateTotals: () => {
    const state = get();
    const subtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    let discount = 0;
    if (state.selectedPromotion) {
      const promo = state.selectedPromotion;
      if (!promo.minOrderAmount || subtotal >= promo.minOrderAmount) {
        if (promo.discountType === 'percentage') {
          discount = (subtotal * promo.discountValue) / 100;
        } else {
          discount = promo.discountValue;
        }
      }
    }

    const total = subtotal - discount;

    set({ subtotal, discount, total });
  },
}));

interface AppStore {
  currentPage: string;
  isLoading: boolean;
  error?: string;
  
  setCurrentPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'order',
  isLoading: false,
  error: undefined,

  setCurrentPage: (page: string) => set({ currentPage: page }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error?: string) => set({ error }),
}));
