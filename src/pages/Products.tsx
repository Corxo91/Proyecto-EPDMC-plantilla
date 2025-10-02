import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, Eye, EyeOff } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductGrid } from '../components/Products/ProductGrid';
import { CartDrawer } from '../components/Cart/CartDrawer';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, loading: productsLoading, searchProducts, getProductsByCategory } = useProducts();
  const { categories } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // Estados locales para los filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false); // ✅ Nuevo estado para mostrar inactivos
  
  const [showFilters, setShowFilters] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  const isUpdatingURL = useRef(false);

  // Obtener parámetros iniciales de la URL SOLO al montar el componente
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, []);

  // Actualizar URL cuando cambien los filtros (con debounce)
  useEffect(() => {
    if (isUpdatingURL.current) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const newSearch = params.toString();
      const currentSearch = window.location.search.substring(1);
      
      if (newSearch !== currentSearch) {
        isUpdatingURL.current = true;
        
        navigate(`?${newSearch}`, { 
          replace: true,
          state: { fromFilters: true }
        });

        setTimeout(() => {
          isUpdatingURL.current = false;
        }, 100);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, navigate]);

  // Filtrar productos - INCLUYENDO filtro por activo/inactivo
  useEffect(() => {
    let filtered = products;

    //Filtro por estado activo/inactivo (solo si showInactive es false)
    if (!showInactive) {
      filtered = filtered.filter(product => product.activo !== false);
    }

    if (selectedCategory !== 'all') {
      filtered = getProductsByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery);
    }

    if (locationFilter.trim()) {
      filtered = filtered.filter(product => 
        product.users?.provincia?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        product.users?.municipio?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, locationFilter, showInactive, getProductsByCategory, searchProducts]);

  // Memoizar handlers
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setLocationFilter('');
    
    if (window.innerWidth < 1024) {
      setShowFilters(false);
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all');
  }, []);

  const handleLocationChange = useCallback((location: string) => {
    setLocationFilter(location);
  }, []);

  const toggleShowInactive = useCallback(() => {
    setShowInactive(!showInactive);
  }, [showInactive]);

  // Cerrar filtros al hacer clic fuera (solo móvil)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters && 
          filtersRef.current && 
          !filtersRef.current.contains(event.target as Node) &&
          window.innerWidth < 1024) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchQuery('');
    setLocationFilter('');
    setShowInactive(false);
    setSearchParams({});
  }, [setSearchParams]);

  // Contar productos activos vs inactivos
  const activeProductsCount = products.filter(p => p.activo !== false).length;
  const inactiveProductsCount = products.filter(p => p.activo === false).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Productos</h1>
            <p className="text-gray-600">Descubre la mejor selección de productos locales</p>
          </div>

          {/* Controles */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            {/* Búsquedas */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Filtrar por ubicación..."
                  value={locationFilter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                <span>{showFilters ? 'Cerrar' : 'Filtros'}</span>
              </button>

              {/* Botón para mostrar/ocultar productos inactivos */}
              {inactiveProductsCount > 0 && (
                <button
                  onClick={toggleShowInactive}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showInactive 
                      ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>
                    {showInactive ? 'Ocultar inactivos' : `Mostrar inactivos (${inactiveProductsCount})`}
                  </span>
                </button>
              )}

              {(selectedCategory !== 'all' || searchQuery || locationFilter || showInactive) && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}

              <div className="text-sm text-gray-600">
                {filteredProducts.length} productos encontrados
                {showInactive && inactiveProductsCount > 0 && (
                  <span className="text-orange-600 ml-1">({inactiveProductsCount} inactivos)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-8 relative">
            {/* Sidebar de filtros - Versión desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Categorías</h3>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={() => handleCategoryChange('all')}
                      className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                    />
                    <span className="text-gray-700">Todas las categorías</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                      />
                      <span className="text-gray-700">{category.nombre}</span>
                    </label>
                  ))}
                </div>

                {/* Filtro de estado activo/inactivo en sidebar desktop */}
                {inactiveProductsCount > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={toggleShowInactive}
                        className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                      />
                      <span className="text-gray-700">
                        Mostrar productos inactivos ({inactiveProductsCount})
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Los productos inactivos no son visibles para los clientes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar de filtros - Versión móvil */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-start">
                <div 
                  ref={filtersRef}
                  className="bg-white w-4/5 max-w-sm h-full overflow-y-auto p-6 animate-slide-in-left"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg">Filtros</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Categorías</h4>
                        {selectedCategory !== 'all' && (
                          <button
                            onClick={() => handleCategoryChange('all')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category-mobile"
                            value="all"
                            checked={selectedCategory === 'all'}
                            onChange={() => handleCategoryChange('all')}
                            className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                          />
                          <span className="text-gray-700">Todas las categorías</span>
                        </label>
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="radio"
                              name="category-mobile"
                              value={category.id}
                              checked={selectedCategory === category.id}
                              onChange={() => handleCategoryChange(category.id)}
                              className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                            />
                            <span className="text-gray-700">{category.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filtro de estado activo/inactivo en móvil */}
                    {inactiveProductsCount > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Estado del producto</h4>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={toggleShowInactive}
                            className="mr-3 text-[#058c42] focus:ring-[#16db65]"
                          />
                          <span className="text-gray-700">
                            Mostrar productos inactivos ({inactiveProductsCount})
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Los productos inactivos no son visibles para los clientes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grid de productos */}
            <div className="flex-1">
              <ProductGrid 
                products={filteredProducts} 
                loading={productsLoading} 
                showInactive={showInactive} //  Pasar prop para mostrar estado
              />
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }
      `}</style>
    </>
  );
}