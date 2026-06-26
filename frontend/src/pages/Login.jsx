import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { User, Lock, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal, periksa email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill credentials for tester convenience
  const quickLogins = [
    { role: 'Admin', email: 'admin@sipf.com', pass: 'admin123' },
    { role: 'Manager', email: 'manager@sipf.com', pass: 'manager123' },
    { role: 'User Depok', email: 'depok@sipf.com', pass: 'regional123' },
    { role: 'User Bogor', email: 'bogor@sipf.com', pass: 'regional123' }
  ];

  const handleQuickLogin = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FAF8F7' }} className="login-page-container">
      
      {/* Left Column: Form Card */}
      <div style={{
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 24px',
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        zIndex: 10
      }}>
        
        {/* Back to Portal Link */}
        <button 
          onClick={() => navigate('/')}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#8F8785',
            marginBottom: '32px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={14} /> Kembali ke Portal
        </button>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#ffb692',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#2D2928',
            fontSize: '16px'
          }}>
            IF
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2D2928', fontFamily: 'Poppins', lineHeight: 1.1 }}>PT. KUSUMA JAYA</h2>
            <span style={{ fontSize: '11px', color: '#8F8785', fontWeight: '600', letterSpacing: '0.5px' }}>SIPF-KR LOGISTICS LOGIN</span>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#2D2928', fontFamily: 'Poppins', marginBottom: '6px' }}>Selamat Datang</h3>
          <p style={{ fontSize: '13px', color: '#8F8785' }}>Masukkan kredensial Anda untuk masuk ke sistem perencanaan logistik.</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#FEECEB',
            color: '#EF4444',
            borderRadius: '8px',
            fontSize: '12.5px',
            marginBottom: '20px',
            border: '1.5px solid rgba(239, 68, 68, 0.1)',
            fontWeight: '500'
          }} className="animate-fade">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Username/Email Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email / Username</label>
            <div className="form-control-icon">
              <User size={16} className="form-icon-left" />
              <input 
                type="email" 
                className="form-control" 
                placeholder="nama@sipf.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            </div>
            <div className="form-control-icon" style={{ position: 'relative' }}>
              <Lock size={16} className="form-icon-left" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8F8785',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Form Options (Remember Me & Forgot Pass) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C5554', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#ffb692',
                  cursor: 'pointer'
                }}
              />
              <span>Remember Me</span>
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Kirim email reset password: fitur ini adalah simulasi. Silakan gunakan quick-login di bawah."); }} style={{ color: '#2563EB', fontWeight: '500' }}>
              Forgot Password?
            </a>
          </div>

          {/* Login Button (Solid Blue #2563EB) */}
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              marginTop: '8px'
            }}
            disabled={loading}
          >
            {loading ? 'Menghubungkan...' : 'Masuk / Login'}
          </button>
        </form>

        {/* Quick Logins (Predefined credentials) */}
        <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1.5px solid #F0EAE8' }}>
          <span style={{ fontSize: '11px', color: '#8F8785', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>
            Akses Cepat Uji Coba (Demo Quick Login):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {quickLogins.map((ql, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickLogin(ql.email, ql.pass)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#FAF8F7',
                  border: email === ql.email ? '1.5px solid #ffb692' : '1px solid #F0EAE8',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#2D2928',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '11px', color: '#ffb692' }}>{ql.role}</span>
                <span style={{ color: '#5C5554', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ql.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Visual Logistics Banner */}
      <div style={{
        flex: 1.8,
        position: 'relative',
        backgroundColor: '#2D2928',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '60px',
        overflow: 'hidden'
      }} className="login-banner">
        {/* Abstract shapes representing distribution networks */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          background: 'radial-gradient(circle at 80% 20%, #ffb692 0%, transparent 60%), radial-gradient(circle at 20% 80%, #e7bbc4 0%, transparent 60%)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          right: '10%',
          height: '1px',
          backgroundColor: 'rgba(255, 182, 146, 0.2)',
          transform: 'rotate(-15deg)'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          right: '5%',
          height: '1px',
          backgroundColor: 'rgba(231, 187, 196, 0.2)',
          transform: 'rotate(10deg)'
        }} />
        
        {/* Text Details */}
        <div style={{ position: 'relative', zIndex: 5, maxWidth: '540px' }}>
          <span style={{ color: '#ffb692', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            PT KUSUMA JAYA TB TANGERANG
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', lineHeight: 1.2, marginBottom: '18px', fontFamily: 'Poppins' }}>
            Perencanaan Kebutuhan & Peramalan Logistik Regional
          </h1>
          <p style={{ color: '#FADCD6', fontSize: '14px', lineHeight: 1.6, opacity: 0.85 }}>
            Sistem terpadu SIPF-KR untuk analisis data distribusi distributor, koordinasi titik-titik gudang logistik, dan formulasi peramalan regional berbasis algoritma perataan bergerak.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .login-banner {
            display: none !important;
          }
          .login-page-container {
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
