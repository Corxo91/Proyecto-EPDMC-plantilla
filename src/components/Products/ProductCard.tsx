import React, { useState } from 'react';
import { ShoppingCart, MapPin, Check, EyeOff } from 'lucide-react';
import { Database } from '../../lib/supabase';
import { useCartContext } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

interface ProductCardProps {
  product: Product;
  showInactive?: boolean;
}

export function ProductCard({ product, showInactive = false }: ProductCardProps) {
  const { addItem } = useCartContext();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Adding product to cart:', product);
    
    try {
      setIsAdding(true);
      addItem(product, 1);
      
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Función para formatear el precio con moneda
  const formatPrice = (price: number, currency: string) => {
    return `$${price.toFixed(2)} ${currency}`;
  };

  const locationText = product.users?.provincia && product.users?.municipio 
    ? `${product.users.provincia}, ${product.users.municipio}`
    : 'Ubicación no disponible';

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        !product.activo ? 'opacity-70 border-2 border-orange-300' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.imagen_url || 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg'}
          alt={product.nombre}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges superpuestos */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.destacado && (
            <span className="bg-[#16db65] text-[#0d2818] px-2 py-1 rounded-full text-xs font-medium">
              Destacado
            </span>
          )}
          {!product.activo && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <EyeOff className="w-3 h-3" />
              <span>Inactivo</span>
            </span>
          )}
        </div>

        {/* Categoría 
        <span className="absolute top-2 right-2 bg-[#058c42] text-white px-2 py-1 rounded-full text-xs font-medium">
          {product.categories.nombre}
        </span>
        */}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
          {product.nombre}
        </h3>

        {/*
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.descripcion}
        </p>
        */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{locationText}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* PRECIO CON MONEDA - CAMBIO PRINCIPAL */}
          <div className="text-2xl font-bold text-[#058c42]">
            {formatPrice(product.precio, product.moneda || 'USD')}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !product.activo}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
              justAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-[#04471c] hover:bg-[#058c42] text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isAdding ? 'Agregando...' : justAdded ? 'Agregado' : 'Agregar'}
            </span>
          </button>
        </div>

        {/* Estado del producto (solo si se muestran inactivos) */}
        {showInactive && (
          <div className="mt-2 text-xs">
            <span className={`inline-block px-2 py-1 rounded-full ${
              product.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {product.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}