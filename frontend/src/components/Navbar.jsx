import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User, Menu, X, Shield, Truck, Compass } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.85rem 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
            <Car size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
              VRDMS
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
              RETRIEVAL & DELIVERY
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isAuthenticated ? (
            <>
              {user?.role === 'OWNER' && (
                <>
                  <Link to="/owner/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <Compass size={16} /> Dashboard
                  </Link>
                  <Link to="/owner/vehicles" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <Car size={16} /> My Vehicles
                  </Link>
                  <Link to="/owner/create-request" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                    + New Request
                  </Link>
                </>
              )}

              {user?.role === 'DRIVER' && (
                <>
                  <Link to="/driver/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <Truck size={16} /> Driver Portal
                  </Link>
                  <Link to="/driver/available-requests" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    Available Requests
                  </Link>
                  <Link to="/driver/profile-setup" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    Profile Verification
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    <Shield size={16} /> Admin Console
                  </Link>
                  <Link to="/admin/verifications" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                    Driver Approvals
                  </Link>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{user?.name}</div>
                  <span className="badge badge-in_progress" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {user?.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div style={{ display: 'none' }} className="mobile-toggle">
          <button className="btn btn-secondary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Role: {user?.role}</div>
              </div>
              {user?.role === 'OWNER' && (
                <>
                  <Link to="/owner/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/owner/vehicles" onClick={() => setMobileMenuOpen(false)}>My Vehicles</Link>
                  <Link to="/owner/create-request" onClick={() => setMobileMenuOpen(false)}>+ New Retrieval Request</Link>
                </>
              )}
              {user?.role === 'DRIVER' && (
                <>
                  <Link to="/driver/dashboard" onClick={() => setMobileMenuOpen(false)}>Driver Dashboard</Link>
                  <Link to="/driver/available-requests" onClick={() => setMobileMenuOpen(false)}>Available Requests</Link>
                  <Link to="/driver/profile-setup" onClick={() => setMobileMenuOpen(false)}>Profile Verification</Link>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
                  <Link to="/admin/verifications" onClick={() => setMobileMenuOpen(false)}>Driver Approvals</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={{ marginTop: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
      
      <style>{`
        @media (max-width: 868px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
