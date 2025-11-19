import apiClient from '../api/axios.config';

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
  fecha_creacion?: string;
}

interface CreateProductoDTO {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad_stock: number;
  sku: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const productoService = {
  // Obtener todos los productos
  getAll: async (): Promise<Producto[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Producto[]>>('/productos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  getById: async (id: number): Promise<Producto> => {
    try {
      const response = await apiClient.get<ApiResponse<Producto>>(`/productos/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear producto
  create: async (data: CreateProductoDTO): Promise<Producto> => {
    try {
      const response = await apiClient.post<ApiResponse<Producto>>('/productos', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar producto
  update: async (id: number, data: Partial<CreateProductoDTO>): Promise<Producto> => {
    try {
      const response = await apiClient.put<ApiResponse<Producto>>(`/productos/${id}`, data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar producto
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/productos/${id}`);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Obtener categorías (para el select)
  getCategorias: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/categorias');
      console.log('Categorías obtenidas:', response.data.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getCategorias:', error);
      return [];
    }
  },
};

export default productoService;
