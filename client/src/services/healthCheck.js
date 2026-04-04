import axios from 'axios';

// Bypass interceptors to avoid circular dependencies and redirects during 500s
const healthApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const healthCheckService = {
  ping: async () => {
    try {
      const response = await healthApi.get('/health', { timeout: 5000 });
      return response.data?.status === 'OK' && response.data?.database === 'connected';
    } catch (err) {
      return false;
    }
  }
};
