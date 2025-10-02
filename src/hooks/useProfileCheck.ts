
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useProfileCheck() {
  const { user } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfileCompletion = async () => {
    if (!user) {
      setIsProfileComplete(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('nombre, apellidos, direccion, provincia, municipio, telefono_whatsapp')
        .eq('id', user.id)
        .single();

      if (error) {
        setIsProfileComplete(false);
        setLoading(false);
        return;
      }

      // Verificar que todos los campos requeridos estén completos
      const requiredFields = ['nombre', 'apellidos', 'direccion', 'provincia', 'municipio', 'telefono_whatsapp'];
      const isComplete = requiredFields.every(field => 
        data[field] && data[field].toString().trim().length > 0
      );

      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Error checking profile:', error);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, [user]);

  return { isProfileComplete, loading, refetch: checkProfileCompletion };
}