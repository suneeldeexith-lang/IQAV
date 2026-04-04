import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Bind properly to env
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle strict 401 JWT Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Exact JWT mismatch or Expiry. DO NOT logout on 500 Network drops.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (!error.response || error.response.status >= 500) {
      // Dispatch global disconnect event allowing AuthContext to flag 'DISCONNECTED' seamlessly
      window.dispatchEvent(new Event('backend-disconnected'));
    }
    return Promise.reject(error);
  }
);

export default api;
