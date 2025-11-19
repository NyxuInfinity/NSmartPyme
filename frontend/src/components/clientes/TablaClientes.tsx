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

interface TablaClientesProps {
  clientes: Cliente[];
  onEditar: (cliente: Cliente) => void;
  onEliminar: (id: number) => void;
}

const TablaClientes = ({ clientes, onEditar, onEliminar }: TablaClientesProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ciudad</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes.map((cliente) => (
              <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cliente.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <a href={`mailto:${cliente.email}`} className="text-primary-600 hover:underline">
                    {cliente.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cliente.telefono || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {cliente.ciudad || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                      cliente.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEditar(cliente)}
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
                      onClick={() => onEliminar(cliente.id_cliente)}
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

export default TablaClientes;
