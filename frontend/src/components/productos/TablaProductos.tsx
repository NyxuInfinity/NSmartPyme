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

interface TablaProductosProps {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onEliminar: (id: number) => void;
}

const TablaProductos = ({ productos, onEditar, onEliminar }: TablaProductosProps) => {
  // Función para formatear precio
  const formatPrecio = (precio: any): string => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Precio</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {productos.map((producto) => (
            <tr key={producto.id_producto} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{producto.sku}</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">{producto.descripcion || '-'}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria_nombre || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                ${formatPrecio(producto.precio)}
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    producto.cantidad_stock > 10
                      ? 'bg-green-100 text-green-800'
                      : producto.cantidad_stock > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {producto.cantidad_stock}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    producto.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onEditar(producto)}
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
                    onClick={() => onEliminar(producto.id_producto)}
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
  );
};

export default TablaProductos;
