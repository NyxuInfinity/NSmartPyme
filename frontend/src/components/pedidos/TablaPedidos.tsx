interface Pedido {
  id_pedido: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: string;
  total: number;
  cliente_nombre?: string;
}

interface TablaPedidosProps {
  pedidos: Pedido[];
  onEliminar: (id: number) => void;
}

const TablaPedidos = ({ pedidos, onEliminar }: TablaPedidosProps) => {
  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'CLP',
    }).format(precio);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Número</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pedidos.map((pedido) => (
              <tr key={pedido.id_pedido} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {pedido.numero_pedido}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {pedido.cliente_nombre || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatFecha(pedido.fecha_pedido)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                  {formatPrecio(pedido.total)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getEstadoColor(
                      pedido.estado
                    )}`}
                  >
                    {pedido.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEliminar(pedido.id_pedido)}
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

export default TablaPedidos;
