import { useState, useEffect } from 'react';
import usuarioService from '../../services/usuarioService';
import ModalUsuario from '../../components/usuarios/ModalUsuario';
import TablaUsuarios from '../../components/usuarios/TablaUsuarios';

interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  rol_nombre?: string;
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  // Cargar usuarios
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevo = () => {
    setUsuarioSeleccionado(null);
    setShowModal(true);
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowModal(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        setIsLoading(true);
        await usuarioService.delete(id);
        await cargarUsuarios();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar usuario');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGuardar = async () => {
    await cargarUsuarios();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay usuarios</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primer usuario</p>
          <button
            onClick={handleNuevo}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Crear Usuario
          </button>
        </div>
      ) : (
        <TablaUsuarios
          usuarios={usuarios}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ModalUsuario
          usuario={usuarioSeleccionado}
          onClose={() => setShowModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Usuarios;
