import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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
          {/* Public Route: For login page */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Protected Routes Layout for all authenticated users */}
          <Route path="/" element={<ProtectedRoute />}>
            {/* Default redirect for authenticated users */}
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="spaces" element={<Spaces />} />
            
            {/* Nested routes accessible only to Admins */}
            <Route element={<AdminRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="amenities" element={<Amenities />} />
            </Route>
          </Route>
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={
            <div className="container mt-5 text-center">
              <h2>404 - Page Not Found</h2>
              <p>The resource you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;