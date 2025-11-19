import apiClient from '../api/axios.config';

interface DetallePedido {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_usuario?: number;
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
  productos: {
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
  stock: number;
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

  // Crear pedido - ⚠️ CAMPO CLAVE: "productos" NO "detalles"
  create: async (data: CreatePedidoDTO): Promise<Pedido> => {
    try {
      console.log('🚀 Enviando pedido al backend:', JSON.stringify(data, null, 2));
      
      const response = await apiClient.post<ApiResponse<Pedido>>('/pedidos', data);
      
      console.log('✅ Pedido creado exitosamente:', response.data.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error en create pedido:', error);
      console.error('Status:', error.response?.status);
      console.error('Errores:', error.response?.data);
      throw error;
    }
  },

  // Actualizar estado de pedido
  updateEstado: async (id: number, id_estado: number): Promise<Pedido> => {
    try {
      const response = await apiClient.put<ApiResponse<Pedido>>(
        `/pedidos/${id}/estado`,
        { id_estado }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Error en updateEstado:', error);
      throw error;
    }
  },

  // Cancelar pedido
  cancel: async (id: number): Promise<Pedido> => {
    try {
      const response = await apiClient.post<ApiResponse<Pedido>>(
        `/pedidos/${id}/cancelar`
      );
      return response.data.data!;
    } catch (error) {
      console.error('Error en cancel:', error);
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
      console.log('Productos obtenidos:', response.data.data);
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
