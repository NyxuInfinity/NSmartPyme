import { useState, useEffect } from 'react';
import pedidoService from '../../services/pedidoService';
import ModalPedido from '../../components/pedidos/ModalPedido';
import TablaPedidos from '../../components/pedidos/TablaPedidos';

interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_usuario: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: string;
  total: number;
  cliente_nombre?: string;
}

const Pedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Cargar pedidos
  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await pedidoService.getAll();
      setPedidos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevo = () => {
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        setIsLoading(true);
        await pedidoService.delete(id);
        await cargarPedidos();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar pedido');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuardar = async () => {
    await cargarPedidos();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-2">Gestiona los pedidos de clientes</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de pedidos */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay pedidos</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primer pedido</p>
          <button
            onClick={handleNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Pedido
          </button>
        </div>
      ) : (
        <TablaPedidos
          pedidos={pedidos}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ModalPedido
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Pedidos;
