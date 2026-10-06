import React from 'react';

export const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem 1rem', textAlign: 'center', marginTop: 'auto', background: 'rgba(11, 15, 25, 0.9)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', fontSize: '0.85rem', color: '#64748b' }}>
        Vehicle Retrieval and Delivery Management System (VRDMS) &copy; {new Date().getFullYear()} — Undergraduate Engineering Project
      </div>
    </footer>
  );
};
