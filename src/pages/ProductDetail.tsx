import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MapPin, User, Package, Check } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import { useCartContext } from '../context/CartContext';
import { CartDrawer } from '../components/Cart/CartDrawer';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, isCartOpen, openCart, closeCart } = useCartContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              nombre,
              descripcion,
              imagen_url,
              created_at
            ),
            users (
              id,
              nombre,
              apellidos,
              provincia,
              municipio,
              telefono_whatsapp,
              es_vendedor,
              created_at
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Función para formatear precio con moneda
  const formatPrice = (price: number, currency: string) => {
    return `$${price.toFixed(2)} ${currency}`;
  };

  const handleAddToCart = async () => {
    if (product) {
      console.log('Adding product from detail page:', product);
      
      try {
        setIsAdding(true);
        addItem(product, quantity);
        
        setJustAdded(true);
        openCart();
        setTimeout(() => setJustAdded(false), 2000);
        
        console.log('Product added successfully');
      } catch (error) {
        console.error('Error adding product to cart:', error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-[#058c42] hover:underline"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-[#058c42] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
                <img
                  src={product.imagen_url || 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg'}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#16db65] text-[#0d2818] px-3 py-1 rounded-full text-sm font-medium">
                    {product.categories.nombre}
                  </span>
                  {product.destacado && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Destacado
                    </span>
                  )}
                  {!product.activo && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      Inactivo
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.nombre}</h1>
                
                {/*PRECIO CON MONEDA - CAMBIO PRINCIPAL */}
                <p className="text-xl font-semibold text-[#058c42] mb-6">
                  {formatPrice(product.precio, product.moneda || 'USD')}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding || !product.activo}
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  justAdded 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#04471c] hover:bg-[#058c42] text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {justAdded ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                <span>
                  {isAdding 
                    ? 'Agregando...' 
                    : justAdded 
                      ? '¡Agregado al carrito!' 
                      : !product.activo
                        ? 'Producto no disponible'
                        : 'Agregar al Carrito'
                  }
                </span>
              </button>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-[#058c42]" />
                  Descripción del Producto
                </h3>
                <p className="text-gray-700 leading-relaxed">{product.descripcion}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#058c42]" />
                  Información del Vendedor
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{product.users?.nombre} {product.users?.apellidos}</p>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{product.users?.provincia}, {product.users?.municipio}</span>
                  </div>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4 mb-6">
                  <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!product.activo}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.activo}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}