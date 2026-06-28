import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../App.jsx';
import SupplierMap from '../components/SupplierMap.jsx';
import { Package, MapPin, Send, Plus, Trash2, Shield, Eye, Info, Clock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Suppliers & Regions state (for form select and map display)
  const [suppliers, setSuppliers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [requesterName, setRequesterName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [items, setItems] = useState([
    { name: '', qty: 10, unit: 'Pcs', note: '' }
  ]);

  // Load suppliers and regions
  useEffect(() => {
    fetch(`${API_URL}/api/suppliers`)
      .then(res => res.json())
      .then(data => setSuppliers(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/api/wilayah`)
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error(err));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { name: '', qty: 10, unit: 'Pcs', note: '' }]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...items];
    updated[idx][field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requesterName || !selectedRegion) {
      alert("Nama pemohon dan wilayah wajib diisi!");
      return;
    }
    
    // Filter empty item names
    const validItems = items.filter(itm => itm.name.trim() !== '');
    if (validItems.length === 0) {
      alert("Tuliskan minimal satu barang yang diminta!");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterName,
          region: selectedRegion,
          items: validItems
        })
      });

      if (res.ok) {
        setSubmitSuccess(true);
        // Reset form
        setRequesterName('');
        setSelectedRegion('');
        setItems([{ name: '', qty: 10, unit: 'Pcs', note: '' }]);
      } else {
        alert("Gagal mengirim permintaan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F7', display: 'flex', flexDirection: 'column' }}>
      
      {/* Landing Header */}
      <header style={{
        height: '75px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F0EAE8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#ffb692',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#2D2928'
          }}>
            IF
          </div>
          <div>
            <span style={{ fontWeight: '800', fontSize: '16px', color: '#2D2928', fontFamily: 'Poppins' }}>PT. KUSUMA JAYA</span>
            <span style={{ fontSize: '10px', display: 'block', color: '#8F8785', fontWeight: '600', letterSpacing: '0.5px', marginTop: '-3px' }}>SIPF-KR PORTAL</span>
          </div>
        </div>

        {/* Navigation / Login Button */}
        <button 
          onClick={() => navigate('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: '#2D2928',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <Shield size={14} style={{ color: '#ffb692' }} />
          <span>Masuk Sistem</span>
        </button>
      </header>

      {/* Main Content Container */}
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '50px' }} className="animate-fade">
          <span style={{
            backgroundColor: '#fff0e7',
            color: '#ffb692',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            Sistem Perencanaan Permintaan Kebutuhan Regional
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#2D2928', marginBottom: '12px', lineHeight: 1.2, fontFamily: 'Poppins' }}>
            SIPF-KR KUSUMA JAYA
          </h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: '#5C5554', fontSize: '14px', lineHeight: 1.6 }}>
            Modul perancangan logistik regional. Memfasilitasi staff operasional wilayah dalam merumuskan kebutuhan barang toko/gudang secara langsung, serta memantau peta sebaran supplier.
          </p>
        </section>

        {/* Multi-Column Layout: Form on Left, Map/Info on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="landing-grid">
          
          {/* Request Form Area */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1.5px solid #F0EAE8' }}>
              <Package size={20} style={{ color: '#ffb692' }} />
              <h3 style={{ fontSize: '16px', color: '#2D2928' }}>Form Permintaan Barang Wilayah</h3>
            </div>

            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-scale">
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#E6FDF4',
                  color: '#10B981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Send size={28} />
                </div>
                <h4 style={{ color: '#2D2928', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Permintaan Berhasil Dikirim!</h4>
                <p style={{ color: '#8F8785', fontSize: '13px', maxWidth: '360px', marginBottom: '24px' }}>
                  Permintaan barang Anda telah masuk ke sistem antrean perancangan manager dan monitoring admin untuk diproses.
                </p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="btn btn-primary"
                >
                  Buat Permintaan Baru
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-split">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Pemohon / Toko</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Toko Pak Usman" 
                      value={requesterName} 
                      onChange={(e) => setRequesterName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Wilayah Operasional</label>
                    <select 
                      className="form-control" 
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Wilayah --</option>
                      {regions.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic List of Requested Items */}
                <div style={{ marginTop: '10px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Daftar Barang yang Dibutuhkan</span>
                    <button 
                      type="button" 
                      onClick={handleAddItem}
                      style={{ fontSize: '11px', color: '#ffb692', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Tambah Barang
                    </button>
                  </label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1.5fr auto',
                        gap: '8px',
                        alignItems: 'center',
                        backgroundColor: '#FAF8F7',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #F0EAE8'
                      }} className="item-row">
                        
                        {/* Item Name */}
                        <div>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Kecap Bango, Saos ABC..." 
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            required
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <input 
                            type="number" 
                            min="1" 
                            className="form-control" 
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            required
                          />
                        </div>

                        {/* Unit */}
                        <div>
                          <select 
                            className="form-control"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          >
                            <option value="Pcs">Pcs</option>
                            <option value="Karton">Karton</option>
                            <option value="Box">Box</option>
                            <option value="Dus">Dus</option>
                            <option value="Pack">Pack</option>
                          </select>
                        </div>

                        {/* Note */}
                        <div>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Catatan (opsional)" 
                            value={item.note}
                            onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                          />
                        </div>

                        {/* Remove Button */}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          style={{
                            color: items.length === 1 ? '#8F8785' : '#EF4444',
                            opacity: items.length === 1 ? 0.3 : 1,
                            padding: '6px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '16px', display: 'flex', gap: '8px' }}
                  disabled={submitLoading}
                >
                  <Send size={15} />
                  {submitLoading ? 'Sedang mengirim...' : 'Kirim Permintaan Ke Manager'}
                </button>
              </form>
            )}
          </div>

          {/* Map & Instructions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Supplier Map component */}
            <SupplierMap suppliers={suppliers} />
            
            {/* Info Card */}
            <div className="card" style={{ backgroundColor: '#2D2928', color: '#FFFFFF' }}>
              <h4 style={{ color: '#ffb692', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> Alur Kerja Perencanaan
              </h4>
              <ol style={{ paddingLeft: '18px', fontSize: '12.5px', color: '#FADCD6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Regional User memasukkan data kekurangan barang (Kecap, Saos, dll.) melalui halaman portal/landing page ini.</li>
                <li>Data terkirim secara real-time ke modul antrean <strong>Manager</strong>.</li>
                <li>Manager mengkaji permintaan, melakukan input ulang/penyesuaian, serta menghitung <strong>Forecasting</strong> peramalan regional.</li>
                <li><strong>Admin</strong> memantau (Monitoring), mengelola master data logistik, menyetujui (Accept) permintaan, dan mengelola user.</li>
              </ol>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #F0EAE8',
        textAlign: 'center',
        marginTop: '60px'
      }}>
        <p style={{ fontSize: '12px', color: '#8F8785' }}>
          &copy; 2026 PT. KUSUMA JAYA TB TANGERANG. Sistem Informasi Perencanaan Permintaan & Forecasting Regional.
        </p>
      </footer>

      <style>{`
        @media (min-width: 1024px) {
          .landing-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
        @media (max-width: 640px) {
          .form-split {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .item-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .item-row > div:nth-child(1) {
            grid-column: span 2;
          }
          .item-row > div:nth-child(4) {
            grid-column: span 2;
          }
        }
      `}</style>
    </div>
  );
}
