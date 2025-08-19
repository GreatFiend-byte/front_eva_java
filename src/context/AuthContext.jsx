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
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      cleanupAuth();
      setIsLoading(false);
      return false;
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
      
      const verified = await verifyToken(newToken);
      return verified;
    } catch (error) {
      console.error('Login error:', error);
      cleanupAuth();
      throw error;
    }
  };

  const logout = () => {
    cleanupAuth();
    navigate('/login', { replace: true });
  };

  const cleanupAuth = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = () => {
    return !!token;
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
