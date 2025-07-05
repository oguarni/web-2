import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Spaces from './pages/Spaces';
import Amenities from './pages/Amenities';
import Reservations from './pages/Reservations';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navigation />
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/spaces" element={
              <ProtectedRoute>
                <Navigation />
                <Spaces />
              </ProtectedRoute>
            } />
            <Route path="/amenities" element={
              <ProtectedRoute>
                <Navigation />
                <Amenities />
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute>
                <Navigation />
                <Reservations />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;