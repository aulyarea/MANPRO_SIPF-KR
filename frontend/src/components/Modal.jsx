import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent body scrolling when modal is open
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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(45, 41, 40, 0.5)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Modal Dialog Card */}
      <div 
        className="animate-scale"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #F0EAE8',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(45, 41, 40, 0.15)',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #F0EAE8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D2928', fontFamily: 'Poppins' }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FAF8F7',
              color: '#8F8785'
            }}
            className="modal-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
      <style>{`
        .modal-close-btn:hover {
          background-color: var(--secondary-light);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}
