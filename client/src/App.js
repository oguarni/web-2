import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Navigation from './components/Navigation';

// Páginas
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
        <Navigation />
        <Routes>
          {/* Rota Pública: Apenas usuários não logados podem ver */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Layout de Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/reservations" element={<Reservations />} />
            {/* Adicione outras rotas protegidas aqui dentro */}
          </Route>
          
          {/* Redirecionamento da rota raiz. Se o usuário acessar "/", ele será levado para o dashboard. */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Rota "catch-all" para páginas não encontradas */}
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
