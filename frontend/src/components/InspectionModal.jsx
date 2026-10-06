import React, { useState } from 'react';
import { inspectionService } from '../services/inspectionService';
import { FileText, Camera, Gauge, Fuel, CheckCircle, AlertCircle, X } from 'lucide-react';

export const InspectionModal = ({ requestId, inspectionType, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    odometerReading: '',
    fuelLevel: '75%',
    conditionNotes: '',
    photoUrls: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrls: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.odometerReading || isNaN(formData.odometerReading)) {
      setError('Please enter a valid odometer reading');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        inspectionType,
        odometerReading: Number(formData.odometerReading),
        fuelLevel: formData.fuelLevel,
        conditionNotes: formData.conditionNotes,
        photoUrls: formData.photoUrls || 'photo_record_saved.jpg'
      };

      const res = await inspectionService.submitInspection(requestId, payload);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit vehicle inspection record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', background: '#172036', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#3b82f6" /> {inspectionType === 'PRE_TRIP' ? 'Pre-Trip Vehicle Inspection' : 'Post-Trip Vehicle Inspection'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Odometer Reading */}
          <div className="form-group">
            <label className="form-label">Odometer Reading (km) <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Gauge size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="number"
                name="odometerReading"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. 45200"
                value={formData.odometerReading}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Fuel Level */}
          <div className="form-group">
            <label className="form-label">Fuel Level <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Fuel size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select
                name="fuelLevel"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.fuelLevel}
                onChange={handleChange}
                required
              >
                <option value="Reserve / Low">Reserve / Low (&lt; 25%)</option>
                <option value="25% Tank">25% Tank</option>
                <option value="50% Half Tank">50% Half Tank</option>
                <option value="75% Tank">75% Tank</option>
                <option value="100% Full Tank">100% Full Tank</option>
              </select>
            </div>
          </div>

          {/* Condition Notes */}
          <div className="form-group">
            <label className="form-label">Vehicle Condition & Damage Notes</label>
            <textarea
              name="conditionNotes"
              className="form-control"
              style={{ minHeight: '80px' }}
              placeholder="Record any pre-existing scratches, dent marks, tire condition, or interior notes..."
              value={formData.conditionNotes}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Vehicle Condition Photo</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ fontSize: '0.85rem', color: '#94a3b8' }}
              />
              <Camera size={20} color="#3b82f6" />
            </div>
            {formData.photoUrls && formData.photoUrls.startsWith('data:image') && (
              <div style={{ marginTop: '0.5rem' }}>
                <img src={formData.photoUrls} alt="Preview" style={{ height: '60px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Submitting Record...' : 'Submit Inspection Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
