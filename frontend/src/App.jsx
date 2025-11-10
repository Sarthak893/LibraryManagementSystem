// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import LibrarianDashboard from './components/LibrarianDashboard';
import StudentDashboard from './components/StudentDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

const AppContent = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/librarian"
      element={
        <ProtectedRoute allowedRoles={['librarian']}>
          <LibrarianDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      }
    />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;