import React, { useState, useEffect } from 'react';
import { otpService } from '../services/otpService';
import { Key, CheckCircle, AlertCircle, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

export const OtpCard = ({ requestId, otpType, isOwner, onVerified, onGenerated }) => {
  const [otpData, setOtpData] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOwner) {
      fetchOwnerOtp();
    }
  }, [requestId, otpType, isOwner]);

  const fetchOwnerOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await otpService.getOwnerOtp(requestId, otpType);
      if (res.success && res.data) {
        setOtpData(res.data);
      }
    } catch (err) {
      // If OTP not generated yet, attempt to generate
      generateOtp();
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await otpService.generateOtp(requestId, otpType);
      if (res.success && res.data) {
        setOtpData(res.data);
        if (onGenerated) onGenerated();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (inputCode.length !== 6) {
      setError('Please enter a 6-digit OTP code');
      return;
    }

    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      const res = await otpService.verifyOtp(requestId, {
        otpCode: inputCode.trim(),
        otpType
      });
      if (res.success) {
        setSuccess(`${otpType} OTP verified successfully!`);
        if (onVerified) onVerified();
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ background: 'rgba(30, 41, 69, 0.7)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', margin: '0.75rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Key size={20} color="#3b82f6" />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
          {otpType === 'PICKUP' ? 'Vehicle Pickup Verification OTP' : 'Vehicle Delivery Confirmation OTP'}
        </h4>
      </div>

      {isOwner ? (
        /* Owner View: Displays OTP code for vehicle owner */
        <div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Provide this secure 6-digit OTP to the driver at the time of {otpType.toLowerCase()}:
          </p>

          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Fetching OTP code...</div>
          ) : otpData ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                YOUR {otpType} OTP CODE
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.3em', color: '#38bdf8', margin: '0.3rem 0', fontFamily: 'monospace' }}>
                {otpData.otpCode}
              </div>
              <div style={{ fontSize: '0.75rem', color: otpData.isVerified ? '#34d399' : '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                {otpData.isVerified ? (
                  <><CheckCircle size={14} /> OTP Verified by Driver</>
                ) : (
                  <><Lock size={14} /> Valid for 15 minutes</>
                )}
              </div>
            </div>
          ) : (
            <button onClick={generateOtp} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <RefreshCw size={16} /> Generate {otpType} OTP
            </button>
          )}
        </div>
      ) : (
        /* Driver View: Form to enter OTP code */
        <div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Enter the 6-digit OTP code provided by the vehicle owner to verify {otpType.toLowerCase()}:
          </p>

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> {success}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              style={{ letterSpacing: '0.2em', fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', maxWidth: '180px' }}
              placeholder="000000"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={verifying || inputCode.length !== 6}
            >
              {verifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
