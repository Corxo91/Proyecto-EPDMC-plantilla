import React, { createContext, useContext, ReactNode } from 'react';
import { useCart } from '../hooks/useCart';

const CartContext = createContext<ReturnType<typeof useCart> | null>(null);
// En tu context del carrito
const removeItemsByVendor = (phoneNumber, productIds) => {
  setItems(prevItems => 
    prevItems.filter(item => 
      !productIds.includes(item.product.id) || 
      item.product.users.telefono_whatsapp.replace(/\D/g, '') !== phoneNumber
    )
  );
};

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCart();
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}