import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductGrid } from '../components/Products/ProductGrid';
import { CategoryGrid } from '../components/Categories/CategoryGrid';
import { CartDrawer } from '../components/Cart/CartDrawer';
import { Leaf, ShoppingBag, Users, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const featuredProducts = products.filter(p => p.destacado);

  // Imágenes para el carrusel
  const carouselImages = [
    {
      url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Ofertas Especiales',
      subtitle: 'Descubre nuestras promociones exclusivas'
    },
    {
      url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Productos Frescos',
      subtitle: 'Lo mejor de la temporada directamente a tu hogar'
    },
    {
      url: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Descuentos Exclusivos',
      subtitle: 'Aprovecha nuestras ofertas limitadas'
    },
    {
      url: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Lo Más Vendido',
      subtitle: 'Los productos favoritos de nuestros clientes'
    }
  ];

  // Auto-avance del carrusel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Carrusel de Ofertas - MODIFICADO para ocupar la mitad de la pantalla */}
        <section className="relative h-[20vh] bg-gray-800 overflow-hidden">
          {/* Imágenes del carrusel */}
          <div className="relative h-full">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${image.url}')` }}
                >
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                  
                  {/* Contenido del slide - centrado verticalmente */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10 px-4">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                      {image.title}
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl">
                      {image.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles del carrusel */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight size={28} />
          </button>

          {/* Indicadores de slide */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>

          
        </section>
  
<section className="py-8 bg-transparent"> {/* Cambiado de py-16 y quitado bg-gray-50 */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <CategoryGrid categories={categories} loading={categoriesLoading} />
  </div>
</section>

{/* Productos Destacados - menos separación */}
<section id="productos-destacados" className="py-8 bg-white"> {/* Cambiado de py-16 */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8"> {/* Reducido el margen inferior */}
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Productos Destacados</h2>
      <p className="text-gray-600 text-sm">Los favoritos de nuestros clientes</p>
    </div>
    
    <ProductGrid products={featuredProducts} loading={productsLoading} />
    
    {featuredProducts.length === 0 && !productsLoading && (
      <div className="text-center py-6">
        <p className="text-gray-500">No hay productos destacados en este momento</p>
      </div>
    )}
  </div>
</section>
      
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}