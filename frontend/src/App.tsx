import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/productos/Productos';
import Categorias from './pages/categorias/Categorias';
import Clientes from './pages/clientes/Clientes';
import Usuarios from './pages/usuarios/Usuarios';
import Pedidos from './pages/pedidos/Pedidos';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Ruta pública de login (sin Layout) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con Layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Páginas temporales para las otras rutas */}
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <Layout>
                  <Productos />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categorias"
            element={
              <PrivateRoute>
                <Layout>
                  <Categorias />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Layout>
                  <Clientes />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/pedidos"
            element={
              <PrivateRoute>
                <Layout>
                  <Pedidos />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Layout>
                  <Usuarios />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Ruta 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-gray-600 mt-2">Página no encontrada</p>
                  <a
                    href="/dashboard"
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Volver al Dashboard →
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
