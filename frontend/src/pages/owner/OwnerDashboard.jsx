import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { vehicleService } from '../../services/vehicleService';
import { inspectionService } from '../../services/inspectionService';
import { StatusBadge } from '../../components/StatusBadge';
import { OtpCard } from '../../components/OtpCard';
import { PaymentReviewCard } from '../../components/PaymentReviewCard';
import { TripProgressTracker } from '../../components/TripProgressTracker';
import { Car, PlusCircle, Clock, MapPin, CheckCircle, Navigation, FileText, CheckCircle2 } from 'lucide-react';

export const OwnerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [inspectionsMap, setInspectionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, vehRes] = await Promise.all([
        requestService.getMyRequests(),
        vehicleService.getMyVehicles()
      ]);

      if (reqRes.success && reqRes.data) {
        setRequests(reqRes.data);

        // Fetch inspections for requests
        const map = {};
        for (const req of reqRes.data) {
          if (['POST_INSPECTION_PENDING', 'DELIVERED', 'INSPECTION_PENDING'].includes(req.status)) {
            try {
              const inspRes = await inspectionService.getInspections(req.id);
              if (inspRes.success) {
                map[req.id] = inspRes.data || [];
              }
            } catch (e) {
              console.error("Fetch inspection error:", e);
            }
          }
        }
        setInspectionsMap(map);
      }

      if (vehRes.success) setVehicles(vehRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (requestId) => {
    setConfirmingId(requestId);
    try {
      const res = await requestService.updateStatus(requestId, 'DELIVERED');
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm delivery');
    } finally {
      setConfirmingId(null);
    }
  };

  const activeRequests = requests.filter(r => r.status !== 'DELIVERED' && r.status !== 'CANCELLED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage vehicles, track live retrieval progress, verify OTPs, and confirm deliveries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/owner/vehicles" className="btn btn-secondary">
            <Car size={18} /> Manage Vehicles ({vehicles.length})
          </Link>
          <Link to="/owner/create-request" className="btn btn-primary">
            <PlusCircle size={18} /> Create Retrieval Request
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-3">
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#60a5fa' }}>
            <Car size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>REGISTERED VEHICLES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{vehicles.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#fbbf24' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE RETRIEVALS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{activeRequests.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#34d399' }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>COMPLETED DELIVERIES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {requests.filter(r => r.status === 'DELIVERED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Active Handover Cards */}
      {activeRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>Active Vehicle Handover Action Cards</h3>
          {activeRequests.map(req => {
            const inspections = inspectionsMap[req.id] || [];
            const postInspection = inspections.find(i => i.inspectionType === 'POST_TRIP');

            return (
              <div key={req.id} className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.registrationNumber})
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Assigned Driver: {req.assignedDriver ? `${req.assignedDriver.name} (${req.assignedDriver.phone})` : 'Searching for driver...'}
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                {/* Progress Stepper */}
                <TripProgressTracker currentStatus={req.status} />

                {/* Pickup OTP View for Owner */}
                {['ACCEPTED', 'PICKUP_OTP_PENDING'].includes(req.status) && (
                  <OtpCard
                    requestId={req.id}
                    otpType="PICKUP"
                    isOwner={true}
                    onGenerated={fetchDashboardData}
                  />
                )}

                {/* Delivery OTP View for Owner */}
                {['IN_PROGRESS', 'DESTINATION_REACHED', 'DELIVERY_OTP_PENDING'].includes(req.status) && (
                  <OtpCard
                    requestId={req.id}
                    otpType="DELIVERY"
                    isOwner={true}
                    onGenerated={fetchDashboardData}
                  />
                )}

                {/* Owner Delivery Confirmation View */}
                {req.status === 'POST_INSPECTION_PENDING' && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '0.75rem' }}>
                    <h4 style={{ color: '#34d399', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={20} /> Final Vehicle Inspection Complete — Please Confirm Delivery
                    </h4>
                    {postInspection && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', margin: '0.75rem 0', color: '#f8fafc', background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                        <div><strong>Final Odometer:</strong> {postInspection.odometerReading} km</div>
                        <div><strong>Final Fuel Level:</strong> {postInspection.fuelLevel}</div>
                        <div><strong>Notes:</strong> {postInspection.conditionNotes || 'None'}</div>
                      </div>
                    )}
                    <button
                      className="btn btn-success"
                      style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                      onClick={() => handleConfirmDelivery(req.id)}
                      disabled={confirmingId === req.id}
                    >
                      {confirmingId === req.id ? 'Confirming Delivery...' : 'Confirm Delivery & Complete Request'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed & Delivered Requests: Payment & Rating Section */}
      {requests.filter(r => r.status === 'DELIVERED').length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} /> Completed Deliveries — Payment & Driver Feedback
          </h3>
          {requests.filter(r => r.status === 'DELIVERED').map(req => (
            <div key={req.id} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.registrationNumber})
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Assigned Driver: <strong>{req.assignedDriver?.name || 'Assigned Driver'}</strong> ({req.assignedDriver?.phone})
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <PaymentReviewCard request={req} onUpdated={fetchDashboardData} />
            </div>
          ))}
        </div>
      )}

      {/* Requests Table Panel */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Navigation size={20} color="#3b82f6" /> Retrieval Requests History
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div style={{ color: '#64748b', marginBottom: '1rem' }}>No retrieval requests submitted yet.</div>
            <Link to="/owner/create-request" className="btn btn-primary">
              <PlusCircle size={18} /> Request Vehicle Retrieval Now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Pickup Address</th>
                  <th>Destination Address</th>
                  <th>Est. Distance & Cost</th>
                  <th>Scheduled Pickup</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.vehicle?.make} {req.vehicle?.model}</div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{req.vehicle?.registrationNumber}</div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                        <MapPin size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ fontSize: '0.85rem' }}>{req.pickupAddress}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                        <MapPin size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ fontSize: '0.85rem' }}>{req.destinationAddress}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#34d399' }}>₹{req.estimatedCost || 350}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.estimatedDistanceKm || 15} km • {req.estimatedDurationMinutes || 35}m</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {new Date(req.scheduledPickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>
                      {req.assignedDriver ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{req.assignedDriver.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.assignedDriver.phone}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748b', italic: 'true' }}>Searching driver...</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
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
