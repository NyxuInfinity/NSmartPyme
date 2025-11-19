import { useState, useEffect } from 'react';
import categoriaService from '../../services/categoriaService';
import ModalCategoria from '../../components/categorias/ModalCategoria';
import TablaCategorias from '../../components/categorias/TablaCategorias';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  // Cargar categorías
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevo = () => {
    setCategoriaSeleccionada(null);
    setShowModal(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        setIsLoading(true);
        await categoriaService.delete(id);
        await cargarCategorias();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar categoría');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuardar = async () => {
    await cargarCategorias();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-2">Gestiona las categorías de productos</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de categorías */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      ) : categorias.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay categorías</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primera categoría</p>
          <button
            onClick={handleNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Categoría
          </button>
        </div>
      ) : (
        <TablaCategorias
          categorias={categorias}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ModalCategoria
          categoria={categoriaSeleccionada}
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Categorias;
