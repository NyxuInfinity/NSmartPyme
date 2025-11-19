import apiClient from '../api/axios.config';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
}

interface CreateCategoriaDTO {
  nombre: string;
  descripcion?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const categoriaService = {
  // Obtener todas las categorías
  getAll: async (): Promise<Categoria[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Categoria[]>>('/categorias');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  getById: async (id: number): Promise<Categoria> => {
    try {
      const response = await apiClient.get<ApiResponse<Categoria>>(`/categorias/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear categoría
  create: async (data: CreateCategoriaDTO): Promise<Categoria> => {
    try {
      const response = await apiClient.post<ApiResponse<Categoria>>('/categorias', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar categoría
  update: async (id: number, data: Partial<CreateCategoriaDTO>): Promise<Categoria> => {
    try {
      const response = await apiClient.put<ApiResponse<Categoria>>(`/categorias/${id}`, data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar categoría
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/categorias/${id}`);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },
};

export default categoriaService;
