import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// O seu api.js exporta vários objetos, vamos importar apenas o que precisamos.
import { authAPI } from '../services/api';

// 1. CRIAÇÃO DO CONTEXTO
const AuthContext = createContext();

// 2. HOOK PARA FACILITAR O USO
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// 3. O PROVEDOR COM TODA A LÓGICA
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ CORREÇÃO: A função de logout agora é envolvida em useCallback.
  // Isso garante que ela não seja recriada a cada renderização, evitando loops.
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ✅ CORREÇÃO: Adicionada a dependência 'logout' ao useCallback.
  // Isso garante que 'checkAuthStatus' sempre use a versão mais recente da função 'logout'.
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.verifyToken();
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Sessão inválida ou expirada. Fazendo logout.");
        logout(); // Agora usa a função 'logout' estável
      }
    }
    setLoading(false);
  }, [logout]); // Dependência adicionada

  // Executa a verificação de status quando o componente é montado
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Função de Login
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login falhou. Verifique suas credenciais.'
      };
    }
  };

  // Funções de verificação de permissão
  const isAdmin = () => user?.tipo === 1;
  const isAdminOrGestor = () => user?.tipo === 1 || user?.tipo === 3;

  // Valor a ser partilhado com toda a aplicação
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin,
    isAdminOrGestor,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};