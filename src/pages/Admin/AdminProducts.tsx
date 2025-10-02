// components/AdminProducts.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, AlertCircle, UserCheck } from 'lucide-react';
import { supabase, Database } from '../../lib/supabase';
import { useCategories } from '../../hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';
import { useProfileCheck } from '../../hooks/useProfileCheck';
import { useNavigate } from 'react-router-dom';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'];
  users: Database['public']['Tables']['users']['Row'];
};

type Currency = 'USD' | 'CUP';

export function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isProfileComplete, loading: profileLoading, refetch: refetchProfile } = useProfileCheck();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    moneda: 'USD' as Currency,
    imagen_url: '',
    categoria_id: '',
    proveedor_id: '',
    activo: true,
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (*),
          users (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      moneda: 'USD',
      imagen_url: '',
      categoria_id: '',
      proveedor_id: '',
      activo: true,
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Verificar nuevamente que el perfil esté completo antes de guardar
    await refetchProfile();
    if (!isProfileComplete) {
      alert('Por favor, completa tu perfil antes de crear productos. Serás redirigido a la página de perfil.');
      setShowModal(false);
      navigate('/profile');
      return;
    }
    
    try {
      setSaving(true);
      
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        moneda: formData.moneda,
        imagen_url: formData.imagen_url || '',
        destacado: false,
        categoria_id: formData.categoria_id,
        proveedor_id: formData.proveedor_id || '',
        user_id: user.id,
        activo: formData.activo,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .eq('user_id', user.id);

        if (error) throw error;
        alert('Producto actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('Producto creado exitosamente');
      }

      await fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      moneda: product.moneda as Currency || 'USD',
      imagen_url: product.imagen_url,
      categoria_id: product.categoria_id,
      proveedor_id: product.proveedor_id,
      activo: product.activo ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchProducts();
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const toggleProductStatus = async (product: Product) => {
    const newStatus = !product.activo;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ activo: newStatus })
        .eq('id', product.id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchProducts();
      alert(`Producto ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error al cambiar el estado del producto');
    }
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = formData.nombre.trim() && 
                     formData.descripcion.trim() && 
                     formData.precio.trim() && 
                     formData.categoria_id;

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Mis Productos</h2>
        {isProfileComplete ? (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#04471c] hover:bg-[#058c42] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/profile')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            title="Completa tu perfil para crear productos"
          >
            <UserCheck className="w-4 h-4" />
            <span>Completar Perfil Primero</span>
          </button>
        )}
      </div>

      {/* Banner de perfil incompleto */}
      {!isProfileComplete && !profileLoading && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-800 font-medium mb-1">
                Perfil Incompleto
              </h3>
              <p className="text-yellow-700 text-sm">
                Para crear productos, primero necesitas completar tu información de perfil. 
                <button 
                  onClick={() => navigate('/profile')}
                  className="ml-1 text-yellow-800 underline hover:text-yellow-900 font-medium"
                >
                  Completar perfil ahora
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar mis productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{products.length}</div>
          <div className="text-sm text-gray-600">Total de productos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.activo).length}
          </div>
          <div className="text-sm text-gray-600">Productos activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {products.filter(p => !p.activo).length}
          </div>
          <div className="text-sm text-gray-600">Productos desactivados</div>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">
            {searchQuery ? 'No se encontraron productos' : 'No tienes productos aún'}
          </p>
          {!searchQuery && isProfileComplete && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-[#04471c] hover:bg-[#058c42] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Crear tu primer producto
            </button>
          )}
          {!searchQuery && !isProfileComplete && (
            <button
              onClick={() => navigate('/profile')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Completar perfil para crear productos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 ${
              product.activo ? 'border-green-500' : 'border-gray-400 opacity-70'
            }`}>
              <div className="relative">
                <img
                  src={product.imagen_url || 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg'}
                  alt={product.nombre}
                  className="w-full h-48 object-cover"
                />
                {!product.activo && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Desactivado
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {product.nombre}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {product.destacado && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        Destacado
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 break-words">
                  {product.descripcion}
                </p>
                
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-base sm:text-lg font-bold text-[#058c42] whitespace-nowrap">
                    ${product.precio.toFixed(2)} {product.moneda || 'USD'}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded break-words max-w-[120px] truncate">
                    {product.categories.nombre}
                  </span>
                </div>
                
                {product.proveedor_id && (
                  <p className="text-xs text-gray-500 mb-4 truncate">
                    Proveedor: {product.proveedor_id}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.activo ? 'Activo' : 'Desactivado'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`p-2 rounded-full transition-colors ${
                        product.activo 
                          ? 'text-orange-600 hover:bg-orange-100' 
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      aria-label={product.activo ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {product.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                      aria-label="Editar producto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    required
                    placeholder="Ej: Tomates frescos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    required
                    placeholder="Describe tu producto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda *
                    </label>
                    <select
                      value={formData.moneda}
                      onChange={(e) => setFormData({ ...formData, moneda: e.target.value as Currency })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                      required
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CUP">CUP ($)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    placeholder="Ej: Finca Los Mangos (opcional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: Nombre del proveedor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16db65] focus:border-transparent"
                    placeholder="https://images.pexels.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: URL de imagen desde Pexels o similar
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-4 h-4 text-[#16db65] border-gray-300 rounded focus:ring-[#16db65]"
                  />
                  <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                    Producto activo (visible en la tienda)
                  </label>
                </div>
              
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !isFormValid}
                    className="px-4 py-2 bg-[#04471c] hover:bg-[#058c42] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}