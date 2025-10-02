import { useState, useEffect, useCallback } from 'react';
import { supabase, Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            nombre,
            descripcion,
            imagen_url,
            created_at
          ),
          users (
            id,
            nombre,
            apellidos,
            provincia, 
            municipio,
            telefono_whatsapp,
            es_vendedor,
            created_at
          )
        `)
        .eq('activo', true)  // FILTRO IMPORTANTE: Solo productos activos
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSellerProducts = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            nombre,
            descripcion,
            imagen_url,
            created_at
          ),
          users (
            id,
            nombre,
            apellidos,
            provincia,
            municipio,
            telefono_whatsapp,
            es_vendedor,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('activo', true)  //  FILTRO IMPORTANTE: Solo productos activos del vendedor
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getFeaturedProducts = useCallback(() => {
    return products.filter(product => product.destacado);
  }, [products]);

  const getProductsByCategory = useCallback((categoryId: string) => {
    return products.filter(product => product.categoria_id === categoryId);
  }, [products]);

  const searchProducts = useCallback((query: string) => {
    return products.filter(product =>
      product.nombre.toLowerCase().includes(query.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(query.toLowerCase())
    );
  }, [products]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    getSellerProducts,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts,
  };
}