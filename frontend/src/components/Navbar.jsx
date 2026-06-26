import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../App.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown, LogOut, User as UserIcon, Menu } from 'lucide-react';

export default function Navbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'Permintaan baru masuk dari Depok (Toko Pak Usman)', time: '5 mnt yang lalu', unread: true },
    { id: 2, text: 'Manager mereview permintaan REQ-20260613-002', time: '1 jam yang lalu', unread: true },
    { id: 3, text: 'Admin menyetujui data gudang CIMANGGIS', time: '3 jam yang lalu', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #F0EAE8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 99,
      boxShadow: '0 2px 10px rgba(45, 41, 40, 0.02)',
      marginLeft: '260px'
    }}>
      {/* Left: Mobile Menu Trigger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, overflow: 'hidden' }}>
        <button
          onClick={onMenuClick}
          className="mobile-hamburger-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #F0EAE8',
            color: '#2D2928'
          }}
        >
          <Menu size={20} />
        </button>
        <h1 style={{
          fontSize: '18px', fontWeight: '600', color: '#2D2928', fontFamily: 'Poppins',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
        }}>
          {title}
        </h1>
      </div>

      {/* Right Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Search Bar - Hidden on mobile */}
        <div className="nav-search-container" style={{ position: 'relative', width: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
          <input
            type="text"
            placeholder="Cari sesuatu..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              border: '1.5px solid #F0EAE8',
              borderRadius: '8px',
              backgroundColor: '#FAF8F7',
              color: '#2D2928',
              fontFamily: 'Inter'
            }}
          />
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #F0EAE8',
              color: '#5C5554',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '18px',
                height: '18px',
                backgroundColor: '#EF4444',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notif Dropdown */}
          {notifOpen && (
            <div className="animate-scale" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #F0EAE8',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(45, 41, 40, 0.12)',
              padding: '8px 0',
              zIndex: 100
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EAE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#2D2928' }}>Notifikasi</span>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '500' }}>Tandai sudah dibaca</span>
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #FAF8F7',
                    backgroundColor: n.unread ? '#fff0e7' : 'transparent',
                    cursor: 'pointer'
                  }}>
                    <p style={{ fontSize: '12px', color: '#2D2928', marginBottom: '4px', fontWeight: n.unread ? '500' : '400' }}>{n.text}</p>
                    <span style={{ fontSize: '10px', color: '#8F8785' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px' }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
              alt={user?.name}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffb692' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="nav-profile-name">
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2D2928' }}>{user?.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '10px', color: '#8F8785', textTransform: 'capitalize' }}>
                {user?.role === 'regional_user' ? `User ${user?.region}` : user?.role}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: '#8F8785' }} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="animate-scale" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '180px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #F0EAE8',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(45, 41, 40, 0.12)',
              padding: '8px 0',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #FAF8F7' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#2D2928', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: '#8F8785' }}>{user?.email}</p>
              </div>
              <Link to="/profile" onClick={() => setProfileOpen(false)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#5C5554'
              }} className="dropdown-item">
                <UserIcon size={14} />
                <span>Ubah Profil</span>
              </Link>
              <button onClick={handleLogout} style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#EF4444',
                textAlign: 'left'
              }} className="dropdown-item">
                <LogOut size={14} />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .mobile-hamburger-btn {
          display: none !important;
        }
        @media (max-width: 1024px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .nav-search-container, .nav-profile-name {
            display: none !important;
          }
          nav {
            margin-left: 0 !important;   /* ← tambah ini */
          }
        }
        .dropdown-item:hover {
          background-color: var(--primary-light);
        }
      `}</style>
    </nav>
  );
}
