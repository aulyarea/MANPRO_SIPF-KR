import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ResponsiveCardView from '../components/ResponsiveCardView.jsx';
import { Calendar, User, Database, Info, Filter } from 'lucide-react';

export default function ActivityLog() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data States
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [actionFilter, setActionFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logs`);
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter Logic
  const filteredLogs = logs.filter(log => 
    actionFilter === '' || log.action.toLowerCase() === actionFilter.toLowerCase()
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const headers = ['Tanggal & Waktu', 'User', 'Aksi / Aktivitas', 'Tabel Terkait', 'Keterangan Rinci'];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Navbar title="Audit Trail - Activity Log" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="content-body">
          
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #F0EAE8',
            borderRadius: '12px',
            padding: '16px 20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5C5554', fontSize: '13.5px' }}>
              <Filter size={16} style={{ color: '#ffb692' }} />
              <span>Filter Log Aktivitas:</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'Login', 'Tambah Data', 'Edit Data', 'Hapus Data'].map((act, i) => (
                <button
                  key={i}
                  onClick={() => { setActionFilter(act); setCurrentPage(1); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: actionFilter === act ? 'var(--primary)' : '#F0EAE8',
                    backgroundColor: actionFilter === act ? 'var(--primary-light)' : '#FFF',
                    color: actionFilter === act ? 'var(--text-main)' : 'var(--text-medium)'
                  }}
                >
                  {act === '' ? 'Semua Aktivitas' : act}
                </button>
              ))}
            </div>
          </div>

          {/* Table / Responsive Card View */}
          <ResponsiveCardView 
            headers={headers}
            data={currentItems}
            isLoading={loading}
            renderRow={(log) => (
              <tr key={log.id}>
                <td style={{ color: 'var(--text-medium)', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} style={{ color: '#ffb692' }} />
                    <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} style={{ color: '#ffb692' }} />
                    <span>{log.user}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge`} style={{
                    backgroundColor: 
                      log.action === 'Login' ? '#E6FDF4' :
                      log.action === 'Tambah Data' ? '#fff0e7' :
                      log.action === 'Edit Data' ? '#FEF6E7' : '#FEECEB',
                    color: 
                      log.action === 'Login' ? '#10B981' :
                      log.action === 'Tambah Data' ? 'var(--primary)' :
                      log.action === 'Edit Data' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontWeight: '500', color: 'var(--text-medium)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={13} style={{ color: '#ffb692' }} />
                    <span>{log.table}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-medium)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.details}
                </td>
              </tr>
            )}
            renderCard={(log) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                  <span className={`badge`} style={{
                    backgroundColor: 
                      log.action === 'Login' ? '#E6FDF4' :
                      log.action === 'Tambah Data' ? '#fff0e7' :
                      log.action === 'Edit Data' ? '#FEF6E7' : '#FEECEB',
                    color: 
                      log.action === 'Login' ? '#10B981' :
                      log.action === 'Tambah Data' ? 'var(--primary)' :
                      log.action === 'Edit Data' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {log.action}
                  </span>
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                  User: {log.user}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-medium)', marginBottom: '8px' }}>
                  <span>Tabel Terkait: <strong>{log.table}</strong></span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  backgroundColor: '#FAF8F7',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #F0EAE8'
                }}>
                  {log.details}
                </p>
              </div>
            )}
          />

          {/* Pagination */}
          {!loading && filteredLogs.length > itemsPerPage && (
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
    </div>
  );
}
