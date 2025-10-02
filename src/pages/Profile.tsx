// pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

export function Profile() {
  const { user, isSeller, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    email: '',
    telefono_whatsapp: '',
    provincia: '',
    municipio: '',
  });

  // Verificar si viene una redirección después de guardar
  const redirectAfterSave = location.state?.redirectAfterSave;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/seller-auth');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Si no existe el registro, no es un error - crearemos uno nuevo
      if (error && error.code === 'PGRST116') {
        console.log('No existe perfil, se creará uno nuevo');
        setProfile({
          nombre: user.user_metadata?.full_name?.split(' ')[0] || '',
          apellidos: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          direccion: '',
          email: user.email || '',
          telefono_whatsapp: '',
          provincia: '',
          municipio: '',
        });
        setLoading(false);
        return;
      }

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          nombre: data.nombre || '',
          apellidos: data.apellidos || '',
          direccion: data.direccion || '',
          email: data.email || user.email || '',
          telefono_whatsapp: data.telefono_whatsapp || '',
          provincia: data.provincia || '',
          municipio: data.municipio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validación básica
    if (!profile.nombre.trim() || !profile.apellidos.trim() || !profile.email.trim()) {
      alert('Por favor, completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos sin updated_at
      const profileData = {
        id: user.id,
        nombre: profile.nombre.trim(),
        apellidos: profile.apellidos.trim(),
        direccion: profile.direccion.trim(),
        email: profile.email.trim(),
        telefono_whatsapp: profile.telefono_whatsapp.trim(),
        provincia: profile.provincia.trim(),
        municipio: profile.municipio.trim(),
      };

      console.log('Enviando datos:', profileData);

      // Usar upsert simple
      const { error } = await supabase
        .from('users')
        .upsert(profileData);

      if (error) {
        console.error('Error de Supabase:', error);
        
        // Si es error de duplicado, intentar update
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('users')
            .update(profileData)
            .eq('id', user.id);
            
          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }
      
      alert('Perfil actualizado exitosamente');
      
      // Redirigir si se especificó una ruta de redirección
      if (redirectAfterSave) {
        navigate(redirectAfterSave);
      } else {
        // Recargar para asegurar que los datos se actualizan
        await fetchProfile();
      }
    } catch (error: any) {
      console.error('Error completo updating profile:', error);
      alert(`Error al actualizar el perfil: ${error.message || 'Por favor, intenta nuevamente'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-[#16db65] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#0d2818]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
              <p className="text-gray-600">
                {redirectAfterSave 
                  ? "Completa tu perfil para continuar con la gestión de productos" 
                  : "Gestiona tu información personal"
                }
              </p>
              {redirectAfterSave && (
                <p className="text-sm text-orange-600 mt-1">
                  * Todos los campos son requeridos para crear productos
                </p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={profile.nombre}
                  onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={profile.apellidos}
                  onChange={(e) => setProfile({ ...profile, apellidos: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                  required
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  value={profile.direccion}
                  onChange={(e) => setProfile({ ...profile, direccion: e.target.value })}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                  placeholder="Ingresa tu dirección completa"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {isSeller && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      value={profile.provincia}
                      onChange={(e) => setProfile({ ...profile, provincia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Municipio *
                    </label>
                    <input
                      type="text"
                      value={profile.municipio}
                      onChange={(e) => setProfile({ ...profile, municipio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={profile.telefono_whatsapp}
                    onChange={(e) => setProfile({ ...profile, telefono_whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    placeholder="+53 5XXX XXXX"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#04471c] hover:bg-[#058c42] text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>
                {loading 
                  ? 'Guardando...' 
                  : redirectAfterSave 
                    ? 'Guardar y Continuar' 
                    : 'Guardar Cambios'
                }
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}