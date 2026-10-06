import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { driverService } from '../../services/driverService';
import { paymentService } from '../../services/paymentService';
import { reviewService } from '../../services/reviewService';
import { StatusBadge } from '../../components/StatusBadge';
import { Shield, Users, Truck, Compass, CheckCircle2, Clock, DollarSign, Star, CreditCard } from 'lucide-react';

export const AdminDashboard = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const [reqRes, drvRes, payRes, revRes] = await Promise.all([
        requestService.getAllRequests().catch(() => null),
        driverService.getPendingVerifications().catch(() => null),
        paymentService.getAllPayments().catch(() => null),
        reviewService.getAllReviews().catch(() => null)
      ]);

      if (reqRes && reqRes.success) setAllRequests(reqRes.data || []);
      if (drvRes && drvRes.success) setPendingDrivers(drvRes.data || []);
      if (payRes && payRes.success) setAllPayments(payRes.data || []);
      if (revRes && revRes.success) setAllReviews(revRes.data || []);
    } catch (err) {
      console.error("Fetch admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeTrips = allRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS');
  const paidPayments = allPayments.filter(p => p.paymentStatus === 'PAID');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Admin Console</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System overview, driver verification approvals, payment logs, and customer reviews
          </p>
        </div>
        <Link to="/admin/verifications" className="btn btn-primary">
          <Shield size={18} /> Driver Verifications ({pendingDrivers.length} Pending)
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid-cols-4">
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#60a5fa' }}>
            <Compass size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL REQUESTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{allRequests.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#fbbf24' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>PENDING DRIVERS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{pendingDrivers.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#22d3ee' }}>
            <Truck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ACTIVE TRIPS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{activeTrips.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '12px', color: '#34d399' }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>₹{totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* All Requests System Monitoring Table */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={20} color="#3b82f6" /> System-Wide Retrieval Requests
        </h3>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading all system requests...</div>
        ) : allRequests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No retrieval requests found in the system.</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Owner</th>
                  <th>Vehicle</th>
                  <th>Pickup & Destination</th>
                  <th>Distance & Duration</th>
                  <th>Estimated Cost</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.map(req => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>
                    <td>
                      <div>{req.owner?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.owner?.phone}</div>
                    </td>
                    <td>
                      <div>{req.vehicle?.make} {req.vehicle?.model}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.vehicle?.registrationNumber}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.8rem' }}><strong style={{ color: '#ef4444' }}>From:</strong> {req.pickupAddress}</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}><strong style={{ color: '#10b981' }}>To:</strong> {req.destinationAddress}</div>
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
                      {req.assignedDriver ? (
                        <div>
                          <div>{req.assignedDriver.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.assignedDriver.phone}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Unassigned</span>
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

      {/* System Payments & Driver Reviews Monitoring */}
      <div className="grid-cols-2">
        {/* Payment Logs */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="#34d399" /> System Payment Records ({allPayments.length})
          </h3>
          {allPayments.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No payment records logged.</div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Req #</th>
                    <th>Owner</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map(p => (
                    <tr key={p.id}>
                      <td>#{p.requestId}</td>
                      <td>{p.ownerName}</td>
                      <td style={{ fontWeight: 600, color: '#34d399' }}>₹{p.amount?.toFixed(2)}</td>
                      <td>{p.paymentMethod}</td>
                      <td>
                        <span style={{ color: p.paymentStatus === 'PAID' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Driver Reviews Logs */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} color="#fbbf24" fill="#fbbf24" /> Customer Reviews ({allReviews.length})
          </h3>
          {allReviews.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No customer reviews submitted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {allReviews.map(r => (
                <div key={r.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <strong>{r.ownerName} → {r.driverName}</strong>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>★ {r.rating}/5</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', margin: '0.3rem 0' }}>
                    "{r.comment || 'No comment'}"
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Req #{r.requestId}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

