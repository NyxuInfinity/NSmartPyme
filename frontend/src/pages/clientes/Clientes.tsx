import { useState, useEffect } from 'react';
import clienteService from '../../services/clienteService';
import ModalCliente from '../../components/clientes/ModalCliente';
import TablaClientes from '../../components/clientes/TablaClientes';

interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
  activo: boolean;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Cargar clientes
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevo = () => {
    setClienteSeleccionado(null);
    setShowModal(true);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        setIsLoading(true);
        await clienteService.delete(id);
        await cargarClientes();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar cliente');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuardar = async () => {
    await cargarClientes();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-2">Gestiona el directorio de clientes</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de clientes */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay clientes</h3>
          <p className="text-gray-600 mb-4">Comienza agregando tu primer cliente</p>
          <button
            onClick={handleNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Cliente
          </button>
        </div>
      ) : (
        <TablaClientes
          clientes={clientes}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ModalCliente
          cliente={clienteSeleccionado}
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Clientes;
