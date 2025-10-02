// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { ScrollToTop } from './components/ScrollToTop'; // Importa el componente
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { SellerAuth } from './pages/SellerAuth';
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';
import { Dashboard } from './pages/Admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Agrega ScrollToTop aquí */}
        <ScrollToTop />
        
        <Routes>
          {/* Rutas que no necesitan Header/Footer */}
          <Route path="/seller-auth" element={<SellerAuth />} />
          
          {/* Rutas principales con Layout */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    
                    {/* Rutas protegidas */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Rutas de administración */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requireSeller>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;