import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function MasterWilayah() {
  const { user, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);

  // Form Inputs
  const [formName, setFormName] = useState('');

  const fetchRegions = async () => {
    try {
      const res = await fetch(`${API_URL}/wilayah`);
      const data = await res.json();
      setRegions(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const openAddModal = () => {
    setCurrentRegion(null);
    setFormName('');
    setModalOpen(true);
  };

  const openEditModal = (wil) => {
    setCurrentRegion(wil);
    setFormName(wil.name);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName
    };

    const isEdit = !!currentRegion;
    const url = isEdit ? `${API_URL}/wilayah/${currentRegion.id}` : `${API_URL}/wilayah`;
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
          isEdit ? "Wilayah berhasil diperbarui!" : "Wilayah baru berhasil ditambahkan!",
          "success"
        );
        setModalOpen(false);
        fetchRegions();
      } else {
        showToast("Terjadi kesalahan saat menyimpan data.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan koneksi server.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus wilayah ini? Menghapus wilayah akan berdampak pada pemetaan distributor.")) return;
    try {
      const res = await fetch(`${API_URL}/wilayah/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': user.name }
      });
      if (res.ok) {
        showToast("Wilayah berhasil dihapus!", "success");
        fetchRegions();
      } else {
        showToast("Gagal menghapus wilayah.", "danger");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Logic
  const filteredRegions = regions.filter(wil => 
    wil.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wil.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['Kode Wilayah', 'Nama Wilayah', 'Jumlah Distributor Terikat', 'Aksi'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Master Data Wilayah" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Header Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Cari Kode atau nama wilayah..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Tambah Wilayah
            </button>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(wil) => (
              <tr key={wil.id}>
                <td style={{ fontWeight: '600' }}>{wil.id}</td>
                <td style={{ fontWeight: '500' }}>{wil.name}</td>
                <td>{wil.distributorsCount} Distributor</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(wil)} style={{ color: '#ffb692' }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(wil.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )}
            renderCard={(wil) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Kode: {wil.id}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '600' }}>
                    {wil.distributorsCount} Distributor Terikat
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>{wil.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => openEditModal(wil)} style={{ color: '#ffb692', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(wil.id)} style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredRegions.length > itemsPerPage && (
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
        title={currentRegion ? `Edit Wilayah - ${currentRegion.id}` : "Tambah Wilayah Baru"}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Wilayah</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: Depok, Bekasi, Bogor..." 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required 
            />
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
