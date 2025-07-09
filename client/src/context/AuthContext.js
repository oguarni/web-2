import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ CORREÇÃO APLICADA AQUI
  const checkToken = useCallback(async () => {
    try {
      // Tenta verificar o token
      const response = await authAPI.verifyToken();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Se der QUALQUER erro (de rede ou da API), simplesmente desloga.
      // Isso impede que a aplicação quebre.
      console.error("Falha na verificação do token:", error.message);
      logout();
    } finally {
      // Garante que o loading sempre termine.
      setLoading(false);
    }
  }, []); // A dependência vazia previne loops infinitos

  useEffect(() => {
    if (token) {
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkToken();
    } else {
      setLoading(false);
    }
  }, [token, checkToken]);

  const login = async (loginData) => {
    try {
      const response = await authAPI.login(loginData);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken); // Atualiza o token, o que vai disparar o useEffect
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      // Retorna um objeto de erro, NUNCA lança o erro
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login falhou. Verifique suas credenciais.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete authAPI.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Mostra os filhos apenas quando o loading inicial terminar */}
      {!loading && children}
    </AuthContext.Provider>
  );
};