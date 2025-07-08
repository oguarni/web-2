import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para rotas públicas.
 * Se o usuário já estiver logado, ele é redirecionado para a página principal.
 * Caso contrário, ele pode ver a página pública (como a de login).
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mostra uma mensagem de carregamento enquanto o status de autenticação é verificado.
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se o usuário já está autenticado, redireciona para o dashboard.
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Se não estiver autenticado, renderiza o componente filho (a página de login).
  return children;
};

export default PublicRoute;
