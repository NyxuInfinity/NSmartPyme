import { createContext, useState, useEffect, ReactNode } from 'react';

// ============================================
// TIPOS DEFINIDOS DIRECTAMENTE AQUÍ
// ============================================

interface User {
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

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// CONTEXT
// ============================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const authService = await import('../services/authService');
      const response = await authService.default.login(credentials);
      const { token: newToken, usuario } = response;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));

      setToken(newToken);
      setUser(usuario);
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(
        error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// EXPORTAR TIPOS PARA USO EN OTROS ARCHIVOS
// ============================================

export type { User, LoginCredentials, AuthContextType };
