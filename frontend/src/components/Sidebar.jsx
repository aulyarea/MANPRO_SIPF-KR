import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  Activity, 
  User, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  Package, 
  Warehouse, 
  Truck, 
  Map,
  X 
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [masterOpen, setMasterOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: isActive ? '#2D2928' : '#8F8785',
    backgroundColor: isActive ? '#fff0e7' : 'transparent',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    fontFamily: 'Inter',
    transition: 'all 0.2s ease',
    marginBottom: '4px'
  });

  const subLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px 10px 36px',
    color: isActive ? '#2D2928' : '#8F8785',
    backgroundColor: isActive ? '#fff0e7' : 'transparent',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: isActive ? '600' : '500',
    fontFamily: 'Inter',
    transition: 'all 0.2s ease',
    marginBottom: '2px'
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(45, 41, 40, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F0EAE8',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="sidebar-layout"
      >
        {/* Header / Brand */}
        <div style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #F0EAE8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#ffb692',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#2D2928',
              fontSize: '14px'
            }}>
              IF
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '15px', color: '#2D2928', lineHeight: 1.1, fontFamily: 'Poppins' }}>PT. KUSUMA JAYA</p>
              <p style={{ fontSize: '11px', color: '#8F8785', fontWeight: '600', letterSpacing: '1px' }}>SIPF-KR</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="sidebar-close-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #F0EAE8',
              color: '#8F8785'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Menus */}
        <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          
          {/* Dashboard (Shared) */}
          <NavLink to="/dashboard" onClick={onClose} style={linkStyle}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* Master Data Submenu (Admin Only) */}
          {user?.role === 'admin' && (
            <div>
              <button 
                onClick={() => setMasterOpen(!masterOpen)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  color: '#8F8785',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter',
                  marginBottom: '4px'
                }}
                className="master-toggle-btn"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Database size={18} />
                  <span>Master Data</span>
                </div>
                {masterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {masterOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '4px' }} className="animate-fade">
                  <NavLink to="/suppliers" onClick={onClose} style={subLinkStyle}>
                    <Package size={15} />
                    <span>Supplier</span>
                  </NavLink>
                  <NavLink to="/gudang" onClick={onClose} style={subLinkStyle}>
                    <Warehouse size={15} />
                    <span>Gudang</span>
                  </NavLink>
                  <NavLink to="/distributors" onClick={onClose} style={subLinkStyle}>
                    <Truck size={15} />
                    <span>Distributor</span>
                  </NavLink>
                  <NavLink to="/wilayah" onClick={onClose} style={subLinkStyle}>
                    <Map size={15} />
                    <span>Wilayah</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* User Management (Admin Only) */}
          {user?.role === 'admin' && (
            <NavLink to="/users" onClick={onClose} style={linkStyle}>
              <Users size={18} />
              <span>Manajemen User</span>
            </NavLink>
          )}

          {/* Audit Trails / Activity Logs (Admin & Manager Only) */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <NavLink to="/logs" onClick={onClose} style={linkStyle}>
              <Activity size={18} />
              <span>Activity Log</span>
            </NavLink>
          )}

          {/* Profile Editor (Shared) */}
          <NavLink to="/profile" onClick={onClose} style={linkStyle}>
            <User size={18} />
            <span>Profil Saya</span>
          </NavLink>

        </div>

        {/* Footer (User Info & Logout) */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #F0EAE8',
          backgroundColor: '#FAF8F7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
              alt={user?.name} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2D2928', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '11px', color: '#8F8785', textTransform: 'capitalize' }}>
                {user?.role === 'regional_user' ? `User ${user?.region}` : user?.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              backgroundColor: '#FEECEB',
              color: '#EF4444',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>

      </aside>

      <style>{`
        /* Desktop sidebar layout (override transform) */
        @media (min-width: 1024px) {
          .sidebar-layout {
            transform: translateX(0) !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
        }
        .master-toggle-btn:hover {
          background-color: var(--light-bg);
          color: var(--text-main) !important;
        }
      `}</style>
    </>
  );
}
