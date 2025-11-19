interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  rol_nombre?: string;
}

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onEditar: (usuario: Usuario) => void;
  onEliminar: (id: number) => void;
}

const TablaUsuarios = ({ usuarios, onEditar, onEliminar }: TablaUsuariosProps) => {
  const getRolColor = (rol?: string) => {
    switch (rol?.toLowerCase()) {
      case 'administrador':
        return 'bg-red-100 text-red-800';
      case 'vendedor':
        return 'bg-blue-100 text-blue-800';
      case 'almacenero':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map((usuario) => (
              <tr key={usuario.id_usuario} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="text-xs text-gray-500">ID: {usuario.id_usuario}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <a href={`mailto:${usuario.email}`} className="text-primary-600 hover:underline">
                    {usuario.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getRolColor(usuario.rol_nombre)}`}>
                    {usuario.rol_nombre || 'Sin rol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      usuario.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEditar(usuario)}
                      className="p-1 hover:bg-blue-50 text-blue-600 rounded transition"
                      title="Editar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEliminar(usuario.id_usuario)}
                      className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                      title="Eliminar"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaUsuarios;
