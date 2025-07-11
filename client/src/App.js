import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Add this new component
import PublicRoute from './components/PublicRoute';
import Navigation from './components/Navigation';

// Pages
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
          {/* Public Route: Only non-logged users can see */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Protected Routes Layout - Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            
            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<Users />} />
              <Route path="/spaces" element={<Spaces />} />
              <Route path="/amenities" element={<Amenities />} />
            </Route>
          </Route>
          
          {/* Root redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* 404 catch-all route */}
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
