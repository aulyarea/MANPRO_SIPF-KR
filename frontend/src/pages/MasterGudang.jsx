import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import CapacityDrawer from '../components/CapacityDrawer.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';

export default function MasterGudang() {
  const { user, showToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [gudangList, setGudangList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Drawer Overlay State
  const [selectedGudang, setSelectedGudang] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGudang, setCurrentGudang] = useState(null);
  
  // Form Inputs
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCapacity, setFormCapacity] = useState(1000);
  const [formUtilized, setFormUtilized] = useState(0);
  const [formStatus, setFormStatus] = useState(true);

  const fetchGudang = async () => {
    try {
      const res = await fetch(`${API_URL}/gudang`);
      const data = await res.json();
      setGudangList(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGudang();
  }, []);

  const openAddModal = () => {
    setCurrentGudang(null);
    setFormName('');
    setFormLocation('');
    setFormCapacity(1000);
    setFormUtilized(0);
    setFormStatus(true);
    setModalOpen(true);
  };

  const openEditModal = (gdg) => {
    setCurrentGudang(gdg);
    setFormName(gdg.name);
    setFormLocation(gdg.location);
    setFormCapacity(gdg.capacity);
    setFormUtilized(gdg.utilized);
    setFormStatus(gdg.status === 'Aktif');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (Number(formUtilized) > Number(formCapacity)) {
      alert("Kapasitas terpakai tidak boleh melebihi kapasitas total!");
      return;
    }

    const payload = {
      name: formName,
      location: formLocation,
      capacity: Number(formCapacity),
      utilized: Number(formUtilized),
      status: formStatus ? 'Aktif' : 'Nonaktif'
    };

    const isEdit = !!currentGudang;
    const url = isEdit ? `${API_URL}/gudang/${currentGudang.id}` : `${API_URL}/gudang`;
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
          isEdit ? "Data gudang berhasil diperbarui!" : "Gudang baru berhasil ditambahkan!",
          "success"
        );
        setModalOpen(false);
        fetchGudang();
      } else {
        showToast("Terjadi kesalahan saat menyimpan data.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan koneksi server.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus gudang ini?")) return;
    try {
      const res = await fetch(`${API_URL}/gudang/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': user.name }
      });
      if (res.ok) {
        showToast("Gudang berhasil dihapus!", "success");
        fetchGudang();
      } else {
        showToast("Gagal menghapus gudang.", "danger");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDetails = (gdg) => {
    setSelectedGudang(gdg);
    setDrawerOpen(true);
  };

  // Filter Logic
  const filteredGudang = gudangList.filter(gdg => {
    const matchesSearch = 
      gdg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gdg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gdg.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || gdg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredGudang.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGudang.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['Kode Gudang', 'Nama Gudang', 'Lokasi', 'Kapasitas (Ton)', 'Status', 'Aksi'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Master Data Gudang" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Header Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '480px' }} className="form-split">
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F8785' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cari Kode, nama, lokasi..."
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
              <Plus size={16} /> Tambah Gudang
            </button>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(gdg) => (
              <tr key={gdg.id}>
                <td style={{ fontWeight: '600' }}>{gdg.id}</td>
                <td style={{ fontWeight: '500' }}>{gdg.name}</td>
                <td>{gdg.location}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{gdg.capacity} Ton</span>
                    <small style={{ color: 'var(--text-muted)' }}>Utilisasi: {Math.round((gdg.utilized/gdg.capacity)*100)}%</small>
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${gdg.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {gdg.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => handleOpenDetails(gdg)} style={{ color: 'var(--text-medium)', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }} className="btn-secondary-link">
                      <Eye size={15} /> Detail
                    </button>
                    <button onClick={() => openEditModal(gdg)} style={{ color: '#ffb692' }}><Edit size={16} /></button>
                    <button onClick={() => handleDelete(gdg.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )}
            renderCard={(gdg) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {gdg.id}</span>
                  <span className={`badge badge-${gdg.status === 'Aktif' ? 'success' : 'danger'}`}>
                    {gdg.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{gdg.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-medium)', marginBottom: '8px' }}>{gdg.location}</p>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span>Kapasitas: <strong>{gdg.utilized}</strong> / {gdg.capacity} Ton ({Math.round((gdg.utilized/gdg.capacity)*100)}%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => handleOpenDetails(gdg)} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}>
                    <Eye size={14} /> Detail Utilisasi
                  </button>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => openEditModal(gdg)} style={{ color: '#ffb692' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(gdg.id)} style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredGudang.length > itemsPerPage && (
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

      {/* Slide drawer for Warehouse Capacity Details */}
      <CapacityDrawer 
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedGudang(null); }}
        gudang={selectedGudang}
      />

      {/* Add / Edit Form Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={currentGudang ? `Edit Gudang - ${currentGudang.id}` : "Tambah Gudang Baru"}
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Gudang</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: Gudang Regional Depok" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lokasi</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Contoh: Cimanggis, Depok" 
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-split">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kapasitas Maksimal (Ton)</label>
              <input 
                type="number" 
                min="1"
                className="form-control" 
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Terisi/Utilisasi (Ton)</label>
              <input 
                type="number" 
                min="0"
                className="form-control" 
                value={formUtilized}
                onChange={(e) => setFormUtilized(e.target.value)}
                required 
              />
            </div>
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
        .btn-secondary-link:hover {
          color: var(--primary) !important;
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
