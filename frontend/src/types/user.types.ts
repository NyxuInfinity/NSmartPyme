export interface User {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  rol_nombre: string;
  fecha_creacion?: string;
  ultimo_acceso?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
