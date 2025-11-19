import apiClient from '../api/axios.config';
import {
  transformProductoToBackend,
  transformProductoFromBackend,
  validateRequiredFields,
} from '../utils/dataTransformers';

interface Producto {
  id_producto: number;
  id_categoria: number;
  sku?: string;           // ✅ Agregado SKU
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;          // ✅ Cambiado a 'stock'
  stock_minimo?: number;
  activo: boolean;
  categoria_nombre?: string;
  fecha_creacion?: string;
}

interface CreateProductoDTO {
  id_categoria: number;
  sku?: string;           // ✅ Agregado SKU
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;          // ✅ Cambiado a 'stock'
  stock_minimo?: number;
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
      const productos = response.data.data || [];
      // ✅ Normalizar respuesta del backend
      return productos.map(transformProductoFromBackend);
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  getById: async (id: number): Promise<Producto> => {
    try {
      const response = await apiClient.get<ApiResponse<Producto>>(`/productos/${id}`);
      // ✅ Normalizar respuesta del backend
      return transformProductoFromBackend(response.data.data!);
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear producto
  create: async (data: Omit<Producto, 'id_producto'>): Promise<Producto> => {
    try {
      // ✅ Validar campos requeridos
      const validation = validateRequiredFields(data, ['nombre', 'precio', 'id_categoria']);
      if (!validation.valid) {
        throw new Error(`Campos requeridos faltantes: ${validation.missing.join(', ')}`);
      }

      // ✅ Transformar datos al formato del backend
      const backendData = transformProductoToBackend(data);

      const response = await apiClient.post<ApiResponse<Producto>>('/productos', backendData);
      return transformProductoFromBackend(response.data.data!);
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar producto
  update: async (id: number, data: Partial<Producto>): Promise<Producto> => {
    try {
      // ✅ Transformar datos al formato del backend
      const backendData = transformProductoToBackend(data);

      const response = await apiClient.put<ApiResponse<Producto>>(`/productos/${id}`, backendData);
      return transformProductoFromBackend(response.data.data!);
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
