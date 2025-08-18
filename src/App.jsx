import { Box, Flex } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import DivisionsPage from './pages/DivisionsPage';
import ProgramasDeDivisionPage from './pages/ProgramasDeDivisionPage';
import ProfesoresProgramaPage from './pages/ProfesoresProgramaPage';
import ProfesoresPage from './pages/ProfesoresPage'; // Nueva importación
import LoginPage from './pages/LoginPage';
import AuthRoute from './components/AuthRoute';
import CategoriasPage from './pages/CategoriasPage';
import ProfesoresCategoriaPage from './pages/ProfesoresCategoriaPage';
import TiposRequisitosCategoriaPage from './pages/TiposRequisitosCategoriaPage';
import RequisitosTipoRequisitosPage from './pages/RequisitosTipoRequisitosPage';

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
  
  return (
    <>
      {isAuthenticated() && <Navbar onLogout={logout} />}
      <Flex>
        <Box flex="1" ml={isAuthenticated() ? "20px" : "0"} p={8}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
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
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </Box>
      </Flex>
    </>
  );
};