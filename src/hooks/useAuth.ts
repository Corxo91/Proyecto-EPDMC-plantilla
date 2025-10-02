import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSellerStatus(session.user);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkSellerStatus(session.user);
        } else {
          setIsSeller(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSellerStatus = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('es_vendedor')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking seller status:', error);
        setIsSeller(false);
      } else {
        setIsSeller(data?.es_vendedor === true);
      }
    } catch (error) {
      console.error('Error in checkSellerStatus:', error);
      setIsSeller(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsSeller(false);
  };

  return {
    user,
    isSeller,
    loading,
    signOut,
  };
}