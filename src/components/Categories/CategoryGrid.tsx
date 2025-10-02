import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../lib/supabase';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoryGrid({ categories, loading }: CategoryGridProps) {
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Verificar visibilidad de botones
  const checkScrollButtons = () => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [categories]);

  // Scroll functions
  const scrollLeftHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRightHandler = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5; // Ajustar sensibilidad
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(checkScrollButtons, 100); // Esperar a que termine el scroll
  };

  // Mouse event handlers para desktop (opcional)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(checkScrollButtons, 100);
  };

  if (loading) {
    return (
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 bg-white rounded-lg shadow-md animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Botones de navegación */}
      {showLeftButton && (
        <button
          onClick={scrollLeftHandler}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#16db65] hover:bg-[#14c459] text-white rounded-full p-3 shadow-lg transition-all duration-300"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      )}

      {showRightButton && (
        <button
          onClick={scrollRightHandler}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#16db65] hover:bg-[#14c459] text-white rounded-full p-3 shadow-lg transition-all duration-300"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      )}

      {/* Contenedor del scroll horizontal */}
      <div 
        ref={sliderRef}
        className="overflow-x-auto scrollbar-hide pb-4 -mb-4"
        onScroll={checkScrollButtons}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex space-x-4 w-max min-w-full">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 w-40 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => navigate(`/products?category=${category.id}`)}
            >
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src={category.imagen_url || 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg'}
                  alt={category.nombre}
                  className="w-full h-32 object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 text-center text-sm">
                  {category.nombre}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilos para ocultar scrollbar  */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}