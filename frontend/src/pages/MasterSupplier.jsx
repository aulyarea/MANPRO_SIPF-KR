import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function MasterSupplier() {
  const { user, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null); // null for Add, supplier object for Edit
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState(true); // true = Aktif, false = Nonaktif

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/suppliers`);
      const data = await res.json();
      setSuppliers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setCurrentSupplier(null);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormEmail('');
    setFormStatus(true);
    setModalOpen(true);
  };

  const openEditModal = (sup) => {
    setCurrentSupplier(sup);
    setFormName(sup.name);
    setFormAddress(sup.address);
    setFormPhone(sup.phone);
    setFormEmail(sup.email);
    setFormStatus(sup.status === 'Aktif');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      address: formAddress,
      phone: formPhone,
      email: formEmail,
      status: formStatus ? 'Aktif' : 'Nonaktif'
    };

    const isEdit = !!currentSupplier;
    const url = isEdit ? `${API_URL}/api/suppliers/${currentSupplier.id}` : `${API_URL}/api/suppliers`;
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
          isEdit ? "Data supplier berhasil diperbarui!" : "Supplier baru berhasil ditambahkan!",
          "success"
        );
        setModalOpen(false);
        fetchSuppliers();
      } else {
        showToast("Terjadi kesalahan saat menyimpan data.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan koneksi server.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus supplier ini?")) return;
    try {
      const res = await fetch(`${API_URL}/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': user.name }
      });
      if (res.ok) {
        showToast("Supplier berhasil dihapus!", "success");
        fetchSuppliers();
      } else {
        showToast("Gagal menghapus supplier.", "danger");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredSuppliers = suppliers.filter(sup => {
    const matchesSearch = 
      sup.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || sup.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['ID Supplier', 'Nama Supplier', 'Alamat', 'Telepon', 'Email', 'Status', 'Aksi'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Master Data Supplier" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '480px' }} className="form-split">
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cari ID, nama, alamat..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Status Filter */}
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
              <Plus size={16} /> Tambah Supplier
            </button>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(sup) => (
              <tr key={sup.id}>
                <td style={{ fontWeight: '600' }}>{sup.id}</td>
                <td style={{ fontWeight: '500' }}>{sup.name}</td>
                <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sup.address}</td>
                <td>{sup.phone}</td>
                <td>{sup.email}</td>
                <td>
                  <span className={`badge badge-${sup.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {sup.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(sup)} style={{ color: '#ffb692' }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(sup.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )}
            renderCard={(sup) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {sup.id}</span>
                  <span className={`badge badge-${sup.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {sup.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '6px' }}>{sup.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-medium)', marginBottom: '8px' }}>{sup.address}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Telp: {sup.phone}</span>
                  <span>Email: {sup.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => openEditModal(sup)} style={{ color: '#ffb692', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(sup.id)} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredSuppliers.length > itemsPerPage && (
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

      {/* Add / Edit Modal Form */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentSupplier ? `Edit Supplier - ${currentSupplier.id}` : "Tambah Supplier Baru"}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Supplier</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: PT. Logistik Jaya" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat</label>
            <textarea 
              className="form-control" 
              placeholder="Tuliskan alamat lengkap..." 
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              rows="3"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Telepon</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="Contoh: 0812345678" 
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Contoh: info@supplier.com" 
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
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
