import axiosInstance from './axiosConfig';

const authService = {
  // Registro
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro' };
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data;

      // Guardar tokens y usuario en localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el login' };
    }
  },

  // Login con Google
  googleAuth: async (credential) => {
    try {
      const response = await axiosInstance.post('/auth/google', { credential });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en autenticación con Google' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Verificar email
  verifyEmail: async (token) => {
    try {
      const response = await axiosInstance.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar email' };
    }
  },

  // Reenviar email de verificación
  resendVerification: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al reenviar email' };
    }
  },

  // Obtener perfil
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // Solicitar reseteo de contraseña
  requestPasswordReset: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/request-password-reset', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al solicitar reseteo' };
    }
  },

  // Resetear contraseña
  resetPassword: async (token, passwords) => {
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, passwords);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al resetear contraseña' };
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;