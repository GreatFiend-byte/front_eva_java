import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jwtToken');
      const logoutTimestamp = sessionStorage.getItem('logoutTimestamp');
      
      // Verificar si hubo un logout reciente (menos de 5 minutos)
      if (logoutTimestamp) {
        const timeDiff = Date.now() - parseInt(logoutTimestamp);
        if (timeDiff < 5 * 60 * 1000) {
          // Limpiar todo y redirigir al login
          cleanupAuth();
          setIsLoading(false);
          return;
        } else {
          // Limpiar timestamp de logout expirado
          sessionStorage.removeItem('logoutTimestamp');
        }
      }
      
      if (storedToken) {
        await verifyToken(storedToken);
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.get(`${config.API.VALIDATE}`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });
      
      setUser(response.data);
      setToken(tokenToVerify);
      // Establecer flag de sesión activa
      sessionStorage.setItem('sessionActive', 'true');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      cleanupAuth();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${config.API.LOGIN}`, {
        email: credentials.email,
        password: credentials.password
      });
      
      const { token: newToken } = response.data;
      localStorage.setItem('jwtToken', newToken);
      sessionStorage.setItem('sessionActive', 'true');
      // Limpiar timestamp de logout si existe
      sessionStorage.removeItem('logoutTimestamp');
      
      await verifyToken(newToken);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      cleanupAuth();
      throw error;
    }
  };

  const logout = () => {
    // Guardar timestamp del logout
    sessionStorage.setItem('logoutTimestamp', Date.now().toString());
    cleanupAuth();
    navigate('/login', { replace: true });
    
    // Forzar recarga para limpiar estado de componentes
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const cleanupAuth = () => {
    localStorage.removeItem('jwtToken');
    sessionStorage.removeItem('sessionActive');
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = () => {
    // Verificar múltiples condiciones para mayor seguridad
    const hasValidToken = !!token;
    const hasSessionActive = sessionStorage.getItem('sessionActive') === 'true';
    const hasLocalToken = !!localStorage.getItem('jwtToken');
    const hasRecentLogout = sessionStorage.getItem('logoutTimestamp');
    
    // Si hay logout reciente, no está autenticado
    if (hasRecentLogout) {
      const timeDiff = Date.now() - parseInt(hasRecentLogout);
      if (timeDiff < 5 * 60 * 1000) {
        return false;
      }
    }
    
    return hasValidToken && hasSessionActive && hasLocalToken;
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading,
      login, 
      logout, 
      isAuthenticated, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
