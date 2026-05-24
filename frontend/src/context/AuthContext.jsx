import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://127.0.0.1:5000/api/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Profile fetch failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { username, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
