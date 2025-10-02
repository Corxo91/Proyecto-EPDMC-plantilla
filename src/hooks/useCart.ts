import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('elpatio_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Loaded cart from localStorage:', parsedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        setItems([]);
        localStorage.removeItem('elpatio_cart');
      }
    }
  }, []);

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'elpatio_cart') {
        try {
          const newCart = e.newValue ? JSON.parse(e.newValue) : [];
          if (JSON.stringify(newCart) !== JSON.stringify(items)) {
            setItems(newCart);
          }
        } catch (error) {
          console.error('Error parsing cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [items]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    console.log('Saving cart to localStorage:', items);
    localStorage.setItem('elpatio_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    console.log('addItem called with:', { product: product.nombre, quantity });
    
    setItems(currentItems => {
      console.log('Current items before adding:', currentItems);
      const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        console.log('Updated existing item:', updatedItems);
        return updatedItems;
      } else {
        // Agregar nuevo producto
        const newItems = [...currentItems, { product, quantity }];
        console.log('Added new item:', newItems);
        return newItems;
      }
    });
  };

  const removeItem = (productId: string) => {
    console.log('Removing item:', productId);
    setItems(currentItems => {
      const filtered = currentItems.filter(item => item.product.id !== productId);
      console.log('Items after removal:', filtered);
      return filtered;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log('Updating quantity:', { productId, quantity });
    
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setItems([]);
    localStorage.removeItem('elpatio_cart');
  };

  const getTotalPrice = () => {
    const total = items.reduce((total, item) => total + (item.product.precio * item.quantity), 0);
    console.log('Total price calculated:', total);
    return total;
  };

  const getTotalItems = () => {
    const total = items.reduce((total, item) => total + item.quantity, 0);
    console.log('Total items calculated:', total);
    return total;
  };

  const getItemsByProvider = () => {
    const itemsByProvider = new Map<string, { seller: Product['users']; items: CartItem[] }>();

    items.forEach(item => {
      const sellerId = item.product.user_id || '';
      const seller = item.product.users;

      if (!itemsByProvider.has(sellerId)) {
        itemsByProvider.set(sellerId, {
          seller,
          items: []
        });
      }

      itemsByProvider.get(sellerId)!.items.push(item);
    });

    return Array.from(itemsByProvider.values());
  };

  const createOrder = async (userId: string) => {
    if (!userId || items.length === 0) {
      console.log('Cannot create order: missing userId or empty cart');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('Creating order for user:', userId);

      // Crear orden principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: getTotalPrice(),
          estado: 'pendiente'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      console.log('Order created:', order);

      // Crear items de la orden
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        cantidad: item.quantity,
        precio_unitario: item.product.precio
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      console.log('Order items created successfully');

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemsByProvider,
    createOrder,
    isLoading,
  };
}