import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function MasterDistributor() {
  const { user, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [distributors, setDistributors] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDist, setCurrentDist] = useState(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState(true);

  const fetchData = async () => {
    try {
      const [distRes, wilRes] = await Promise.all([
        fetch(`${API_URL}/api/distributors`),
        fetch(`${API_URL}/api/wilayah`)
      ]);
      const distData = await distRes.json();
      const wilData = await wilRes.json();
      setDistributors(distData);
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
    setCurrentDist(null);
    setFormName('');
    setFormRegion(regions[0]?.name || '');
    setFormPhone('');
    setFormStatus(true);
    setModalOpen(true);
  };

  const openEditModal = (dist) => {
    setCurrentDist(dist);
    setFormName(dist.name);
    setFormRegion(dist.region);
    setFormPhone(dist.phone);
    setFormStatus(dist.status === 'Aktif');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      region: formRegion,
      phone: formPhone,
      status: formStatus ? 'Aktif' : 'Nonaktif'
    };

    const isEdit = !!currentDist;
    const url = isEdit ? `${API_URL}/api/distributors/${currentDist.id}` : `${API_URL}/api/distributors`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': user.name
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(
          isEdit ? "Distributor berhasil diperbarui!" : "Distributor baru berhasil ditambahkan!",
          "success"
        );
        setModalOpen(false);
        fetchData();
      } else {
        showToast("Terjadi kesalahan saat menyimpan data.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan koneksi server.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus distributor ini?")) return;
    try {
      const res = await fetch(`${API_URL}/api/distributors/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': user.name }
      });
      if (res.ok) {
        showToast("Distributor berhasil dihapus!", "success");
        fetchData();
      } else {
        showToast("Gagal menghapus distributor.", "danger");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredDistributors = distributors.filter(dist => {
    const matchesSearch = 
      dist.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || dist.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredDistributors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDistributors.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['Kode Distributor', 'Nama Distributor', 'Wilayah', 'Nomor Telepon', 'Status', 'Aksi'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Master Data Distributor" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Header Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '480px' }} className="form-split">
              
              {/* Search input */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cari Kode, nama, wilayah..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Status filter */}
              <div style={{ width: '150px' }}>
                <select 
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

            </div>

            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Tambah Distributor
            </button>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(dist) => (
              <tr key={dist.id}>
                <td style={{ fontWeight: '600' }}>{dist.id}</td>
                <td style={{ fontWeight: '500' }}>{dist.name}</td>
                <td>{dist.region}</td>
                <td>{dist.phone}</td>
                <td>
                  <span className={`badge badge-${dist.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {dist.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(dist)} style={{ color: '#ffb692' }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(dist.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )}
            renderCard={(dist) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Kode: {dist.id}</span>
                  <span className={`badge badge-${dist.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {dist.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{dist.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-medium)', marginBottom: '12px' }}>
                  <span>Wilayah: <strong>{dist.region}</strong></span>
                  <span>Telp: {dist.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => openEditModal(dist)} style={{ color: '#ffb692', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(dist.id)} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredDistributors.length > itemsPerPage && (
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

      {/* Add / Edit Form Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentDist ? `Edit Distributor - ${currentDist.id}` : "Tambah Distributor Baru"}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Distributor</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: CV. Jaya Distribusi" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Wilayah</label>
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

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nomor Telepon</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: 0812XXXXXXXX" 
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Status Aktif</label>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={formStatus} 
                onChange={(e) => setFormStatus(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
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

      <style>{`
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
