import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

const AuthRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Center height="100vh">
        <Box textAlign="center">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" mb={4} />
          <Text>Verificando autenticación...</Text>
        </Box>
      </Center>
    );
  }

  if (!isAuthenticated()) {
    // Redirigir al login reemplazando el historial
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <Center height="50vh">
        <Text fontSize="xl" color="red.500">
          Acceso denegado. Se requieren permisos de administrador.
        </Text>
      </Center>
    );
  }

  return children;
};

export default AuthRoute;
