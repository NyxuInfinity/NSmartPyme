import { useState, useEffect } from 'react';
import usuarioService from '../../services/usuarioService';

interface Usuario {
  id_usuario?: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo?: boolean;
}

interface Rol {
  id_rol: number;
  nombre: string;
}

interface ModalUsuarioProps {
  usuario: Usuario | null;
  onClose: () => void;
  onGuardar: () => void;
}

const ModalUsuario = ({ usuario, onClose, onGuardar }: ModalUsuarioProps) => {
  const [formData, setFormData] = useState<Usuario & { password?: string }>(
    usuario || {
      id_rol: 0,
      nombre: '',
      apellido: '',
      email: '',
      activo: true,
      password: '',
    }
  );

  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      const data = await usuarioService.getRoles();
      setRoles(data);
      // Si no hay rol seleccionado, selecciona el primero
      if (formData.id_rol === 0 && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          id_rol: data[0].id_rol,
        }));
      }
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.apellido.trim()) {
      setError('El apellido es requerido');
      return;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El email no es válido');
      return;
    }
    if (formData.id_rol === 0) {
      setError('Debes seleccionar un rol');
      return;
    }

    // Si es nuevo usuario, la contraseña es requerida
    if (!usuario?.id_usuario && !formData.password?.trim()) {
      setError('La contraseña es requerida para usuarios nuevos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const dataToSend: any = {
        id_rol: formData.id_rol,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
      };

      // Si es nuevo usuario, incluir contraseña
      if (!usuario?.id_usuario) {
        dataToSend.password = formData.password;
      }

      if (usuario?.id_usuario) {
        // Actualizar
        await usuarioService.update(usuario.id_usuario, dataToSend);
      } else {
        // Crear
        await usuarioService.create(dataToSend);
      }
      onGuardar();
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Error al guardar usuario');
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
            {usuario?.id_usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              placeholder="Nombre"
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Apellido"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="usuario@email.com"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={0}>Selecciona un rol</option>
              {roles.map(rol => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Contraseña (solo para nuevos usuarios) */}
          {!usuario?.id_usuario && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                required={!usuario?.id_usuario}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-xs text-gray-500 mt-1">Será enviada al usuario por email</p>
            </div>
          )}

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

export default ModalUsuario;
