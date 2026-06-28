import React, { useState } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { User, Lock, Phone, Mail, Award, CheckCircle, RefreshCw } from 'lucide-react';

export default function Profil() {
  const { user, updateProfileState, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile Info Form States
  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '08123456789');
  const [formAvatar, setFormAvatar] = useState(user?.avatar || '');
  const [infoLoading, setInfoLoading] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Pre-seeded avatars for quick profile customize
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100"
  ];

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: formName,
          email: formEmail,
          phone: formPhone,
          avatar: formAvatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        updateProfileState(data);
        showToast("Informasi profil berhasil diperbarui!", "success");
      } else {
        showToast(data.message || "Gagal memperbarui profil.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "danger");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }
    setPassLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Password berhasil diubah!", "success");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.message || "Gagal mengubah password.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "danger");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Profil Saya" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="profile-grid">
            
            {/* Left Column: Profile Avatar Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: 'fit-content' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <img 
                  src={formAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                  alt={user?.name} 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffb692', boxShadow: 'var(--shadow-md)' }}
                />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2D2928' }}>{user?.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{user?.email}</p>
              
              <span className={`badge`} style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                marginBottom: '24px'
              }}>
                Akses: {user?.role === 'regional_user' ? `User ${user?.region}` : user?.role}
              </span>

              {/* Avatar Preset Selector */}
              <div style={{ width: '100%', borderTop: '1px solid #F0EAE8', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Pilih Avatar Cepat:
                </span>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatar(preset)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: formAvatar === preset ? '2px solid var(--primary)' : '1px solid #F0EAE8',
                        padding: 0
                      }}
                    >
                      <img src={preset} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Edit Forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Form 1: Modify Info */}
              <div className="card">
                <h4 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} style={{ color: '#ffb692' }} />
                  Informasi Akun
                </h4>
                
                <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-split">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required 
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Nomor Telepon</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                    disabled={infoLoading}
                  >
                    {infoLoading ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>

                </form>
              </div>

              {/* Form 2: Change Password */}
              <div className="card">
                <h4 style={{ fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={16} style={{ color: '#ffb692' }} />
                  Ganti Password Keamanan
                </h4>
                
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Password Lama</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-split">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Password Baru</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Konfirmasi Password Baru</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-end' }}
                    disabled={passLoading}
                  >
                    {passLoading ? 'Menyimpan...' : 'Perbarui Password'}
                  </button>

                </form>
              </div>

            </div>

          </div>

        </div>
      </div>
      
      <style>{`
        @media (min-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr 2fr !important;
          }
        }
        @media (max-width: 768px) {
          .form-split {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
