import React, { useState } from 'react';
import { MapPin, Phone, Mail, Map } from 'lucide-react';

export default function SupplierMap({ suppliers }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Map coordinates representing regional logistics coordinates in SVG
  // Map dimensions are 500x350
  const regions = [
    { name: 'Tangerang', cx: 80, cy: 120, labelX: 60, labelY: 105 },
    { name: 'Jakarta', cx: 220, cy: 100, labelX: 220, labelY: 80 },
    { name: 'Depok', cx: 210, cy: 200, labelX: 160, labelY: 205 },
    { name: 'Bekasi', cx: 360, cy: 130, labelX: 380, labelY: 125 },
    { name: 'Bogor', cx: 250, cy: 290, labelX: 250, labelY: 320 }
  ];

  // Assign suppliers to map pins based on their address/name keywords
  const getSupplierPin = (supplier) => {
    const addr = supplier.address.toLowerCase();
    if (addr.includes('jakarta') || supplier.name.toLowerCase().includes('cbp')) {
      return { x: 230, y: 110, offset: 0 };
    } else if (addr.includes('depok')) {
      return { x: 210, y: 200, offset: 10 };
    } else if (addr.includes('bogor')) {
      return { x: 260, y: 280, offset: -10 };
    } else if (addr.includes('bekasi') || addr.includes('cikarang')) {
      return { x: 345, y: 140, offset: -5 };
    } else {
      return { x: 100, y: 130, offset: 0 }; // Tangerang
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Map size={18} style={{ color: '#ffb692' }} />
        <h4 style={{ fontSize: '15px', color: '#2D2928' }}>Peta Sebaran Supplier Regional</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', flex: 1 }} className="map-grid">
        
        {/* SVG Minimalist Map */}
        <div style={{
          backgroundColor: '#FAF8F7',
          border: '1px solid #F0EAE8',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          
          <svg viewBox="0 0 500 350" style={{ width: '100%', height: '100%', maxWidth: '500px' }}>
            {/* Grid Lines for Data-Driven look */}
            <defs>
              <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#F0EAE8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Region Connecting Lines / Distribution Routes */}
            <path d="M 80 120 L 220 100 M 220 100 L 210 200 M 210 200 L 250 290 M 220 100 L 360 130 M 360 130 L 210 200" 
                  fill="none" stroke="#e7bbc4" strokeWidth="1.5" strokeDasharray="5,5" />

            {/* Regional Boundary Circles */}
            {regions.map((r, i) => (
              <g key={i}>
                <circle cx={r.cx} cy={r.cy} r="28" fill="#FADCD6" fillOpacity="0.15" stroke="#e7bbc4" strokeWidth="0.5" />
                <circle cx={r.cx} cy={r.cy} r="4" fill="#2D2928" />
                <text x={r.labelX} y={r.labelY} fill="#8F8785" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="Poppins">
                  {r.name.toUpperCase()}
                </text>
              </g>
            ))}

            {/* Supplier Pins */}
            {suppliers && suppliers.map((sup, idx) => {
              const pin = getSupplierPin(sup);
              const isActive = sup.status === 'Aktif';
              const isSelected = selectedSupplier?.id === sup.id;
              
              return (
                <g 
                  key={sup.id} 
                  cursor="pointer" 
                  onClick={() => setSelectedSupplier(sup)}
                  transform={`translate(${pin.x + pin.offset}, ${pin.y + pin.offset})`}
                >
                  {/* Ping Animation for Active Suppliers */}
                  {isActive && (
                    <circle r="12" fill="#10B981" fillOpacity="0.3">
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  {/* Pin Base Circle */}
                  <circle 
                    r={isSelected ? "8" : "6"} 
                    fill={isActive ? "#10B981" : "#EF4444"} 
                    stroke="#FFFFFF" 
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid #F0EAE8',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '10px',
            display: 'flex',
            gap: '12px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              Supplier Aktif
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
              Nonaktif
            </span>
          </div>

          <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '11px', color: '#8F8785', fontWeight: '500' }}>
            Klik PIN untuk detail
          </span>
        </div>

        {/* Selected Supplier Detail Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: selectedSupplier ? 'flex-start' : 'center',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #F0EAE8',
          backgroundColor: '#FFF'
        }}>
          {selectedSupplier ? (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#2D2928' }}>{selectedSupplier.name}</h5>
                <span className={`badge badge-${selectedSupplier.status === 'Aktif' ? 'success' : 'danger'}`}>
                  {selectedSupplier.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#5C5554' }}>
                <p style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={14} style={{ color: '#ffb692', marginTop: '2px', flexShrink: 0 }} />
                  <span>{selectedSupplier.address}</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} style={{ color: '#ffb692', flexShrink: 0 }} />
                  <span>{selectedSupplier.phone}</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: '#ffb692', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedSupplier.email}</span>
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedSupplier(null)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#FAF8F7',
                  border: '1px solid #F0EAE8',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#8F8785',
                  fontWeight: '500'
                }}
              >
                Tutup Detail
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#8F8785', padding: '24px 0' }}>
              <MapPin size={28} style={{ color: '#e7bbc4', marginBottom: '8px', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', fontWeight: '500' }}>Silakan pilih salah satu supplier di peta untuk melihat profil logistik.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (min-width: 640px) {
          .map-grid {
            grid-template-columns: 3fr 2fr;
          }
        }
      `}</style>
    </div>
  );
}
