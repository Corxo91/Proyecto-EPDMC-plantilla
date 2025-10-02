// components/ProfileGuard.tsx
import React from 'react';
import { useProfileCheck } from '../hooks/useProfileCheck';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, UserCheck } from 'lucide-react';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const { isProfileComplete, loading } = useProfileCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <UserCheck className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Perfil Requerido
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Para acceder a la gestión de productos, necesitas completar tu información de perfil primero. 
            Esto nos ayuda a conocer mejor tu negocio y ofrecer un mejor servicio.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-yellow-800 font-medium mb-1">
                  Información requerida
                </h3>
                <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                  <li>Nombre y apellidos</li>
                  <li>Dirección completa</li>
                  <li>Provincia y municipio</li>
                  <li>Teléfono de WhatsApp</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="bg-[#04471c] hover:bg-[#058c42] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Completar Mi Perfil
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}