import React, { useState, useEffect } from 'react';
import { driverService } from '../../services/driverService';
import { StatusBadge } from '../../components/StatusBadge';
import { FileCheck, Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const DriverProfileSetup = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ licenseNumber: '', experienceYears: 2 });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await driverService.getMyProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFormData({
          licenseNumber: res.data.licenseNumber || '',
          experienceYears: res.data.experienceYears || 2
        });
      }
    } catch (err) {
      // Profile not created yet
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await driverService.submitProfile(formData);
      if (res.success) {
        setMessage('Driver profile submitted successfully! Waiting for Admin verification.');
        setProfile(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit driver profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <div className="glass-panel">
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={24} color="#3b82f6" /> Driver Licence Verification Profile
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Submit driving credentials for administrative review to accept retrieval trips
          </p>
        </div>

        {/* Current Verification Banner */}
        {profile && (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>VERIFICATION STATUS</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <StatusBadge status={profile.verificationStatus} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Licence Number</div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{profile.licenseNumber}</div>
              </div>
            </div>

            {profile.verificationStatus === 'APPROVED' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> Verified Driver Account — You can now browse and accept retrieval requests!
              </div>
            )}

            {profile.verificationStatus === 'PENDING' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} /> Application Under Admin Review — You will be notified once approved.
              </div>
            )}

            {profile.verificationStatus === 'REJECTED' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#f87171' }}>
                <strong>Rejection Reason:</strong> {profile.rejectionReason || 'Licence documents could not be verified.'}
              </div>
            )}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} /> {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Driving Licence Number <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              name="licenseNumber"
              className="form-control"
              placeholder="e.g. DL-1420110012345"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Driving Experience (Years) <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="number"
              name="experienceYears"
              className="form-control"
              min="1"
              max="50"
              value={formData.experienceYears}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            disabled={submitting}
          >
            {submitting ? 'Submitting Credentials...' : profile ? 'Update Driver Profile' : 'Submit Credentials for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
};
