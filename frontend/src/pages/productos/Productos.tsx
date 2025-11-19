import { useState, useEffect } from 'react';
import productoService from '../../services/productoService';
import ModalProducto from '../../components/productos/ModalProducto';
import TablaProductos from '../../components/productos/TablaProductos';

interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad_stock: number;
  sku: string;
  activo: boolean;
  categoria_nombre?: string;
}

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  // Cargar productos
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await productoService.getAll();
      setProductos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevo = () => {
    setProductoSeleccionado(null);
    setShowModal(true);
  };

  const handleEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setIsLoading(true);
        await productoService.delete(id);
        await cargarProductos();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar producto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuardar = async () => {
    await cargarProductos();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-2">Gestiona el catálogo de productos</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de productos */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay productos</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primer producto</p>
          <button
            onClick={handleNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Producto
          </button>
        </div>
      ) : (
        <TablaProductos
          productos={productos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ModalProducto
          producto={productoSeleccionado}
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Productos;
