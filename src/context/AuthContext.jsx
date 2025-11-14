import { createContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay usuario al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();

    if (storedUser && isAuth) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success(response.message || 'Registro exitoso! Verifica tu email.');
      return response;
    } catch (error) {
      toast.error(error.message || 'Error en el registro');
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('¡Bienvenido!');
      return response;
    } catch (error) {
      if (error.needsVerification) {
        toast.error('Por favor verifica tu email antes de iniciar sesión');
      } else {
        toast.error(error.message || 'Error en el login');
      }
      throw error;
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await authService.googleAuth(credential);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success('¡Bienvenido!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Error al autenticar con Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    googleLogin,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
