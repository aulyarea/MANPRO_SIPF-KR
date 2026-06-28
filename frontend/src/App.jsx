import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MasterSupplier from './pages/MasterSupplier.jsx';
import MasterGudang from './pages/MasterGudang.jsx';
import MasterDistributor from './pages/MasterDistributor.jsx';
import MasterWilayah from './pages/MasterWilayah.jsx';
import ManajemenUser from './pages/ManajemenUser.jsx';
import Profil from './pages/Profil.jsx';
import ActivityLog from './pages/ActivityLog.jsx';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// API URL helper
export const API_URL = 'https://manprosipf-kr-production.up.railway.app/';

// Simple Alert/Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgMap = {
    success: 'bg-emerald-500 text-white border border-emerald-600',
    danger: 'bg-rose-500 text-white border border-rose-600',
    warning: 'bg-amber-500 text-white border border-amber-600',
    info: 'bg-indigo-500 text-white border border-indigo-600'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 20px',
      borderRadius: '8px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s ease-out',
      backgroundColor: type === 'success' ? '#10B981' : type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginLeft: '8px' }}>&times;</button>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sipf_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }
      setUser(data);
      localStorage.setItem('sipf_user', JSON.stringify(data));
      showToast(`Selamat datang kembali, ${data.name}!`, 'success');
      return data;
    } catch (err) {
      showToast(err.message, 'danger');
      throw err;
    }
  };

  const logout = () => {
    if (user) {
      showToast(`Sampai jumpa, ${user.name}!`, 'info');
    }
    setUser(null);
    localStorage.removeItem('sipf_user');
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sipf_user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins', background: '#FDFBFA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #FADCD6', borderTop: '4px solid #ffb692', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#2D2928', fontWeight: '500' }}>Memuat Aplikasi...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Guard for general login
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfileState, showToast }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          } />

          {/* Admin and Manager Only */}
          <Route path="/logs" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ActivityLog />
            </ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path="/suppliers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MasterSupplier />
            </ProtectedRoute>
          } />
          <Route path="/gudang" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MasterGudang />
            </ProtectedRoute>
          } />
          <Route path="/distributors" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MasterDistributor />
            </ProtectedRoute>
          } />
          <Route path="/wilayah" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MasterWilayah />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManajemenUser />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}
