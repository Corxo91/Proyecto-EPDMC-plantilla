import React from 'react';
import { MapPin, Phone, Instagram, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0d2818] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
             
                {/* Logo como imagen /public) */}
                <img 
                 src="/favicon.png"  // Ruta directa (los archivos en /public se sirven desde la raíz)
                   alt="DLG Salon Logo"
                   className="h-10 w-10 mr-2"  // Ajusta el tamaño según necesites
                 />
              
              <span className="font-bold text-xl">El Patio de Mi Casa</span>
            </div>
            <p className="text-gray-300 mb-4">
              Tu tienda online de confianza para productos locales y de calidad.
            </p>
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span>Disponibilidad de 24 horas</span>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products" className="text-gray-300 hover:text-[#16db65] transition-colors">
                  Todos los Productos
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-[#16db65] transition-colors">
                  Acerca de Nosotros
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-[#16db65] transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-[#16db65] transition-colors">
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contáctanos</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Matanzas Cuba</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+53 56108902</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Instagram className="w-4 h-4 flex-shrink-0" />
                <span>@elpatiodemicasaencuba</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#04471c] mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 El Patio de Mi Casa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}