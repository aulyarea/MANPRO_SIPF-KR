import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Modal from '../components/Modal.jsx';
import { 
  Package, 
  Warehouse, 
  Truck, 
  Map, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Edit, 
  Trash2, 
  User, 
  BarChart, 
  LineChart as LineChartIcon,
  RefreshCw,
  Plus,
  FileText,
  Send,
  AlertCircle,
  Download
} from 'lucide-react';

// Excel Export Helper Function (Generates Excel-compatible CSV with UTF-8 BOM)
const exportToExcel = (req, showToast) => {
  try {
    const dateStr = new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let csv = "sep=;\n"; // Direct Excel to separate by semicolon
    csv += "PT. INDOFOOD CBP SUKSES MAKMUR\n";
    csv += "SIPF-KR - PERENCANAAN & FORECASTING KEBUTUHAN REGIONAL\n";
    csv += "=========================================================\n\n";
    csv += `ID Permintaan;${req.id}\n`;
    csv += `Nama Pemohon;${req.requesterName}\n`;
    csv += `Wilayah;${req.region}\n`;
    csv += `Status Laporan;${req.status.toUpperCase()}\n`;
    csv += `Tanggal Pengajuan;${dateStr}\n\n`;
    csv += "DATA BARANG YANG DISETUJUI:\n";
    csv += "No;Nama Barang;Jumlah;Satuan;Keterangan Catatan\n";
    
    req.items.forEach((itm, idx) => {
      csv += `${idx + 1};${itm.name};${itm.qty};${itm.unit};${itm.note || '-'}\n`;
    });
    
    // Create blob with UTF-8 BOM
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SIPF_KR_${req.status}_${req.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (showToast) {
      showToast(`Berkas Excel berhasil diunduh untuk ${req.id}!`, "success");
    }
  } catch (err) {
    console.error(err);
    if (showToast) {
      showToast("Gagal memformat file Excel.", "danger");
    }
  }
};

export default function Dashboard() {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  
  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ suppliers: 0, warehouses: 0, distributors: 0, regions: 0 });
  const [loading, setLoading] = useState(true);

  // Shared data states
  const [requests, setRequests] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [regionsList, setRegionsList] = useState([]);
  
  // Manager forecasting states
  const [forecastRegion, setForecastRegion] = useState('Depok');
  const [forecastProduct, setForecastProduct] = useState('Kecap Bango 550ml');
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Request edit/review modal states
  const [editingRequest, setEditingRequest] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isManagerReview, setIsManagerReview] = useState(false);

  // Regional User: Add Request Modal States
  const [addRequestOpen, setAddRequestOpen] = useState(false);
  const [reqRequesterName, setReqRequesterName] = useState(user?.name || '');
  const [reqItems, setReqItems] = useState([{ name: '', qty: 10, unit: 'Pcs', note: '' }]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch dashboard stats and data
  const fetchData = async () => {
    try {
      const [supRes, gdgRes, dstRes, wilRes, reqRes, logRes] = await Promise.all([
        fetch(`${API_URL}/api/suppliers`),
        fetch(`${API_URL}/api/gudang`),
        fetch(`${API_URL}/api/distributors`),
        fetch(`${API_URL}/api/wilayah`),
        fetch(`${API_URL}/api/requests`),
        fetch(`${API_URL}/api/logs`)
      ]);

      const [sups, gdgs, dsts, wils, reqs, logs] = await Promise.all([
        supRes.json(),
        gdgRes.json(),
        dstRes.json(),
        wilRes.json(),
        reqRes.json(),
        logRes.json()
      ]);

      setStats({
        suppliers: sups.length,
        warehouses: gdgs.filter(g => g.status === 'Aktif').length,
        distributors: dsts.length,
        regions: wils.length
      });
      setRegionsList(wils);
      setRequests(reqs);
      setRecentLogs(logs.slice(0, 4));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run forecasting when region/product changes
  const runForecasting = async () => {
    if (!forecastRegion || !forecastProduct) return;
    setForecastLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/forecasting?region=${forecastRegion}&product=${forecastProduct}`);
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'manager') {
      runForecasting();
    }
  }, [forecastRegion, forecastProduct, user]);

  // Request actions (Admin)
  const handleAcceptRequest = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-name': user.name 
        }
      });
      if (res.ok) {
        showToast("Permintaan berhasil disetujui (Approved)!", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Hapus permintaan ini?")) return;
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}`, {
        method: 'DELETE',
        headers: { 
          'x-user-name': user.name 
        }
      });
      if (res.ok) {
        showToast("Permintaan berhasil dihapus!", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit/Review Modal
  const openEditModal = (req, isReview = false) => {
    setEditingRequest(JSON.parse(JSON.stringify(req))); // Deep copy
    setIsManagerReview(isReview);
    setEditModalOpen(true);
  };

  const handleEditItemQty = (index, val) => {
    const updated = { ...editingRequest };
    updated.items[index].qty = Number(val);
    setEditingRequest(updated);
  };

  const handleEditItemNote = (index, val) => {
    const updated = { ...editingRequest };
    updated.items[index].note = val;
    setEditingRequest(updated);
  };

  const handleSaveRequestEdits = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-name': user.name,
          'x-user-role': user.role
        },
        body: JSON.stringify({
          items: editingRequest.items
        })
      });

      if (res.ok) {
        showToast(
          isManagerReview 
            ? "Permintaan berhasil direview dan di-input ulang!" 
            : "Permintaan berhasil diperbarui!", 
          "success"
        );
        setEditModalOpen(false);
        setEditingRequest(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Regional User: Request Form handlers
  const handleAddReqItemLine = () => {
    setReqItems([...reqItems, { name: '', qty: 10, unit: 'Pcs', note: '' }]);
  };

  const handleRemoveReqItemLine = (idx) => {
    if (reqItems.length > 1) {
      setReqItems(reqItems.filter((_, i) => i !== idx));
    }
  };

  const handleReqItemChange = (idx, field, val) => {
    const updated = [...reqItems];
    updated[idx][field] = val;
    setReqItems(updated);
  };

  const handleAddRequestSubmit = async (e) => {
    e.preventDefault();
    const validItems = reqItems.filter(itm => itm.name.trim() !== '');
    if (validItems.length === 0) {
      alert("Masukkan minimal satu barang!");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName: reqRequesterName || user.name,
          region: user.region,
          items: validItems
        })
      });

      if (res.ok) {
        showToast("Permintaan barang berhasil dikirim ke manager!", "success");
        setAddRequestOpen(false);
        // Reset states
        setReqItems([{ name: '', qty: 10, unit: 'Pcs', note: '' }]);
        setReqRequesterName(user.name);
        fetchData();
      } else {
        showToast("Gagal mengirim permintaan.", "danger");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "danger");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins' }}>
        <p>Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <Navbar 
          title={user?.role === 'admin' ? "Admin Dashboard" : user?.role === 'manager' ? "Forecasting & Review" : `Dashboard - ${user?.region}`} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <div className="content-body animate-fade">
          
          {/* =================================================== */}
          {/* ADMIN VIEW                                          */}
          {/* =================================================== */}
          {user?.role === 'admin' && (
            <div>
              {/* Summary Stats Cards */}
              <div className="grid-stats">
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ffb692' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: '#ffb692', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Supplier</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>{stats.suppliers}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '600' }}>🟢 Aktif</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--success)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Warehouse size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Gudang Aktif</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>{stats.warehouses}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500' }}>Kapasitas aman</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Distributor</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>{stats.distributors}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '600' }}>Siap mendistribusi</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #e7bbc4' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--secondary-light)', color: '#e7bbc4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Map size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Wilayah Kerja</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>{stats.regions}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '500' }}>Jawa Barat & DKI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphical & Widget Section */}
              <div className="grid-widgets">
                {/* Custom SVG Bar Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <BarChart size={18} style={{ color: '#ffb692' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Jumlah Distributor per Wilayah</h4>
                  </div>
                  
                  <div style={{ display: 'flex', height: '220px', padding: '10px 0 20px 30px', position: 'relative' }}>
                    {/* Y-Axis */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'right', width: '20px', pointerEvents: 'none' }}>
                      <span>3</span>
                      <span>2</span>
                      <span>1</span>
                      <span>0</span>
                    </div>

                    {/* SVG grid lines backdrop */}
                    <div style={{ position: 'absolute', left: '25px', right: 0, top: '5px', bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                      <div style={{ borderBottom: '1px dashed #F0EAE8', width: '100%', height: 0 }} />
                      <div style={{ borderBottom: '1px dashed #F0EAE8', width: '100%', height: 0 }} />
                      <div style={{ borderBottom: '1px dashed #F0EAE8', width: '100%', height: 0 }} />
                      <div style={{ borderBottom: '1px solid #FAF8F7', width: '100%', height: 0 }} />
                    </div>

                    {/* Bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', flex: 1, zIndex: 5, paddingLeft: '5px' }}>
                      {regionsList.map((w, i) => {
                        const maxVal = 3.5;
                        const heightPct = (w.distributorsCount / maxVal) * 100;
                        return (
                          <div key={w.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '55px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                              {w.distributorsCount}
                            </span>
                            <div style={{
                              width: '28px',
                              height: `${heightPct}%`,
                              background: i % 2 === 0 ? 'linear-gradient(to top, #ffb692, #FADCD6)' : 'linear-gradient(to top, #e7bbc4, #faebee)',
                              borderRadius: '6px 6px 0 0',
                              transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: '0 2px 6px rgba(45,41,40,0.05)'
                            }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '8px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                              {w.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Activity Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="card" style={{ padding: '20px', height: '100%' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1.5px solid #F0EAE8' }}>
                      Aktivitas Pengguna Terbaru
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {recentLogs.map(log => (
                        <div key={log.id} style={{ fontSize: '12px', position: 'relative', paddingLeft: '16px' }}>
                          <span style={{ position: 'absolute', left: 0, top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffb692' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px' }}>
                            <span style={{ fontWeight: '600' }}>{log.user}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.3 }}>{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitoring Table for Requests */}
              <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Monitoring & Accept Permintaan Barang</h4>
                  <span className="badge badge-warning" style={{ textTransform: 'none', padding: '6px 12px' }}>
                    {requests.filter(r => r.status === 'Pending').length} Menunggu Persetujuan
                  </span>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Permintaan</th>
                        <th>Pemohon</th>
                        <th>Wilayah</th>
                        <th>Barang yang Diminta</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: '600' }}>{req.id}</td>
                          <td>{req.requesterName}</td>
                          <td>
                            <span style={{ fontWeight: '500' }}>{req.region}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {req.items.map((itm, i) => (
                                <span key={i} style={{ fontSize: '12px' }}>
                                  • {itm.name} <strong>({itm.qty} {itm.unit})</strong> {itm.note ? `[${itm.note}]` : ''}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${
                              req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'
                            }`} style={{
                              backgroundColor: req.status === 'Processed' ? 'var(--primary-light)' : undefined,
                              color: req.status === 'Processed' ? 'var(--primary)' : undefined,
                            }}>
                              {req.status === 'Processed' ? 'Processed' : req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {(req.status === 'Pending' || req.status === 'Processed') && (
                                <button 
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className="btn btn-success" 
                                  style={{ padding: '6px 10px', fontSize: '11px' }}
                                >
                                  <CheckCircle size={12} /> Accept
                                </button>
                              )}
                              
                              {/* Unduh Excel Button active for Approved Requests */}
                              {req.status === 'Approved' && (
                                <button 
                                  onClick={() => exportToExcel(req, showToast)}
                                  className="btn btn-success" 
                                  style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: '#10B981', color: '#FFF' }}
                                >
                                  <Download size={12} /> Excel
                                </button>
                              )}

                              <button 
                                onClick={() => openEditModal(req, false)}
                                className="btn btn-secondary" 
                                style={{ padding: '6px 10px', fontSize: '11px' }}
                              >
                                <Edit size={12} /> Edit
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteRequest(req.id)}
                                className="btn btn-danger" 
                                style={{ padding: '6px 10px', fontSize: '11px' }}
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* MANAGER VIEW                                        */}
          {/* =================================================== */}
          {user?.role === 'manager' && (
            <div>
              {/* Requests Review & Process Section */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Kajian Permintaan Barang Regional</h4>
                  <span className="badge badge-warning" style={{ textTransform: 'none' }}>
                    {requests.filter(r => r.status === 'Pending').length} Pending Review
                  </span>
                </div>
                
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Permintaan</th>
                        <th>Pemohon (Wilayah)</th>
                        <th>Kebutuhan Barang</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => (
                        <tr key={req.id}>
                          <td style={{ fontWeight: '600' }}>{req.id}</td>
                          <td>{req.requesterName} ({req.region})</td>
                          <td>
                            {req.items.map((itm, i) => (
                              <div key={i} style={{ fontSize: '12px' }}>
                                • {itm.name}: <strong>{itm.qty} {itm.unit}</strong> {itm.note ? `("${itm.note}")` : ''}
                              </div>
                            ))}
                          </td>
                          <td>
                            <span className={`badge badge-${
                              req.status === 'Approved' ? 'success' : req.status === 'Processed' ? 'success' : 'warning'
                            }`} style={{
                              backgroundColor: req.status === 'Processed' ? 'var(--primary-light)' : undefined,
                              color: req.status === 'Processed' ? 'var(--primary)' : undefined,
                            }}>
                              {req.status === 'Processed' ? 'Di-input Ulang' : req.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => openEditModal(req, true)}
                                className="btn btn-primary"
                                style={{ padding: '8px 12px', fontSize: '12px' }}
                              >
                                <RefreshCw size={12} /> Review & Input
                              </button>
                              
                              {/* Excel Button for manager if approved */}
                              {req.status === 'Approved' && (
                                <button 
                                  onClick={() => exportToExcel(req, showToast)}
                                  className="btn btn-success" 
                                  style={{ padding: '8px 12px', fontSize: '12px', backgroundColor: '#10B981', color: '#FFF' }}
                                >
                                  <Download size={12} /> Excel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Forecasting Interface */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <LineChartIcon size={18} style={{ color: '#ffb692' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Forecasting & Peramalan Kebutuhan Regional</h4>
                </div>

                {/* Control Panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '16px',
                  alignItems: 'end',
                  marginBottom: '24px',
                  backgroundColor: '#FAF8F7',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #F0EAE8'
                }} className="form-split">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Wilayah</label>
                    <select 
                      className="form-control"
                      value={forecastRegion}
                      onChange={(e) => setForecastRegion(e.target.value)}
                    >
                      <option value="Depok">Depok</option>
                      <option value="Bogor">Bogor</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bekasi">Bekasi</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Barang</label>
                    <select 
                      className="form-control"
                      value={forecastProduct}
                      onChange={(e) => setForecastProduct(e.target.value)}
                    >
                      <option value="Kecap Bango 550ml">Kecap Bango 550ml</option>
                      <option value="Saos Sambal ABC 335ml">Saos Sambal ABC 335ml</option>
                      <option value="Indomie Goreng Spesial">Indomie Goreng Spesial</option>
                    </select>
                  </div>

                  <button 
                    onClick={runForecasting} 
                    className="btn btn-primary"
                    style={{ height: '42px', padding: '0 20px' }}
                    disabled={forecastLoading}
                  >
                    {forecastLoading ? 'Menghitung...' : 'Hitung Forecast (SMA 3)'}
                  </button>
                </div>

                {/* SVG Line Chart */}
                {forecastData && (
                  <div className="animate-fade">
                    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '24px' }} className="map-grid">
                      
                      {/* SVG Chart */}
                      <div style={{
                        backgroundColor: '#FAF8F7',
                        border: '1px solid #F0EAE8',
                        borderRadius: '12px',
                        padding: '20px',
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)', display: 'block', marginBottom: '12px' }}>
                          Grafik Peramalan Kebutuhan (Aktual vs Prediksi)
                        </span>

                        <svg viewBox="0 0 500 240" style={{ width: '100%', height: '100%', minHeight: '200px' }}>
                          {/* Grid lines */}
                          <line x1="40" y1="30" x2="480" y2="30" stroke="#EBE7E5" strokeWidth="0.5" strokeDasharray="3,3" />
                          <line x1="40" y1="75" x2="480" y2="75" stroke="#EBE7E5" strokeWidth="0.5" strokeDasharray="3,3" />
                          <line x1="40" y1="120" x2="480" y2="120" stroke="#EBE7E5" strokeWidth="0.5" strokeDasharray="3,3" />
                          <line x1="40" y1="165" x2="480" y2="165" stroke="#EBE7E5" strokeWidth="0.5" strokeDasharray="3,3" />
                          <line x1="40" y1="210" x2="480" y2="210" stroke="#2D2928" strokeWidth="1" />

                          {/* Data lines */}
                          {(() => {
                            const combined = forecastData.combinedData;
                            const maxVal = Math.max(...combined.map(d => d.Aktual || d.Prediksi || 1)) * 1.1;
                            
                            const points = combined.map((d, i) => {
                              const x = 50 + (i * 48);
                              const val = d.Aktual !== null ? d.Aktual : d.Prediksi;
                              const y = 210 - ((val / maxVal) * 170);
                              return { x, y, val, month: d.month, type: d.Aktual !== null ? 'actual' : 'forecast' };
                            });

                            const actualPoints = points.filter(p => p.type === 'actual' || p.month === forecastData.labels[5]);
                            const actualPath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            
                            const forecastPoints = points.slice(5);
                            const forecastPath = forecastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                            return (
                              <g>
                                <path d={actualPath} fill="none" stroke="#2D2928" strokeWidth="2.5" />
                                <path d={forecastPath} fill="none" stroke="#ffb692" strokeWidth="2.5" strokeDasharray="6,4" />

                                {points.map((p, i) => (
                                  <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="5" fill={p.type === 'actual' ? '#2D2928' : '#ffb692'} stroke="#FFFFFF" strokeWidth="1.5" />
                                    <text x={p.x} y="226" fill="var(--text-muted)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                                      {p.month.split(' ')[0]}
                                    </text>
                                    <text x={p.x} y={p.y - 10} fill="var(--text-main)" fontSize="9" textAnchor="middle" fontWeight="700">
                                      {p.val}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            );
                          })()}
                        </svg>

                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', marginTop: '10px', justifyContent: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '12px', height: '3px', backgroundColor: '#2D2928', display: 'inline-block' }}></span>
                            Permintaan Aktual
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '12px', height: '3px', borderTop: '3px dashed #ffb692', display: 'inline-block' }}></span>
                            Ramalan Forecasting (SMA-3)
                          </span>
                        </div>
                      </div>

                      {/* Forecasting Text stats */}
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Analisis Ramalan:</span>
                        <h4 style={{ fontSize: '15px', color: 'var(--text-main)', marginTop: '4px', marginBottom: '16px', fontWeight: '700' }}>{forecastData.product}</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-medium)' }}>Rata-rata 6 bln:</span>
                            <strong style={{ color: 'var(--text-main)' }}>
                              {Math.round(forecastData.history.reduce((a,b) => a+b, 0) / 6)} Pcs/Bln
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-medium)' }}>Proyeksi {forecastData.labels[6].split(' ')[0]}:</span>
                            <strong style={{ color: 'var(--primary)' }}>{forecastData.forecast[0]} Pcs</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-medium)' }}>Proyeksi {forecastData.labels[7].split(' ')[0]}:</span>
                            <strong style={{ color: 'var(--primary)' }}>{forecastData.forecast[1]} Pcs</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--text-medium)' }}>Proyeksi {forecastData.labels[8].split(' ')[0]}:</span>
                            <strong style={{ color: 'var(--primary)' }}>{forecastData.forecast[2]} Pcs</strong>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--text-main)', fontSize: '12px', lineHeight: 1.4, border: '1.5px solid rgba(255, 182, 146, 0.2)' }}>
                          <strong>Rekomendasi Strategis:</strong> Kebutuhan barang diproyeksikan {
                            forecastData.forecast[2] > forecastData.history[5] ? 'meningkat' : 'menurun'
                          } sebesar {
                            Math.abs(Math.round(((forecastData.forecast[2] - forecastData.history[5]) / forecastData.history[5]) * 100))
                          }%. Atur jadwal pengadaan armada distributor dengan saksama.
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* REGIONAL USER VIEW                                  */}
          {/* =================================================== */}
          {user?.role === 'regional_user' && (
            <div>
              {/* Stats for the region */}
              <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ffb692' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: '#ffb692', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Pengajuan Dikirim</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>
                      {requests.filter(r => r.region.toLowerCase() === user?.region?.toLowerCase()).length}
                    </h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--success)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Disetujui (Approved)</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>
                      {requests.filter(r => r.region.toLowerCase() === user?.region?.toLowerCase() && r.status === 'Approved').length}
                    </h3>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Menunggu Tinjauan</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--dark)', marginTop: '2px' }}>
                      {requests.filter(r => r.region.toLowerCase() === user?.region?.toLowerCase() && r.status === 'Pending').length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Request tracking status table */}
              <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Pengajuan Permintaan Wilayah: {user?.region}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pantau alur status dan unduh hasil rekap pengadaan barang yang disetujui.</p>
                  </div>
                  
                  <button 
                    onClick={() => setAddRequestOpen(true)} 
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '10px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Plus size={16} /> Tambah Permintaan Barang
                  </button>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID Permintaan</th>
                        <th>Toko / Pemohon</th>
                        <th>Daftar Kebutuhan</th>
                        <th>Tanggal Kirim</th>
                        <th>Status & Alur Proses</th>
                        <th>Unduh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests
                        .filter(r => r.region.toLowerCase() === user?.region?.toLowerCase())
                        .map(req => (
                          <tr key={req.id}>
                            <td style={{ fontWeight: '600' }}>{req.id}</td>
                            <td style={{ fontWeight: '500' }}>{req.requesterName}</td>
                            <td>
                              {req.items.map((itm, i) => (
                                <div key={i} style={{ fontSize: '12px' }}>
                                  • {itm.name}: <strong>{itm.qty} {itm.unit}</strong> {itm.note ? `(${itm.note})` : ''}
                                </div>
                              ))}
                            </td>
                            <td>{new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--warning)',
                                    color: '#FFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: 'bold'
                                  }}>1</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', marginTop: '2px', fontWeight: '500' }}>Pending</span>
                                </div>
                                
                                <div style={{ width: '20px', height: '2px', backgroundColor: (req.status === 'Processed' || req.status === 'Approved') ? 'var(--primary)' : '#FAF8F7', marginTop: '-14px' }} />

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: (req.status === 'Processed' || req.status === 'Approved') ? 'var(--primary)' : '#EBE7E5',
                                    color: (req.status === 'Processed' || req.status === 'Approved') ? '#FFF' : '#8F8785',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: 'bold'
                                  }}>2</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', marginTop: '2px', fontWeight: '500' }}>Processed</span>
                                </div>

                                <div style={{ width: '20px', height: '2px', backgroundColor: req.status === 'Approved' ? 'var(--success)' : '#FAF8F7', marginTop: '-14px' }} />

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: req.status === 'Approved' ? 'var(--success)' : '#EBE7E5',
                                    color: req.status === 'Approved' ? '#FFF' : '#8F8785',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: 'bold'
                                  }}>3</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', marginTop: '2px', fontWeight: '500' }}>Approved</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              {/* Unduh Excel Button for user if approved */}
                              {req.status === 'Approved' ? (
                                <button 
                                  onClick={() => exportToExcel(req, showToast)}
                                  className="btn btn-success" 
                                  style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: '#10B981', color: '#FFF' }}
                                >
                                  <Download size={12} /> Excel
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      }
                      {requests.filter(r => r.region.toLowerCase() === user?.region?.toLowerCase()).length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                            Belum ada permintaan yang diajukan untuk wilayah Anda. Klik "+ Tambah Permintaan Barang" di atas untuk memulai.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Regional User: Add Demand Request Modal Form */}
      {addRequestOpen && (
        <Modal 
          isOpen={addRequestOpen} 
          onClose={() => setAddRequestOpen(false)}
          title={`Buat Permintaan Barang Baru - Wilayah ${user?.region}`}
        >
          <form onSubmit={handleAddRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nama Toko / Pemohon</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Masukkan Nama Toko (Contoh: Toko Pak Usman)"
                value={reqRequesterName}
                onChange={(e) => setReqRequesterName(e.target.value)}
                required
              />
            </div>

            <div className="form-group animate-fade" style={{ marginBottom: 0 }}>
              <label className="form-label">Wilayah Operasional (Terkunci)</label>
              <input 
                type="text" 
                className="form-control"
                value={user?.region}
                disabled
                style={{ backgroundColor: '#FAF8F7', color: 'var(--text-muted)', fontWeight: '600' }}
              />
            </div>

            {/* Dynamic Items list */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Daftar Barang yang Diminta:</span>
                <button 
                  type="button" 
                  onClick={handleAddReqItemLine}
                  style={{ fontSize: '11.5px', color: '#ffb692', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Tambah Item
                </button>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {reqItems.map((itm, idx) => (
                  <div key={idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '6px',
                    alignItems: 'center',
                    backgroundColor: '#FAF8F7',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #F0EAE8'
                  }} className="item-row">
                    
                    <div>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nama barang..." 
                        value={itm.name}
                        onChange={(e) => handleReqItemChange(idx, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <input 
                        type="number" 
                        min="1"
                        className="form-control" 
                        value={itm.qty}
                        onChange={(e) => handleReqItemChange(idx, 'qty', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <select 
                        className="form-control"
                        value={itm.unit}
                        onChange={(e) => handleReqItemChange(idx, 'unit', e.target.value)}
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Karton">Karton</option>
                        <option value="Dus">Dus</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleRemoveReqItemLine(idx)}
                      disabled={reqItems.length === 1}
                      style={{ color: '#EF4444', padding: '4px', opacity: reqItems.length === 1 ? 0.3 : 1 }}
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setAddRequestOpen(false)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                <Send size={14} /> {submitLoading ? 'Sedang mengirim...' : 'Kirim Permintaan'}
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* Edit/Review Demand Request Modal */}
      {editingRequest && (
        <Modal 
          isOpen={editModalOpen} 
          onClose={() => { setEditModalOpen(false); setEditingRequest(null); }}
          title={isManagerReview ? `Kaji & Input Ulang Permintaan ${editingRequest.id}` : `Edit Permintaan ${editingRequest.id}`}
        >
          <form onSubmit={handleSaveRequestEdits} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-medium)', marginBottom: '8px' }}>
              <p><strong>Pemohon:</strong> {editingRequest.requesterName}</p>
              <p><strong>Wilayah:</strong> {editingRequest.region}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-medium)' }}>
                Item / Barang yang Diminta:
              </span>
              
              {editingRequest.items.map((itm, idx) => (
                <div key={itm.id} style={{
                  padding: '12px',
                  backgroundColor: '#FAF8F7',
                  borderRadius: '8px',
                  border: '1px solid #F0EAE8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#2D2928' }}>
                    <span>{itm.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Satuan: {itm.unit}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                    <div>
                      <label className="form-label">Jumlah</label>
                      <input 
                        type="number" 
                        min="1"
                        className="form-control"
                        value={itm.qty}
                        onChange={(e) => handleEditItemQty(idx, e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Catatan</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Ubah keterangan..."
                        value={itm.note || ''}
                        onChange={(e) => handleEditItemNote(idx, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => { setEditModalOpen(false); setEditingRequest(null); }}
                className="btn btn-secondary"
              >
                Batalkan
              </button>
              <button type="submit" className="btn btn-primary">
                {isManagerReview ? 'Simpan & Input Ulang' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @media (max-width: 768px) {
          .grid-stats {
            grid-template-columns: 1fr !important;
          }
          .grid-widgets {
            grid-template-columns: 1fr !important;
          }
          .form-split {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .map-grid {
            grid-template-columns: 1fr !important;
          }
          .item-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .item-row > div:nth-child(1) {
            grid-column: span 2;
          }
        }
      `}</style>
    </div>
  );
}
