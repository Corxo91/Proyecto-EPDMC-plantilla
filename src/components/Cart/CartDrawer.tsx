import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart, getItemsByProvider, createOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      alert('Por favor inicia sesión para continuar');
      onClose();
      navigate('/seller-auth');
      return;
    }

    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    try {
      // Crear orden en la base de datos
      await createOrder(user.id);

      // Agrupar items por vendedor
      const itemsByProvider = getItemsByProvider();

      // Crear mensajes para cada vendedor
      itemsByProvider.forEach(({ seller, items: sellerItems }) => {
        let message = `🛒 *Nuevo Pedido - El Patio de Mi Casa*\n\n`;
        message += `👤 *Cliente:* ${seller.nombre || user?.email}\n`;
        message += `📧 *Email:* ${user?.email}\n\n`;
        message += `📋 *Productos:*\n`;

        let sellerTotal = 0;
        sellerItems.forEach((item) => {
          const itemTotal = item.product.precio * item.quantity;
          sellerTotal += itemTotal;
          message += `• ${item.product.nombre} x${item.quantity} - $${itemTotal.toFixed(2)}\n`;
        });

        message += `\n💰 *Total: $${sellerTotal.toFixed(2)}*\n\n`;
        message += `🏪 *Vendedor:* ${seller.nombre} ${seller.apellidos}\n`;
        message += `📍 *Ubicación:* ${seller.provincia}, ${seller.municipio}`;

        const phoneNumber = seller.telefono_whatsapp?.replace(/\D/g, '') || '';
        if (phoneNumber) {
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else {
          alert(`No se encontró número de WhatsApp para el vendedor ${seller.nombre}`);
        }
      });

      clearCart();
      onClose();
      alert('Pedidos enviados por WhatsApp');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al procesar el pedido');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <img
                    src={item.product.imagen_url || 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg'}
                    alt={item.product.nombre}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.nombre}</h4>
                    <p className="text-[#058c42] font-semibold">${item.product.precio.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{item.product.users?.nombre} {item.product.users?.apellidos}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-[#058c42]">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-[#04471c] hover:bg-[#058c42] text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Finalizar Pedido por WhatsApp
            </button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Se abrirá WhatsApp para cada vendedor
            </p>
          </div>
        )}
      </div>
    </div>
  );
}