import apiClient from '../api/axios.config';

interface DetallePedido {
  id_detalle_pedido: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
}

interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_usuario: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: string;
  total: number;
  cliente_nombre?: string;
  usuario_nombre?: string;
  detalles?: DetallePedido[];
  fecha_creacion?: string;
}

interface CreatePedidoDTO {
  id_cliente: number;
  detalles: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad_stock: number;
}

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
}

const pedidoService = {
  // Obtener todos los pedidos
  getAll: async (): Promise<Pedido[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Pedido[]>>('/pedidos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener pedido por ID
  getById: async (id: number): Promise<Pedido> => {
    try {
      const response = await apiClient.get<ApiResponse<Pedido>>(`/pedidos/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear pedido
  create: async (data: CreatePedidoDTO): Promise<Pedido> => {
    try {
      const response = await apiClient.post<ApiResponse<Pedido>>('/pedidos', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar estado de pedido
  updateEstado: async (id: number, estado: string): Promise<Pedido> => {
    try {
      const response = await apiClient.put<ApiResponse<Pedido>>(`/pedidos/${id}`, { estado });
      return response.data.data!;
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  },

  // Eliminar pedido
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/pedidos/${id}`);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Obtener productos
  getProductos: async (): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Producto[]>>('/productos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getProductos:', error);
      return [];
    }
  },

  // Obtener clientes
  getClientes: async (): Promise<Cliente[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Cliente[]>>('/clientes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getClientes:', error);
      return [];
    }
  },
};

export default pedidoService;
