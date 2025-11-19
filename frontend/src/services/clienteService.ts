import apiClient from '../api/axios.config';

interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
  activo: boolean;
  fecha_creacion?: string;
}

interface CreateClienteDTO {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  documento?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const clienteService = {
  // Obtener todos los clientes
  getAll: async (): Promise<Cliente[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Cliente[]>>('/clientes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener cliente por ID
  getById: async (id: number): Promise<Cliente> => {
    try {
      const response = await apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear cliente
  create: async (data: CreateClienteDTO): Promise<Cliente> => {
    try {
      const response = await apiClient.post<ApiResponse<Cliente>>('/clientes', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar cliente
  update: async (id: number, data: Partial<CreateClienteDTO>): Promise<Cliente> => {
    try {
      const response = await apiClient.put<ApiResponse<Cliente>>(`/clientes/${id}`, data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar cliente
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/clientes/${id}`);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },
};

export default clienteService;
