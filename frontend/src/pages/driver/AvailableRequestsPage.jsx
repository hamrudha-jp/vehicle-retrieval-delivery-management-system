import React, { useState, useEffect } from 'react';
import { requestService } from '../../services/requestService';
import { driverService } from '../../services/driverService';
import { StatusBadge } from '../../components/StatusBadge';
import { Navigation, MapPin, Calendar, Car, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AvailableRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profRes, reqRes] = await Promise.all([
        driverService.getMyProfile().catch(() => null),
        requestService.getAvailableRequests().catch(err => {
          setError(err.message);
          return { success: false, data: [] };
        })
      ]);

      if (profRes && profRes.success) setProfile(profRes.data);
      if (reqRes && reqRes.success) setRequests(reqRes.data || []);
    } catch (err) {
      setError(err.message || 'Error loading available requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setAcceptingId(requestId);
    setError('');
    setSuccess('');

    try {
      const res = await requestService.acceptRequest(requestId);
      if (res.success) {
        setSuccess('Retrieval request accepted successfully! Managed trip added to your dashboard.');
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept request.');
    } finally {
      setAcceptingId(null);
    }
  };

  const isApproved = profile && profile.verificationStatus === 'APPROVED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Available Retrieval Requests</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Browse open vehicle pickup and delivery jobs ready for retrieval
        </p>
      </div>

      {!isApproved && !loading && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} />
            <div>
              <strong>Profile Verification Required:</strong> Your driver profile is currently {profile ? profile.verificationStatus : 'NOT SUBMITTED'}. Only verified drivers can accept trips.
            </div>
          </div>
          <Link to="/driver/profile-setup" className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
            Complete Setup
          </Link>
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading open requests...</div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Navigation size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Open Retrieval Requests</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Check back later for new retrieval jobs posted by vehicle owners.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {requests.map(req => (
            <div key={req.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      {req.vehicle?.make} {req.vehicle?.model}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Owner: {req.owner?.name} ({req.owner?.phone})
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Location Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DYNAMIC PICKUP</div>
                      <div style={{ fontSize: '0.875rem', color: '#f8fafc' }}>{req.pickupAddress}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>DYNAMIC DESTINATION</div>
                      <div style={{ fontSize: '0.875rem', color: '#f8fafc' }}>{req.destinationAddress}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>DISTANCE</span>
                    <strong style={{ color: '#f8fafc' }}>{req.estimatedDistanceKm ? `${req.estimatedDistanceKm} km` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>EST. DURATION</span>
                    <strong style={{ color: '#f8fafc' }}>{req.estimatedDurationMinutes ? `${req.estimatedDurationMinutes} mins` : 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>EST. COST</span>
                    <strong style={{ color: '#34d399' }}>{req.estimatedCost ? `₹${req.estimatedCost.toFixed(2)}` : 'N/A'}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <Calendar size={15} color="#3b82f6" /> Scheduled: {new Date(req.scheduledPickupTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleAccept(req.id)}
                disabled={!isApproved || acceptingId === req.id}
              >
                {acceptingId === req.id ? 'Accepting Request...' : 'Accept Retrieval Job'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
