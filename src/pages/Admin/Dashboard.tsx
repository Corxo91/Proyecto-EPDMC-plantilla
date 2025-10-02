import React, { useState } from 'react';
import { Package, Users, ShoppingBag, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminProviders } from './AdminProviders';

export function Dashboard() {
  const { user, isSeller, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  if (!user || !isSeller) {
    navigate('/');
    return null;
  }

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
   // { id: 'categories', label: 'Categorías', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return //<AdminCategories />;
      default:
        return <AdminProducts />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Vendedor</h1>
          <p className="text-gray-600">Gestiona tus productos y ventas</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* Pestañas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#058c42] text-[#058c42]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}