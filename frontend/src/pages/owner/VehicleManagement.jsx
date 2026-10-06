import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/vehicleService';
import { Car, Plus, Trash2, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    registrationNumber: '',
    vehicleYear: new Date().getFullYear(),
    color: '',
    vehicleType: 'SEDAN'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getMyVehicles();
      if (res.success) setVehicles(res.data || []);
    } catch (err) {
      console.error("Fetch vehicles error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await vehicleService.addVehicle(formData);
      if (res.success) {
        setSuccess('Vehicle registered successfully!');
        setShowModal(false);
        setFormData({
          make: '',
          model: '',
          registrationNumber: '',
          vehicleYear: new Date().getFullYear(),
          color: '',
          vehicleType: 'SEDAN'
        });
        fetchVehicles();
      }
    } catch (err) {
      setError(err.message || 'Failed to add vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      const res = await vehicleService.deleteVehicle(id);
      if (res.success) {
        fetchVehicles();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Vehicle Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Register your personal vehicles for retrieval and delivery services
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Register New Vehicle
        </button>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Car size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Vehicles Registered</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
            You haven't registered any vehicles yet. Add a vehicle to request retrieval services.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Register Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid-cols-3">
          {vehicles.map(v => (
            <div key={v.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{v.make} {v.model}</h3>
                    <span className="badge badge-in_progress" style={{ marginTop: '0.25rem' }}>{v.vehicleType}</span>
                  </div>
                  <button onClick={() => handleDelete(v.id)} className="btn btn-danger" style={{ padding: '0.35rem 0.6rem' }} title="Delete Vehicle">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: '#94a3b8', marginTop: '1rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div><strong>Reg Number:</strong> <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{v.registrationNumber}</span></div>
                  <div><strong>Year:</strong> {v.vehicleYear}</div>
                  <div><strong>Color:</strong> {v.color}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', background: '#172036', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Register New Vehicle</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleAddVehicle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Make (Brand)</label>
                  <input type="text" name="make" className="form-control" placeholder="Toyota, Honda" value={formData.make} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input type="text" name="model" className="form-control" placeholder="Camry, Civic" value={formData.model} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input type="text" name="registrationNumber" className="form-control" placeholder="e.g. TN-01-AB-1234" value={formData.registrationNumber} onChange={handleChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Manufacturing Year</label>
                  <input type="number" name="vehicleYear" className="form-control" min="1990" max="2030" value={formData.vehicleYear} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input type="text" name="color" className="form-control" placeholder="Black, Silver" value={formData.color} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select name="vehicleType" className="form-control" value={formData.vehicleType} onChange={handleChange} required>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="BIKE">Motorcycle / Bike</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
