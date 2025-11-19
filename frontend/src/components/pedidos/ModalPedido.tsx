import { useState, useEffect } from 'react';
import pedidoService from '../../services/pedidoService';
import { toPrice, toInteger } from '../../utils/dataTransformers';

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number | string;
  stock: number | string;
  cantidad_stock?: number | string;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface DetallePedido {
  id_producto: number;
  cantidad: number;
  precio_unitario: number | string;
}

interface ModalPedidoProps {
  onClose: () => void;
  onGuardar: () => void;
}

const ModalPedido = ({ onClose, onGuardar }: ModalPedidoProps) => {
  const [idCliente, setIdCliente] = useState<number>(0);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        pedidoService.getClientes(),
        pedidoService.getProductos(),
      ]);
      console.log('📦 Productos cargados:', productosData);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('Error al cargar datos');
    }
  };

  // Función para obtener el stock (busca en stock o cantidad_stock)
  const getStock = (producto: any): number => {
    const stock = producto.stock !== undefined ? producto.stock : producto.cantidad_stock;
    const numStock = typeof stock === 'string' ? parseInt(stock) : stock;
    return isNaN(numStock) ? 0 : numStock;
  };

  // Función para convertir precio a número
  const getPrecioNumero = (precio: any): number => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return isNaN(num) ? 0 : num;
  };

  const agregarDetalle = () => {
    if (productoSeleccionado === 0) {
      setError('Selecciona un producto');
      return;
    }

    // ✅ Validación segura de cantidad
    const cantidadValida = toInteger(cantidad, 1);
    if (cantidadValida <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const producto = productos.find(p => p.id_producto === productoSeleccionado);
    if (!producto) return;

    if (cantidadValida > producto.cantidad_stock) {
      setError(`Stock insuficiente. Disponible: ${producto.cantidad_stock}`);
      return;
    }

    const indiceExistente = detalles.findIndex(d => d.id_producto === productoSeleccionado);
    if (indiceExistente >= 0) {
      const nuevosDetalles = [...detalles];
      nuevosDetalles[indiceExistente].cantidad += cantidadValida;
      setDetalles(nuevosDetalles);
    } else {
      setDetalles([
        ...detalles,
        {
          id_producto: productoSeleccionado,
          cantidad: cantidadValida,
          precio_unitario: toPrice(producto.precio), // ✅ Conversión segura
        },
      ]);
    }

    setProductoSeleccionado(0);
    setCantidad(1);
    setError('');
  };

  const eliminarDetalle = (id: number) => {
    setDetalles(detalles.filter((d, i) => i !== id));
  };

  const calcularTotal = () => {
    return detalles.reduce((total, detalle) => {
      const precio = getPrecioNumero(detalle.precio_unitario);
      return total + detalle.cantidad * precio;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validaciones mejoradas
    if (idCliente === 0) {
      setError('Selecciona un cliente');
      return;
    }
    if (detalles.length === 0) {
      setError('Agrega al menos un producto al pedido');
      return;
    }

    // ✅ Validar que todos los detalles tengan datos válidos
    for (const detalle of detalles) {
      if (detalle.cantidad <= 0) {
        setError('Todas las cantidades deben ser mayores a 0');
        return;
      }
      if (detalle.precio_unitario <= 0) {
        setError('Todos los precios deben ser mayores a 0');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ El service se encarga de la transformación
      await pedidoService.create({
        id_cliente: idCliente,
        detalles,
      });
      onGuardar();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al crear pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const productoActual = productos.find(p => p.id_producto === productoSeleccionado);
  const total = calcularTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Pedido</h2>
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

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={idCliente}
              onChange={(e) => setIdCliente(parseInt(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={0}>Selecciona un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} {cliente.apellido} ({cliente.email})
                </option>
              ))}
            </select>
          </div>

          {/* Sección de productos */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Agregar Productos</h3>

            <div className="space-y-3">
              {/* Selector de producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto
                </label>
                <select
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={0}>Selecciona un producto</option>
                  {productos.map(producto => {
                    const stock = getStock(producto);
                    const precio = getPrecioNumero(producto.precio);
                    return (
                      <option key={producto.id_producto} value={producto.id_producto}>
                        {producto.nombre} - ${precio.toFixed(2)} (Stock: {stock})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={productoActual ? getStock(productoActual) : 100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Botón agregar */}
              <button
                type="button"
                onClick={agregarDetalle}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition"
              >
                Agregar a Pedido
              </button>
            </div>
          </div>

          {/* Tabla de detalles */}
          {detalles.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Producto</th>
                    <th className="px-4 py-2 text-center font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right font-semibold">Precio Unit.</th>
                    <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                    <th className="px-4 py-2 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {detalles.map((detalle, index) => {
                    const producto = productos.find(p => p.id_producto === detalle.id_producto);
                    const precioNumero = getPrecioNumero(detalle.precio_unitario);
                    const subtotal = detalle.cantidad * precioNumero;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{producto?.nombre}</td>
                        <td className="px-4 py-2 text-center">{detalle.cantidad}</td>
                        <td className="px-4 py-2 text-right">${precioNumero.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">${subtotal.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarDetalle(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-bold">
                      TOTAL:
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-lg text-primary-600">
                      ${total.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
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
              disabled={isLoading || detalles.length === 0}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPedido;
