import { useState, useEffect } from 'react';
import productoService from '../../services/productoService';
import { toPrice, toInteger } from '../../utils/dataTransformers';

interface Producto {
  id_producto?: number;
  id_categoria: number;
  sku?: string;          // ✅ Agregado SKU
  nombre: string;
  descripcion?: string;
  precio: number | string;
  stock: number | string;  // ✅ Cambiado a 'stock'
  stock_minimo?: number | string;
  activo?: boolean;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface ModalProductoProps {
  producto: Producto | null;
  onClose: () => void;
  onGuardar: () => void;
}

const ModalProducto = ({ producto, onClose, onGuardar }: ModalProductoProps) => {
  const [formData, setFormData] = useState<Producto>(
    producto || {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,           // ✅ Usar 'stock'
      stock_minimo: 5,
      sku: '',            // ✅ Agregar SKU
      id_categoria: 0,
      activo: true,
    }
  );

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await productoService.getCategorias();
      setCategorias(data);
      if (formData.id_categoria === 0 && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          id_categoria: data[0].id_categoria,
        }));
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      let processedValue: any = value;

      // ✅ Conversión segura de tipos
      if (name === 'precio') {
        processedValue = toPrice(value);
      } else if (name === 'stock' || name === 'stock_minimo' || name === 'id_categoria') {
        processedValue = toInteger(value);
      } else if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      }

      return {
        ...prev,
        [name]: processedValue,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validaciones mejoradas
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (formData.id_categoria === 0) {
      setError('Debes seleccionar una categoría');
      return;
    }
    if (formData.precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }
    if (formData.stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ Los datos ya están en el formato correcto gracias a handleChange
      if (producto?.id_producto) {
        await productoService.update(producto.id_producto, formData);
      } else {
        await productoService.create(formData);
      }
      onGuardar();
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {producto?.id_producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="ej: PROD-001 (opcional, se genera automáticamente)"
            />
            <p className="text-xs text-gray-500 mt-1">Si lo dejas vacío, se generará automáticamente</p>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nombre del producto"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="id_categoria"
              value={formData.id_categoria}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={0}>Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descripción del producto"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Stock - ✅ Usar 'stock' */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Stock Mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Mínimo
            </label>
            <input
              type="number"
              name="stock_minimo"
              value={formData.stock_minimo || 5}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="5"
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalProducto;
