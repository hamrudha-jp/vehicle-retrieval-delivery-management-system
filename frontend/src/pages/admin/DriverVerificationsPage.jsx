import React, { useState, useEffect } from 'react';
import { driverService } from '../../services/driverService';
import { StatusBadge } from '../../components/StatusBadge';
import { Shield, CheckCircle, XCircle, AlertCircle, UserCheck } from 'lucide-react';

export const DriverVerificationsPage = () => {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [rejectionReasonMap, setRejectionReasonMap] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const res = await driverService.getPendingVerifications();
      if (res.success) {
        setPendingDrivers(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch pending driver approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (profileId, status) => {
    setVerifyingId(profileId);
    setError('');
    setMessage('');

    const reason = rejectionReasonMap[profileId] || '';

    try {
      const payload = {
        status,
        rejectionReason: status === 'REJECTED' ? reason : null
      };

      const res = await driverService.verifyDriver(profileId, payload);
      if (res.success) {
        setMessage(`Driver profile successfully updated to ${status}`);
        fetchPendingVerifications();
      }
    } catch (err) {
      setError(err.message || 'Verification update failed.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Driver Verification Console</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Review driving licence credentials and approve or reject driver accounts
        </p>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={20} color="#3b82f6" /> Pending Verification Applications ({pendingDrivers.length})
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading driver applications...</div>
        ) : pendingDrivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CheckCircle size={48} color="#34d399" style={{ margin: '0 auto 1rem auto' }} />
            <h3>All Drivers Verified</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              There are currently no pending driver licence verification requests.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Contact Info</th>
                  <th>Licence Number</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions & Notes</th>
                </tr>
              </thead>
              <tbody>
                {pendingDrivers.map(drv => (
                  <tr key={drv.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{drv.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Registered: {new Date(drv.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div>{drv.user?.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{drv.user?.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc' }}>{drv.licenseNumber}</span>
                    </td>
                    <td>{drv.experienceYears} Years</td>
                    <td>
                      <StatusBadge status={drv.verificationStatus} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleVerify(drv.id, 'APPROVED')}
                            disabled={verifyingId === drv.id}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => handleVerify(drv.id, 'REJECTED')}
                            disabled={verifyingId === drv.id}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem' }}
                          placeholder="Rejection reason (optional)"
                          value={rejectionReasonMap[drv.id] || ''}
                          onChange={(e) => setRejectionReasonMap({ ...rejectionReasonMap, [drv.id]: e.target.value })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
