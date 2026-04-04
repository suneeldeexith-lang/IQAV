import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      if (err.response) throw err; // 401 or backend error
      
      console.warn("Backend API not reachable. Using fallback mock login.");
      let mockUser = null;
      if (email === 'admin@school.edu') mockUser = { id: 'admin1', name: 'Institutional Admin', email, role: 'ADMIN' };
      else if (email === 'faculty@school.edu') mockUser = { id: 'fac1', name: 'Dr. Jane Smith', email, role: 'FACULTY' };
      
      if (mockUser) return { token: 'mock_jwt_token_123', user: mockUser };
      throw { networkError: true, message: 'Unable to connect to server' };
    }
  },
  
  verifyToken: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 401) throw err;
      throw { networkError: true, message: 'Unable to connect to server' };
    }
  },

  checkHealth: async () => {
    try {
      await api.get('/health', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
};
