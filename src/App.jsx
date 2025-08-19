import { Box, Flex } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DivisionsPage from './pages/DivisionsPage';
import ProgramasDeDivisionPage from './pages/ProgramasDeDivisionPage';
import ProfesoresProgramaPage from './pages/ProfesoresProgramaPage';
import ProfesoresPage from './pages/ProfesoresPage';
import LoginPage from './pages/LoginPage';
import AuthRoute from './components/AuthRoute';
import CategoriasPage from './pages/CategoriasPage';
import ProfesoresCategoriaPage from './pages/ProfesoresCategoriaPage';
import TiposRequisitosCategoriaPage from './pages/TiposRequisitosCategoriaPage';
import RequisitosTipoRequisitosPage from './pages/RequisitosTipoRequisitosPage';
import { useEffect } from 'react';

// Componente para manejar redirecciones post-logout
const LogoutHandler = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Si no está autenticado pero está en una ruta protegida, forzar recarga
    if (!isAuthenticated() && location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }, [location, isAuthenticated]);
  
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  // Interceptar cambios de ruta para verificar autenticación
  useEffect(() => {
    const handleRouteChange = () => {
      if (!isAuthenticated() && location.pathname !== '/login') {
        window.location.replace('/login');
      }
    };
    
    // Ejecutar inmediatamente y al cambiar la ruta
    handleRouteChange();
  }, [location, isAuthenticated]);
  
  return (
    <>
      <LogoutHandler />
      
      {isAuthenticated() && <Navbar onLogout={logout} />}
      <Flex>
        <Box flex="1" ml={isAuthenticated() ? "20px" : "0"} p={8}>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated() ? 
                <Navigate to="/divisiones" replace /> : 
                <LoginPage />
              } 
            />
            
            {/* Rutas protegidas */}
            <Route
              path="/divisiones"
              element={
                <AuthRoute>
                  <DivisionsPage />
                </AuthRoute>
              }
            />
            <Route
              path="/profesores"
              element={
                <AuthRoute>
                  <ProfesoresPage />
                </AuthRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <AuthRoute>
                  <CategoriasPage />
                </AuthRoute>
              }
            />
            <Route
              path="/categorias/:id/profesores"
              element={
                <AuthRoute>
                  <ProfesoresCategoriaPage />
                </AuthRoute>
              }
            />
            <Route
              path="/categorias/:id/requisitos"
              element={
                <AuthRoute>
                  <TiposRequisitosCategoriaPage />
                </AuthRoute>
              }
            />
            <Route
              path="/categorias/:id/requisitos/:tipoRequisitoId"
              element={
                <AuthRoute>
                  <RequisitosTipoRequisitosPage />
                </AuthRoute>
              }
            />
            <Route
              path="/programas/:id"
              element={
                <AuthRoute>
                  <ProgramasDeDivisionPage />
                </AuthRoute>
              }
            />
            <Route
              path="/programas/:id/profesores"
              element={
                <AuthRoute>
                  <ProfesoresProgramaPage />
                </AuthRoute>
              }
            />
            
            {/* Ruta por defecto - redirige según autenticación */}
            <Route 
              path="*" 
              element={
                isAuthenticated() ? 
                <Navigate to="/divisiones" replace /> : 
                <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </Box>
      </Flex>
    </>
  );
};
