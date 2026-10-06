import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { requestService } from '../../services/requestService';
import { LocationPickerInput } from '../../components/LocationPickerInput';
import { InteractiveMap } from '../../components/InteractiveMap';
import { Navigation, Car, Calendar, FileText, AlertCircle, PlusCircle, ArrowLeft, DollarSign, Clock, MapPin, Calculator } from 'lucide-react';

export const CreateRequestPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [costEstimate, setCostEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    pickupLocation: { address: '', latitude: null, longitude: null },
    destinationLocation: { address: '', latitude: null, longitude: null },
    scheduledPickupTime: '',
    specialInstructions: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Real-time cost & distance calculation trigger
  useEffect(() => {
    if (formData.vehicleId && (formData.pickupLocation.address || formData.destinationLocation.address)) {
      fetchEstimate();
    }
  }, [formData.vehicleId, formData.pickupLocation, formData.destinationLocation]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getMyVehicles();
      if (res.success && res.data.length > 0) {
        setVehicles(res.data);
        setFormData(prev => ({ ...prev, vehicleId: res.data[0].id }));
      }
    } catch (err) {
      console.error("Fetch vehicles error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstimate = async () => {
    setEstimating(true);
    try {
      const payload = {
        vehicleId: Number(formData.vehicleId),
        pickupLatitude: formData.pickupLocation.latitude,
        pickupLongitude: formData.pickupLocation.longitude,
        destinationLatitude: formData.destinationLocation.latitude,
        destinationLongitude: formData.destinationLocation.longitude
      };
      const res = await requestService.estimateCost(payload);
      if (res.success) {
        setCostEstimate(res.data);
      }
    } catch (err) {
      console.error("Estimate cost error:", err);
    } finally {
      setEstimating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vehicleId) {
      setError('Please select a registered vehicle');
      return;
    }
    if (!formData.pickupLocation.address) {
      setError('Please enter or select a pickup location');
      return;
    }
    if (!formData.destinationLocation.address) {
      setError('Please enter or select a destination location');
      return;
    }
    if (!formData.scheduledPickupTime) {
      setError('Please select a scheduled pickup date & time');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: Number(formData.vehicleId),
        pickupAddress: formData.pickupLocation.address,
        pickupLatitude: formData.pickupLocation.latitude,
        pickupLongitude: formData.pickupLocation.longitude,
        destinationAddress: formData.destinationLocation.address,
        destinationLatitude: formData.destinationLocation.latitude,
        destinationLongitude: formData.destinationLocation.longitude,
        scheduledPickupTime: formData.scheduledPickupTime,
        specialInstructions: formData.specialInstructions
      };

      const res = await requestService.createRequest(payload);
      if (res.success) {
        navigate('/owner/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit retrieval request.');
    } finally {
      setSubmitting(false);
    }
  };

  const pickupCoord = {
    lat: formData.pickupLocation.latitude,
    lng: formData.pickupLocation.longitude,
    address: formData.pickupLocation.address
  };

  const destCoord = {
    lat: formData.destinationLocation.latitude,
    lng: formData.destinationLocation.longitude,
    address: formData.destinationLocation.address
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <Link to="/owner/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', marginBottom: '1rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-panel">
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Navigation size={24} color="#3b82f6" /> Create Retrieval & Delivery Request
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Interactive route calculation, distance, and transparent cost estimation
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Car size={40} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
            <h4>No registered vehicles found</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 1rem 0' }}>
              You must register at least one vehicle before creating a retrieval request.
            </p>
            <Link to="/owner/vehicles" className="btn btn-primary">
              <PlusCircle size={18} /> Register Vehicle Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Select Vehicle */}
            <div className="form-group">
              <label className="form-label">Select Vehicle <span style={{ color: '#ef4444' }}>*</span></label>
              <select name="vehicleId" className="form-control" value={formData.vehicleId} onChange={handleChange} required>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} — {v.registrationNumber} ({v.color}, {v.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Pickup Location */}
            <LocationPickerInput
              label="Pickup Location (Dynamic)"
              placeholder="Type pickup address or select from dynamic suggestions..."
              value={formData.pickupLocation}
              onChange={(val) => setFormData({ ...formData, pickupLocation: val })}
              required
            />

            {/* Dynamic Destination Location */}
            <LocationPickerInput
              label="Destination Location (Dynamic)"
              placeholder="Type destination address or select from dynamic suggestions..."
              value={formData.destinationLocation}
              onChange={(val) => setFormData({ ...formData, destinationLocation: val })}
              required
            />

            {/* Interactive Leaflet Route Map */}
            <div style={{ margin: '1.25rem 0' }}>
              <label className="form-label">Interactive Route Map</label>
              <InteractiveMap pickup={pickupCoord} destination={destCoord} height="300px" />
            </div>

            {/* Real-time Distance & Transparent Cost Estimation Card */}
            {costEstimate && (
              <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#60a5fa' }}>
                  <Calculator size={20} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Transparent Route & Pricing Estimate</h4>
                </div>

                <div className="grid-cols-3" style={{ gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ background: 'rgba(30, 41, 69, 0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CALCULATED DISTANCE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{costEstimate.distanceKm} km</div>
                  </div>
                  <div style={{ background: 'rgba(30, 41, 69, 0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ESTIMATED DURATION</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>{costEstimate.durationMinutes} mins</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>ESTIMATED TOTAL COST</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>₹{costEstimate.totalEstimatedCost}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.775rem', color: '#94a3b8', display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                  <span>Base Service Fee: <strong>₹{costEstimate.baseFee}</strong></span>
                  <span>Distance Charge (₹18/km): <strong>₹{costEstimate.distanceCharge}</strong></span>
                  <span>Vehicle Multiplier: <strong>{costEstimate.vehicleMultiplier}x</strong></span>
                </div>
              </div>
            )}

            {/* Scheduled Pickup Date/Time */}
            <div className="form-group">
              <label className="form-label">Scheduled Pickup Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="datetime-local"
                  name="scheduledPickupTime"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.scheduledPickupTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="form-group">
              <label className="form-label">Special Instructions / Notes (Optional)</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
                <textarea
                  name="specialInstructions"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', minHeight: '80px' }}
                  placeholder="e.g., Gate entry code, key handover contact info, parking slot number..."
                  value={formData.specialInstructions}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/owner/dashboard" className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                {submitting ? 'Submitting Request...' : `Submit Request (${costEstimate ? `₹${costEstimate.totalEstimatedCost}` : 'Confirm'})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
