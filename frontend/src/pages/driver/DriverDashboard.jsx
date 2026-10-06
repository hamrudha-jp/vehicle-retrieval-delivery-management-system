import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverService } from '../../services/driverService';
import { requestService } from '../../services/requestService';
import { reviewService } from '../../services/reviewService';
import { StatusBadge } from '../../components/StatusBadge';
import { OtpCard } from '../../components/OtpCard';
import { InspectionModal } from '../../components/InspectionModal';
import { TripProgressTracker } from '../../components/TripProgressTracker';
import { Truck, MapPin, ShieldCheck, CheckCircle2, Play, Navigation, AlertCircle, FileText, MapPinCheck, Star } from 'lucide-react';

export const DriverDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [driverReviewsData, setDriverReviewsData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeInspection, setActiveInspection] = useState(null); // { requestId, type }
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDriverDashboard();
  }, []);

  const fetchDriverDashboard = async () => {
    setLoading(true);
    try {
      const profRes = await driverService.getMyProfile().catch(() => null);
      if (profRes && profRes.success) {
        setProfile(profRes.data);
        if (profRes.data?.user?.id) {
          reviewService.getDriverReviews(profRes.data.user.id)
            .then(res => { if (res.success) setDriverReviewsData(res.data); })
            .catch(() => null);
        }
      }

      const reqRes = await requestService.getAllRequests().catch(() => null);
      if (reqRes && reqRes.success) setAllRequests(reqRes.data || []);
    } catch (err) {
      console.error("Fetch driver dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, nextStatus) => {
    setUpdatingId(requestId);
    setError('');
    try {
      const res = await requestService.updateStatus(requestId, nextStatus);
      if (res.success) {
        fetchDriverDashboard();
      }
    } catch (err) {
      setError(err.message || 'Failed to update request status');
    } finally {
      setUpdatingId(null);
    }
  };

  const myAssignedRequests = allRequests.filter(r => r.assignedDriver?.id === profile?.user?.id);
  const activeTrips = myAssignedRequests.filter(r => r.status !== 'DELIVERED' && r.status !== 'CANCELLED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Driver Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage active trips, verify handover OTPs, perform inspections, and complete deliveries
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/driver/profile-setup" className="btn btn-secondary">
            <ShieldCheck size={18} /> Profile Verification Status
          </Link>
          <Link to="/driver/available-requests" className="btn btn-primary">
            <Navigation size={18} /> Browse Open Jobs
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid-cols-3">
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#60a5fa' }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>VERIFICATION STATUS</div>
            <div style={{ marginTop: '0.2rem' }}>
              <StatusBadge status={profile?.verificationStatus || 'NOT_SUBMITTED'} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#fbbf24' }}>
            <Truck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE TRIPS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{activeTrips.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#34d399' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>COMPLETED TRIPS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
              {myAssignedRequests.filter(r => r.status === 'DELIVERED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip Handover Controls */}
      {activeTrips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>Active Handover & Trip Controls</h3>
          {activeTrips.map(req => (
            <div key={req.id} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.registrationNumber})
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Owner: {req.owner?.name} ({req.owner?.phone})
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Progress Stepper */}
              <TripProgressTracker currentStatus={req.status} />

              {/* Step 1: Enter Pickup OTP */}
              {['ACCEPTED', 'PICKUP_OTP_PENDING'].includes(req.status) && (
                <OtpCard
                  requestId={req.id}
                  otpType="PICKUP"
                  isOwner={false}
                  onVerified={fetchDriverDashboard}
                />
              )}

              {/* Step 2: Pre-Trip Inspection */}
              {req.status === 'PICKUP_VERIFIED' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                  <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={18} /> Step 2: Submit Pre-Trip Inspection Record
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    Pickup OTP verified! You must log starting odometer reading, fuel level, and condition photos before starting the trip.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveInspection({ requestId: req.id, type: 'PRE_TRIP' })}
                  >
                    <FileText size={16} /> Record Pre-Trip Inspection
                  </button>
                </div>
              )}

              {/* Step 3: Start Trip */}
              {req.status === 'INSPECTION_PENDING' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                  <h4 style={{ color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={18} /> Pickup OTP & Pre-Inspection Complete
                  </h4>
                  <button
                    className="btn btn-success"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                    onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                    disabled={updatingId === req.id}
                  >
                    <Play size={18} /> Start Transit (Set IN_PROGRESS)
                  </button>
                </div>
              )}

              {/* Step 4: In Progress -> Mark Destination Reached */}
              {req.status === 'IN_PROGRESS' && (
                <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                  <h4 style={{ color: '#22d3ee', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={18} /> Vehicle In Transit
                  </h4>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => handleUpdateStatus(req.id, 'DESTINATION_REACHED')}
                    disabled={updatingId === req.id}
                  >
                    <MapPinCheck size={18} /> Mark Arrived at Destination
                  </button>
                </div>
              )}

              {/* Step 5: Delivery OTP Verification */}
              {['DESTINATION_REACHED', 'DELIVERY_OTP_PENDING'].includes(req.status) && (
                <OtpCard
                  requestId={req.id}
                  otpType="DELIVERY"
                  isOwner={false}
                  onVerified={fetchDriverDashboard}
                />
              )}

              {/* Step 6: Post-Trip Inspection */}
              {req.status === 'DELIVERY_VERIFIED' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0' }}>
                  <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={18} /> Step 6: Submit Post-Trip Inspection Record
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    Delivery OTP verified! Please log final odometer reading, fuel level, and condition notes.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveInspection({ requestId: req.id, type: 'POST_TRIP' })}
                  >
                    <FileText size={16} /> Record Post-Trip Inspection
                  </button>
                </div>
              )}

              {/* Step 7: Waiting for Owner Confirmation */}
              {req.status === 'POST_INSPECTION_PENDING' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '0.75rem 0', color: '#fbbf24', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} /> Post-Trip Inspection Submitted — Waiting for vehicle owner to confirm final delivery on their dashboard.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assigned Trips History Table */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={20} color="#3b82f6" /> My Assigned Retrieval Trips History
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading assigned trips...</div>
        ) : myAssignedRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ color: '#64748b', marginBottom: '1rem' }}>No trips currently assigned to you.</div>
            <Link to="/driver/available-requests" className="btn btn-primary">
              <Navigation size={18} /> View Available Jobs
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Owner</th>
                  <th>Pickup Address</th>
                  <th>Destination Address</th>
                  <th>Distance & Duration</th>
                  <th>Estimated Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAssignedRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.vehicle?.make} {req.vehicle?.model}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.vehicle?.registrationNumber}</div>
                    </td>
                    <td>
                      <div>{req.owner?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.owner?.phone}</div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{req.pickupAddress}</div>
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{req.destinationAddress}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.estimatedDistanceKm ? `${req.estimatedDistanceKm} km` : 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.estimatedDurationMinutes ? `${req.estimatedDurationMinutes} mins` : 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#34d399' }}>
                        {req.estimatedCost ? `₹${req.estimatedCost.toFixed(2)}` : 'N/A'}
                      </div>
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

      {/* Driver Ratings & Feedback Section */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} color="#fbbf24" fill="#fbbf24" /> My Rating & Owner Feedback Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', color: '#fbbf24', fontWeight: 700 }}>
            <span>Average Rating: {driverReviewsData.averageRating} / 5.0</span>
            <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.8rem' }}>({driverReviewsData.totalReviews} reviews)</span>
          </div>
        </div>

        {driverReviewsData.reviews.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '1.5rem', textAlign: 'center' }}>
            No customer reviews received yet. Complete retrieval trips to earn owner ratings!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {driverReviewsData.reviews.map(rev => (
              <div key={rev.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Owner: {rev.ownerName}</span>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= rev.rating ? '#fbbf24' : 'none'} color={s <= rev.rating ? '#fbbf24' : '#64748b'} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  "{rev.comment || 'No written comment'}"
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Trip #{rev.requestId} • {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Modal Render */}
      {activeInspection && (
        <InspectionModal
          requestId={activeInspection.requestId}
          inspectionType={activeInspection.type}
          onClose={() => setActiveInspection(null)}
          onSuccess={fetchDriverDashboard}
        />
      )}
    </div>
  );
};
