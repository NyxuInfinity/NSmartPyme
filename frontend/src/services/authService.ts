import apiClient from '../api/axios.config';

// Importamos los tipos desde AuthContext ya que están allí
import type { User, LoginCredentials } from '../context/AuthContext';

interface LoginResponse {
  token: string;
  usuario: User;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  // Obtener perfil
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  // Verificar token
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch {
      return false;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

export default authService;
