import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Componentes de Rota
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute'; // Importamos o novo componente

// Componentes de Página
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Spaces from './pages/Spaces';
import Amenities from './pages/Amenities';
import Reservations from './pages/Reservations';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* O menu de navegação aparecerá em todas as páginas */}
        <Navigation />
        <Routes>
          {/* A rota de login agora é uma rota pública.
            Um usuário logado que tentar acessá-la será redirecionado para o dashboard.
          */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Rotas Protegidas.
            Apenas usuários autenticados podem acessá-las.
          */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/spaces" element={<ProtectedRoute><Spaces /></ProtectedRoute>} />
          <Route path="/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
          
          {/* Uma rota "catch-all" para páginas não encontradas */}
          <Route path="*" element={
            <div className="container mt-5 text-center">
              <h2>404 - Página Não Encontrada</h2>
              <p>O recurso que você está procurando não existe.</p>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
