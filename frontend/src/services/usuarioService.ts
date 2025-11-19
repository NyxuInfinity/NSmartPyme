import apiClient from '../api/axios.config';

interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  rol_nombre?: string;
  fecha_creacion?: string;
  ultimo_acceso?: string;
}

interface CreateUsuarioDTO {
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
}

interface UpdateUsuarioDTO {
  id_rol?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  activo?: boolean;
}

interface Rol {
  id_rol: number;
  nombre: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

const usuarioService = {
  // Obtener todos los usuarios
  getAll: async (): Promise<Usuario[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Usuario[]>>('/usuarios');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getById: async (id: number): Promise<Usuario> => {
    try {
      const response = await apiClient.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear usuario
  create: async (data: CreateUsuarioDTO): Promise<Usuario> => {
    try {
      const response = await apiClient.post<ApiResponse<Usuario>>('/usuarios', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar usuario
  update: async (id: number, data: UpdateUsuarioDTO): Promise<Usuario> => {
    try {
      const response = await apiClient.put<ApiResponse<Usuario>>(`/usuarios/${id}`, data);
      return response.data.data!;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar usuario
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/usuarios/${id}`);
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Obtener roles
  getRoles: async (): Promise<Rol[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Rol[]>>('/roles');
      return response.data.data || [];
    } catch (error) {
      console.error('Error en getRoles:', error);
      return [];
    }
  },

  // Cambiar contraseña
  changePassword: async (id: number, oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post(`/usuarios/${id}/change-password`, {
        oldPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Error en changePassword:', error);
      throw error;
    }
  },
};

export default usuarioService;
