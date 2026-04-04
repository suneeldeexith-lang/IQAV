import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';
import { healthCheckService } from '../services/healthCheck';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTED');
  const isOffline = connectionStatus !== 'CONNECTED';

  // Listen to forced disconnects from API interceptors
  useEffect(() => {
     const handleForcedDisconnect = () => setConnectionStatus('DISCONNECTED');
     window.addEventListener('backend-disconnected', handleForcedDisconnect);
     return () => window.removeEventListener('backend-disconnected', handleForcedDisconnect);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const isHealthy = await healthCheckService.ping();
          if (!isHealthy && user) {
            console.warn("Backend offline. Retaining cached session.");
            setConnectionStatus('DISCONNECTED');
            setLoading(false);
            return;
          }

          const validUser = await authService.verifyToken();
          setUser(validUser);
          localStorage.setItem('user', JSON.stringify(validUser));
          setConnectionStatus('CONNECTED');
        } catch (error) {
           // Gracefully handle specific HTTP drops. 500s or native network errors shouldn't blow away JWT.
           if (error.response?.status === 401) {
             console.error("Token invalid/expired. Flushing credentials.");
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             setUser(null);
           } else {
             console.warn("Backend unreachable during init. Remaining offline.");
             setConnectionStatus('DISCONNECTED');
           }
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Poll exactly every 10 seconds checking for resurrection
  useEffect(() => {
    let reconnectPoller;
    if (connectionStatus === 'DISCONNECTED' || connectionStatus === 'RECONNECTING') {
       reconnectPoller = setInterval(async () => {
          setConnectionStatus('RECONNECTING'); // Trigger RECONNECTING logic briefly
          const isHealthy = await healthCheckService.ping();
          if (isHealthy) {
             console.log("Backend connection restored! Removing warning banners.");
             setConnectionStatus('CONNECTED');
             // Show Toast natively
             alert("Connection Restored: The backend is back online!");
             // Note: Silent data reload natively happens if components refetch on focus or specific deps, 
             // but we'll let existing UI bounds gracefully catch it.
          } else {
             setConnectionStatus('DISCONNECTED');
          }
       }, 10000);
    }
    return () => clearInterval(reconnectPoller);
  }, [connectionStatus]);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await authService.login(email, password);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isOffline, connectionStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
