import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Plus, Edit, ShieldAlert, Key, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function UserManagement() {
  const { user: loggedInUser, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data states
  const [usersList, setUsersList] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('manager');
  const [formRegion, setFormRegion] = useState('');

  const fetchData = async () => {
    try {
      const [usrRes, wilRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/wilayah`)
      ]);
      const usrData = await usrRes.json();
      const wilData = await wilRes.json();
      setUsersList(usrData);
      setRegions(wilData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('manager');
    setFormRegion(regions[0]?.name || '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      region: formRole === 'regional_user' ? formRegion : null
    };

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': loggedInUser.name
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("User baru berhasil ditambahkan!", "success");
        setModalOpen(false);
        fetchData();
      } else {
        showToast("Email sudah terdaftar atau input tidak valid.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan server.", "danger");
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Reset password untuk ${name} ke password default?`)) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}/reset-password`, {
        method: 'POST',
        headers: { 'x-user-name': loggedInUser.name }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        showToast("Password berhasil direset!", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, name) => {
    if (id === loggedInUser.id) {
      alert("Anda tidak bisa menonaktifkan akun Anda sendiri!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
        method: 'POST',
        headers: { 'x-user-name': loggedInUser.name }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['Nama', 'Email', 'Role / Akses', 'Wilayah', 'Status', 'Aksi Kontrol'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Manajemen User" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Cari user, email, role..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Tambah User Baru
            </button>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: '600' }}>{u.name}</span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge`} style={{
                    backgroundColor: u.role === 'admin' ? '#FAF8F7' : u.role === 'manager' ? '#fff0e7' : '#faebee',
                    color: u.role === 'admin' ? 'var(--dark)' : u.role === 'manager' ? 'var(--primary)' : 'var(--secondary)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.region || '-'}</td>
                <td>
                  <span className={`badge badge-${u.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleResetPassword(u.id, u.name)}
                      style={{ color: '#F59E0B', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '11.5px', fontWeight: '500' }}
                    >
                      <Key size={14} /> Reset Pass
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.name)}
                      style={{
                        color: u.status === 'Aktif' ? 'var(--danger)' : 'var(--success)',
                        display: 'flex', gap: '4px', alignItems: 'center', fontSize: '11.5px', fontWeight: '500'
                      }}
                      disabled={u.id === loggedInUser.id}
                    >
                      {u.status === 'Aktif' ? (
                        <>
                          <ToggleRight size={16} /> Nonaktifkan
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} /> Aktifkan
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )}
            renderCard={(u) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontWeight: '600', fontSize: '13.5px' }}>{u.name}</span>
                  </div>
                  <span className={`badge badge-${u.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {u.status}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-medium)', marginBottom: '12px' }}>
                  <span>Email: {u.email}</span>
                  <span>Akses: <strong style={{ textTransform: 'capitalize' }}>{u.role}</strong> {u.region ? `(${u.region})` : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button 
                    onClick={() => handleResetPassword(u.id, u.name)} 
                    style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                  >
                    <Key size={14} /> Reset Pass
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(u.id, u.name)} 
                    style={{ color: u.status === 'Aktif' ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                    disabled={u.id === loggedInUser.id}
                  >
                    {u.status === 'Aktif' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} 
                    {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredUsers.length > itemsPerPage && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => paginate(idx + 1)}
                    className={`pagination-page ${currentPage === idx + 1 ? 'active' : ''}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah User Baru">
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: Rian Pratama" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Contoh: rian@sipf.com" 
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Role Akses</label>
            <select 
              className="form-control"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              required
            >
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="regional_user">User Regional (Wilayah)</option>
            </select>
          </div>

          {formRole === 'regional_user' && (
            <div className="form-group animate-fade" style={{ marginBottom: 0 }}>
              <label className="form-label">Wilayah Penugasan</label>
              <select 
                className="form-control"
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value)}
                required
              >
                {regions.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ backgroundColor: '#FAF8F7', padding: '10px', borderRadius: '8px', border: '1px solid #F0EAE8', fontSize: '11px', color: 'var(--text-medium)', lineHeight: 1.4 }}>
            <strong>Catatan Kredensial:</strong> User baru akan didaftarkan secara aktif dengan password default: <strong>defaultPassword123</strong>. User disarankan mengubah password pada menu profil setelah berhasil login.
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Data
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
