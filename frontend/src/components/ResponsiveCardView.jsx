import React from 'react';

export default function ResponsiveCardView({ headers, data, renderRow, renderCard, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #F0EAE8' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #FADCD6', borderTop: '3px solid #ffb692', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
        <span style={{ fontSize: '13px', color: '#8F8785' }}>Memuat data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #F0EAE8' }}>
        <p style={{ fontSize: '14px', color: '#8F8785', fontWeight: '500' }}>Tidak ada data tersedia.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="desktop-table-view table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => renderRow(item, idx))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="mobile-card-grid-view">
        {data.map((item, idx) => (
          <div key={idx} className="mobile-card-wrapper animate-fade">
            {renderCard(item, idx)}
          </div>
        ))}
      </div>

      <style>{`
        /* Desktop: Show table, hide cards */
        .desktop-table-view {
          display: block;
        }
        .mobile-card-grid-view {
          display: none;
        }

        /* Mobile: Hide table, show card grid */
        @media (max-width: 768px) {
          .desktop-table-view {
            display: none;
          }
          .mobile-card-grid-view {
            display: grid;
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .mobile-card-wrapper {
            background-color: #FFFFFF;
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 16px;
            box-shadow: var(--shadow-sm);
          }
        }
      `}</style>
    </div>
  );
}
