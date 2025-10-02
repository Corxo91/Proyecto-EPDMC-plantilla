import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowLeft, Send, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { CartDrawer } from '../components/Cart/CartDrawer';

export function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartContext();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingPhone, setCurrentProcessingPhone] = useState(null);
  const [sendingItems, setSendingItems] = useState(new Set());
  const [sendingGroups, setSendingGroups] = useState(new Set());

  // Función para agrupar items por número telefónico
  const getItemsByPhoneNumber = () => {
    const groupedByPhone = {};
    
    items.forEach(item => {
      if (item.product && item.product.users && item.product.users.telefono_whatsapp) {
        const phone = item.product.users.telefono_whatsapp.replace(/\D/g, '');
        
        if (!groupedByPhone[phone]) {
          groupedByPhone[phone] = {
            seller: item.product.users,
            items: [],
            phone: phone,
            total: 0
          };
        }
        groupedByPhone[phone].items.push(item);
        groupedByPhone[phone].total += item.product.precio * item.quantity;
      } else {
        console.error('Producto sin información de vendedor o WhatsApp:', item.product);
      }
    });
    
    return Object.values(groupedByPhone);
  };

  // Función para enviar un grupo completo de productos (mismo número telefónico)
  const handleSendGroup = async (group) => {
    if (!group.phone || group.items.length === 0) {
      alert('Error: No se pudo obtener la información del grupo');
      return;
    }

    setSendingGroups(prev => new Set(prev).add(group.phone));
    
    try {
      if (!group.phone || group.phone.length < 10) {
        alert('Error: El vendedor no tiene un número de WhatsApp válido');
        return;
      }

      let message = `🛒 *Nuevo Pedido - El Patio de Mi Casa*\n\n`;
      message += `📋 *Productos solicitados:*\n`;
      
      group.items.forEach((item) => {
        const itemTotal = item.product.precio * item.quantity;
        message += `• ${item.product.nombre} x${item.quantity} - $${itemTotal.toFixed(2)}\n`;
      });

      message += `\n💰 *Total del pedido: $${group.total.toFixed(2)}*\n\n`;
      message += `🏪 *Vendedor:* ${group.seller.nombre || 'Vendedor'} ${group.seller.apellidos || ''}\n`;
      if (group.seller.provincia || group.seller.municipio) {
        message += `📍 *Ubicación:* ${group.seller.provincia || ''}, ${group.seller.municipio || ''}`;
      }

      const whatsappUrl = `https://wa.me/${group.phone}?text=${encodeURIComponent(message)}`;
      
      // Abrir en nueva pestaña
      window.open(whatsappUrl, '_blank');
      
      // ELIMINADO: No eliminar productos del carrito
      // Mostrar confirmación sin eliminar productos
      setTimeout(() => {
        alert(`¡Pedido completo enviado a ${group.seller.nombre} por WhatsApp! Los productos se mantienen en tu carrito por si deseas hacer más pedidos.`);
      }, 1000);
      
    } catch (error) {
      console.error('Error enviando grupo de productos:', error);
      alert('Error al enviar el grupo de productos');
    } finally {
      // Quitar el grupo de la lista de enviándose después de un delay
      setTimeout(() => {
        setSendingGroups(prev => {
          const newSet = new Set(prev);
          newSet.delete(group.phone);
          return newSet;
        });
      }, 1500);
    }
  };

  // Función para enviar un producto individual
  const handleSendSingleProduct = async (item) => {
    if (!item.product.users?.telefono_whatsapp) {
      alert('Error: No se pudo obtener la información de contacto del vendedor');
      return;
    }

    setSendingItems(prev => new Set(prev).add(item.product.id));
    
    try {
      const phone = item.product.users.telefono_whatsapp.replace(/\D/g, '');
      
      if (!phone || phone.length < 10) {
        alert('Error: El vendedor no tiene un número de WhatsApp válido');
        return;
      }

      const itemTotal = item.product.precio * item.quantity;
      
      let message = `🛒 *Nuevo Pedido - El Patio de Mi Casa*\n\n`;
      message += `📋 *Producto solicitado:*\n`;
      message += `• ${item.product.nombre} x${item.quantity} - $${itemTotal.toFixed(2)}\n`;
      message += `\n💰 *Total: $${itemTotal.toFixed(2)}*\n\n`;
      message += `🏪 *Vendedor:* ${item.product.users.nombre || 'Vendedor'} ${item.product.users.apellidos || ''}\n`;
      if (item.product.users.provincia || item.product.users.municipio) {
        message += `📍 *Ubicación:* ${item.product.users.provincia || ''}, ${item.product.users.municipio || ''}`;
      }

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      // Abrir en nueva pestaña
      window.open(whatsappUrl, '_blank');
      
      //ELIMINADO: No eliminar el producto individual después de enviar
      setTimeout(() => {
        alert(`¡Pedido enviado a ${item.product.users.nombre} por WhatsApp! El producto se mantiene en tu carrito por si deseas hacer más pedidos.`);
      }, 1000);
      
    } catch (error) {
      console.error('Error enviando producto individual:', error);
      alert('Error al enviar el producto');
    } finally {
      setTimeout(() => {
        setSendingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.product.id);
          return newSet;
        });
      }, 1500);
    }
  };

  // Función para enviar todo el carrito (todos los grupos)
  const handleCheckoutAll = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setIsProcessing(true);

    try {
      const itemsByPhone = getItemsByPhoneNumber();

      if (itemsByPhone.length === 0) {
        alert('Error: No se pudo obtener la información de contacto de los vendedores');
        setIsProcessing(false);
        return;
      }

      const validSellers = itemsByPhone.filter(({ phone }) => phone && phone.length >= 10);

      if (validSellers.length === 0) {
        alert('Error: Ningún vendedor tiene un número de WhatsApp válido');
        setIsProcessing(false);
        return;
      }

      // Procesar cada grupo secuencialmente
      for (let i = 0; i < validSellers.length; i++) {
        const group = validSellers[i];
        setCurrentProcessingPhone(group.phone);
        
        // Usar la función handleSendGroup para cada grupo
        await new Promise((resolve) => {
          const processGroup = async () => {
            let message = `🛒 *Nuevo Pedido - El Patio de Mi Casa*\n\n`;
            message += `📋 *Productos solicitados:*\n`;
            
            group.items.forEach((item) => {
              const itemTotal = item.product.precio * item.quantity;
              message += `• ${item.product.nombre} x${item.quantity} - $${itemTotal.toFixed(2)}\n`;
            });

            message += `\n💰 *Total del pedido: $${group.total.toFixed(2)}*\n\n`;
            message += `🏪 *Vendedor:* ${group.seller.nombre || 'Vendedor'} ${group.seller.apellidos || ''}\n`;
            if (group.seller.provincia || group.seller.municipio) {
              message += `📍 *Ubicación:* ${group.seller.provincia || ''}, ${group.seller.municipio || ''}`;
            }

            const whatsappUrl = `https://wa.me/${group.phone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            // ELIMINADO: No eliminar productos del grupo
            setTimeout(() => {
              resolve();
            }, 1000);
          };
          
          processGroup();
        });
        
        // Esperar entre grupos
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setCurrentProcessingPhone(null);
      setIsProcessing(false);
      
      setTimeout(() => {
        alert(`¡Todos los pedidos han sido enviados por WhatsApp! Los productos se mantienen en tu carrito por si deseas hacer más pedidos.`);
      }, 500);
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      setCurrentProcessingPhone(null);
      setIsProcessing(false);
    }
  };

  const phoneGroups = getItemsByPhoneNumber();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#058c42] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continuar comprando</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Carrito de Compras</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-600 mb-4">Tu carrito está vacío</h2>
              <p className="text-gray-500 mb-6">¡Agrega algunos productos para comenzar!</p>
              <Link
                to="/products"
                className="bg-[#04471c] hover:bg-[#058c42] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de productos agrupados por vendedor */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Productos en tu carrito</h2>
                      <button
                        onClick={clearCart}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Vaciar carrito
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {phoneGroups.map((group, groupIndex) => {
                      const isGroupSending = sendingGroups.has(group.phone);
                      const hasMultipleProducts = group.items.length > 1;
                      
                      return (
                        <div key={group.phone || groupIndex} className="p-6">
                          {/* Encabezado del grupo */}
                          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-blue-800">
                                  Vendedor: {group.seller.nombre} {group.seller.apellidos}
                                </h3>
                                <p className="text-sm text-blue-600">
                                  Teléfono: {group.seller.telefono_whatsapp}
                                </p>
                                <p className="text-sm font-semibold text-green-700 mt-1">
                                  Total del vendedor: ${group.total.toFixed(2)}
                                </p>
                              </div>
                              
                              {/* Botón para enviar grupo completo */}
                              <button
                                onClick={() => handleSendGroup(group)}
                                disabled={isGroupSending}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                  isGroupSending 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#16db65] hover:bg-[#14c459] text-white'
                                }`}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>
                                  {isGroupSending ? 'Enviando...' : 
                                   hasMultipleProducts ? `Enviar todo (${group.items.length})` : 'Enviar producto'}
                                </span>
                              </button>
                            </div>
                            {currentProcessingPhone === group.phone && (
                              <p className="text-sm text-green-600 mt-2">
                                ⏳ Enviando mensaje a este vendedor...
                              </p>
                            )}
                          </div>

                          {/* Productos del grupo */}
                          <div className="space-y-4">
                            {group.items.map((item) => {
                              const isSending = sendingItems.has(item.product.id) || isGroupSending;
                              
                              return (
                                <div key={item.product.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                                  <img
                                    src={item.product.imagen_url || 'https://images.pexels.com/photos-1414651/pexels-photo-1414651.jpeg'}
                                    alt={item.product.nombre}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">{item.product.nombre}</h3>
                                    <p className="text-lg font-semibold text-[#058c42]">
                                      ${item.product.precio.toFixed(2)} x {item.quantity} = ${(item.product.precio * item.quantity).toFixed(2)}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center space-x-3">
                                        <button
                                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                          disabled={isSending}
                                          className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium">{item.quantity}</span>
                                        <button
                                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                          disabled={isSending}
                                          className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {/* Botón de enviar individual - SOLO muestra cuando hay múltiples productos */}
                                        {hasMultipleProducts && (
                                          <button
                                            onClick={() => handleSendSingleProduct(item)}
                                            disabled={isSending}
                                            className={`flex items-center space-x-2 px-3 py-1 rounded-lg font-medium transition-colors text-sm ${
                                              isSending 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                          >
                                            <Send className="w-3 h-3" />
                                            <span>{isSending ? '...' : 'Enviar solo'}</span>
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={() => removeItem(item.product.id)}
                                          disabled={isSending}
                                          className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Botón para enviar todo el carrito 
                {phoneGroups.length > 1 && (
                  <button
                    onClick={handleCheckoutAll}
                    disabled={isProcessing}
                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#04471c] hover:bg-[#058c42] text-white'
                    }`}
                  >
                    {isProcessing ? 'Procesando todos los vendedores...' : `Enviar todo a ${phoneGroups.length} vendedores`}
                  </button>
                )}
                  */}
              </div>

              {/* Resumen del pedido */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Resumen del Pedido</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span>A coordinar</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-[#058c42]">${getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Nota:</strong> Los productos se mantendrán en tu carrito después de enviar por WhatsApp para que puedas hacer más pedidos fácilmente.
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {phoneGroups.length} vendedor(s) en tu carrito
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}