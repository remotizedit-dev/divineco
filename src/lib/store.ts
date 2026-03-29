
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    color?: string;
    size?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantKey?: string) => void;
  updateQuantity: (id: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const variantKey = `${item.variant?.color || ''}-${item.variant?.size || ''}`;
        const existingItemIndex = currentItems.findIndex(i => 
          i.id === item.id && `${i.variant?.color || ''}-${i.variant?.size || ''}` === variantKey
        );

        if (existingItemIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (id, variantKey) => {
        set({
          items: get().items.filter(i => 
            !(i.id === id && `${i.variant?.color || ''}-${i.variant?.size || ''}` === (variantKey || ''))
          )
        });
      },
      updateQuantity: (id, quantity, variantKey) => {
        set({
          items: get().items.map(i => {
            const iVariantKey = `${i.variant?.color || ''}-${i.variant?.size || ''}`;
            if (i.id === id && iVariantKey === (variantKey || '')) {
              return { ...i, quantity: Math.max(1, quantity) };
            }
            return i;
          })
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    {
      name: 'divine-cart-storage',
    }
  )
);
