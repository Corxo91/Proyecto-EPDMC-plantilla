import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Settings, PackageSearch } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartContext } from '../../context/CartContext';
import { CartDrawer } from '../Cart/CartDrawer';

export function Header() {
  const { user, isSeller, signOut } = useAuth();
  const { getTotalItems } = useCartContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
    
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('mobile-search-input')?.focus();
      }, 100);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const totalItems = getTotalItems();

  return (
    <>
      <header className="bg-[#0d2818] shadow-lg sticky top-0 z-50 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8"> {/*padding lateral */}
          {/* Fila principal siempre visible */}
          <div className="flex items-center justify-between h-14"> {/*Altura reducida */}
            {/* Logo y nombre - Más compacto */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0 min-w-0"> {/*Alineado a la izquierda */}
              <img 
                src="/favicon.png"
                alt="DLG Salon Logo"
                className="h-8 w-8" // Tamaño reducido del logo
              />
              {/* Nombre completo siempre visible */}
              <span className="text-white font-bold text-lg"> {/*Texto completo */}
                El Patio de Mi Casa
              </span>
            </Link>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </form>
            </div>

            {/* Controles desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/products" 
                className="text-white hover:text-[#16db65] transition-colors flex items-center space-x-1"
              >
                <PackageSearch className="w-5 h-5" />
                <span>Productos</span>
              </Link>
              
              <button 
                onClick={() => navigate('/cart')}
                className="relative text-white hover:text-[#16db65] transition-colors p-2"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white hover:text-[#16db65] transition-colors">
                    <User className="w-6 h-6" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                      Mi Perfil
                    </Link>
                    {isSeller && (
                      <Link to="/dashboard" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        Panel de Vendedor
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/seller-auth" className="text-white hover:text-[#16db65] transition-colors flex items-center space-x-1">
                    <Settings className="w-4 h-4" />
                    <span>Vendedores</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Controles móviles - Más compactos */}
            <div className="md:hidden flex items-center space-x-1"> {/*spacio reducido entre iconos */}
              {/* Icono de búsqueda */}
              <button 
                onClick={toggleSearch}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  isSearchOpen 
                    ? 'bg-[#16db65] text-white' 
                    : 'text-white hover:bg-[#04471c]'
                }`}
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />} {/* Iconos más pequeños */}
              </button>

              {/* Icono de carrito */}
              <button 
                onClick={() => navigate('/cart')}
                className="relative text-white hover:bg-[#04471c] p-1.5 rounded-full transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> {/* Icono más pequeño */}
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-medium min-w-[12px]">
                    {totalItems > 9 ? '9+' : totalItems} {/*Indicador más pequeño */}
                  </span>
                )}
              </button>

              {/* Icono de menú hamburguesa */}
              <button
                onClick={toggleMenu}
                className={`p-1.5 rounded-full transition-colors duration-200 ${
                  isMenuOpen 
                    ? 'bg-[#16db65] text-white' 
                    : 'text-white hover:bg-[#04471c]'
                }`}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />} {/*Iconos más pequeños */}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda desplegable para móvil - Más compacta */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isSearchOpen ? 'max-h-16 opacity-100 pb-3' : 'max-h-0 opacity-0' // Altura reducida
          }`}>
            <form onSubmit={handleSearch} className="relative">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#04471c] bg-[#052010] text-white placeholder-gray-300 focus:ring-2 focus:ring-[#16db65] focus:border-transparent transition-all duration-200" // ✅ Padding y texto reducidos
              />
              <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200 ${
                isSearchFocused ? 'text-[#16db65]' : 'text-gray-400'
              }`} /> {/* Icono más pequeño */}
            </form>
          </div>
        </div>

        {/* Menú móvil desplegable - Más compacto */}
        <div className={`md:hidden border-t border-[#04471c] bg-[#0a1f12] overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0' //  Altura máxima reducida
        }`}>
          <div className="py-2 space-y-0 px-3"> {/* Padding reducido */}
            <Link
              to="/products"
              className="flex items-center space-x-2 text-white hover:bg-[#04471c] transition-colors py-2 px-3 rounded-lg text-sm" // ✅ Texto más pequeño, padding reducido
              onClick={() => setIsMenuOpen(false)}
            >
              <PackageSearch className="w-4 h-4" /> {/* Icono más pequeño */}
              <span>Productos</span>
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-white hover:bg-[#04471c] transition-colors py-2 px-3 rounded-lg text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Mi Perfil</span>
                </Link>

                {isSeller && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-white hover:bg-[#04471c] transition-colors py-2 px-3 rounded-lg text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Panel de Vendedor</span>
                  </Link>
                )}
                
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-white hover:bg-[#04471c] transition-colors py-2 px-3 rounded-lg text-left w-full text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link
                to="/seller-auth"
                className="flex items-center space-x-2 text-white hover:bg-[#04471c] transition-colors py-2 px-3 rounded-lg text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Vendedores</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <style jsx>{`
        /* Breakpoint personalizado para pantallas muy pequeñas */
        @media (max-width: 360px) {
          .text-lg {
            font-size: 14px; /*  Tamaño de fuente reducido para pantallas muy pequeñas */
          }
        }
      `}</style>
    </>
  );
}