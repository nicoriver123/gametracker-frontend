import axiosInstance from './axiosConfig';

const forumService = {
  // ============================================
  // POSTS
  // ============================================
  
  // Obtener todos los posts
  getAllPosts: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/forum/posts', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener posts' };
    }
  },

  // Obtener un post por ID
  getPostById: async (id) => {
    try {
      const response = await axiosInstance.get(`/forum/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener post' };
    }
  },

  // Crear post
  createPost: async (data) => {
    try {
      const response = await axiosInstance.post('/forum/posts', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear post' };
    }
  },

  // Actualizar post
  updatePost: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/forum/posts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar post' };
    }
  },

  // Eliminar post
  deletePost: async (id) => {
    try {
      const response = await axiosInstance.delete(`/forum/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar post' };
    }
  },

  // Toggle like en post
  toggleLikePost: async (id) => {
    try {
      const response = await axiosInstance.post(`/forum/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al dar like' };
    }
  },

  // ============================================
  // COMENTARIOS
  // ============================================

  // Obtener comentarios de un post
  getCommentsByPost: async (postId) => {
    try {
      const response = await axiosInstance.get(`/forum/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener comentarios' };
    }
  },

  // Crear comentario
  createComment: async (data) => {
    try {
      const response = await axiosInstance.post('/forum/comments', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear comentario' };
    }
  },

  // Actualizar comentario
  updateComment: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/forum/comments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar comentario' };
    }
  },

  // Eliminar comentario
  deleteComment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/forum/comments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar comentario' };
    }
  },

  // Toggle like en comentario
  toggleLikeComment: async (id) => {
    try {
      const response = await axiosInstance.post(`/forum/comments/${id}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al dar like' };
    }
  },
};

export default forumService;