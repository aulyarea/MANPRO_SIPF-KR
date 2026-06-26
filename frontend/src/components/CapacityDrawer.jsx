import React, { useEffect } from 'react';
import { X, Warehouse, CheckCircle, Package } from 'lucide-react';

export default function CapacityDrawer({ isOpen, onClose, gudang }) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !gudang) return null;

  const percentage = Math.round((gudang.utilized / gudang.capacity) * 100);
  
  // Decide utilization color
  let progressColor = '#10B981'; // Green
  let progressBg = '#E6FDF4';
  if (percentage >= 90) {
    progressColor = '#EF4444'; // Red
    progressBg = '#FEECEB';
  } else if (percentage >= 75) {
    progressColor = '#F59E0B'; // Yellow/Orange
    progressBg = '#FEF6E7';
  }

  // Mock inventories in warehouse
  const mockInventory = [
    { name: 'Kecap Bango 550ml', qty: Math.round(gudang.utilized * 0.15), unit: 'Pcs' },
    { name: 'Saos Sambal ABC 335ml', qty: Math.round(gudang.utilized * 0.1), unit: 'Pcs' },
    { name: 'Indomie Goreng Spesial', qty: Math.round(gudang.utilized * 0.5), unit: 'Karton' },
    { name: 'Sari Roti Sobek', qty: Math.round(gudang.utilized * 0.25), unit: 'Pcs' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(45, 41, 40, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Drawer Container */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 40px rgba(45, 41, 40, 0.15)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F0EAE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Warehouse size={20} style={{ color: '#ffb692' }} />
            <span style={{ fontWeight: '600', fontSize: '15px', fontFamily: 'Poppins', color: '#2D2928' }}>Detail Gudang</span>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FAF8F7',
              color: '#8F8785',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          
          {/* Warehouse Profile Card */}
          <div className="card" style={{ marginBottom: '24px', borderStyle: 'dashed', backgroundColor: '#FAF8F7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#8F8785', fontWeight: '600' }}>KODE: {gudang.id}</span>
                <h4 style={{ fontSize: '16px', color: '#2D2928', marginTop: '2px' }}>{gudang.name}</h4>
              </div>
              <span className={`badge badge-${gudang.status === 'Aktif' ? 'success' : 'danger'}`}>
                {gudang.status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#5C5554' }}>
              <strong>Lokasi:</strong> {gudang.location}
            </p>
          </div>

          {/* Capacity Utilization Progress Chart */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#2D2928' }}>Utilisasi Kapasitas</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: progressColor }}>{percentage}%</span>
            </div>

            {/* Custom Progress Bar */}
            <div style={{
              width: '100%',
              height: '16px',
              backgroundColor: '#F0EAE8',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <div style={{
                width: `${Math.min(100, percentage)}%`,
                height: '100%',
                backgroundColor: progressColor,
                borderRadius: '8px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8F8785' }}>
              <span>Terpakai: <strong>{gudang.utilized} Ton</strong></span>
              <span>Total: <strong>{gudang.capacity} Ton</strong></span>
            </div>
            
            <p style={{
              marginTop: '16px',
              fontSize: '12px',
              color: progressColor,
              backgroundColor: progressBg,
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}>
              <CheckCircle size={14} />
              {percentage >= 90 
                ? 'Peringatan: Gudang hampir penuh!' 
                : percentage >= 75 
                ? 'Perhatian: Kapasitas mencapai ambang batas.' 
                : 'Status kapasitas aman untuk penyimpanan baru.'}
            </p>
          </div>

          {/* Stored Products Inventory List */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#2D2928', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={15} style={{ color: '#8F8785' }} />
              Daftar Barang Tersimpan
            </h5>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF8F7', borderBottom: '1px solid #F0EAE8' }}>
                    <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8F8785', textAlign: 'left' }}>Nama Barang</th>
                    <th style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8F8785', textAlign: 'right' }}>Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {mockInventory.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FAF8F7' }}>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#2D2928' }}>{item.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#2D2928', fontWeight: '600', textAlign: 'right' }}>
                        {item.qty} {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
