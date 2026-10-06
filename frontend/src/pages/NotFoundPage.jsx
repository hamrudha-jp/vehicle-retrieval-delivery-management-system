import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <AlertTriangle size={56} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>404 — Page Not Found</h1>
        <p style={{ color: '#94a3b8', margin: '0.75rem 0 1.5rem 0' }}>
          The requested VRDMS route does not exist or you do not have permission to view it.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} /> Return to Home
        </Link>
      </div>
    </div>
  );
};
