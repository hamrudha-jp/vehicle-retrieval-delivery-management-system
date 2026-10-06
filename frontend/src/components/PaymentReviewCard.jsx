import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { reviewService } from '../services/reviewService';
import { CreditCard, Star, CheckCircle2, AlertCircle, DollarSign, MessageSquare } from 'lucide-react';

export const PaymentReviewCard = ({ request, onUpdated }) => {
  const [payment, setPayment] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment Form State
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    loadPaymentAndReview();
  }, [request.id]);

  const loadPaymentAndReview = async () => {
    setLoading(true);
    try {
      const [payRes, revRes] = await Promise.all([
        paymentService.getPaymentByRequestId(request.id).catch(() => null),
        reviewService.getReviewByRequestId(request.id).catch(() => null)
      ]);

      if (payRes && payRes.success) setPayment(payRes.data);
      if (revRes && revRes.success) setReview(revRes.data);
    } catch (err) {
      console.error("Error loading payment/review:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      const res = await paymentService.processPayment(request.id, selectedMethod);
      if (res.success) {
        setPayment(res.data);
        setPaymentSuccess('Payment marked as PAID successfully!');
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setPaymentError(err.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const res = await reviewService.submitReview(request.id, rating, comment);
      if (res.success) {
        setReview(res.data);
        setReviewSuccess('Thank you! Your review has been submitted.');
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Loading payment & review information...</div>;
  }

  const cost = request.estimatedCost || 300.0;
  const isPaid = payment?.paymentStatus === 'PAID';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
      
      {/* 1. PAYMENT SUMMARY & MARK AS PAID CARD */}
      <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="#3b82f6" /> Payment Summary
          </h4>
          <span className={`status-badge status-${isPaid ? 'DELIVERED' : 'ACCEPTED'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            {isPaid ? 'PAID' : 'PENDING PAYMENT'}
          </span>
        </div>

        {paymentSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> {paymentSuccess}
          </div>
        )}

        {paymentError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {paymentError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>ESTIMATED SERVICE COST</span>
            <strong style={{ fontSize: '1.4rem', color: '#34d399' }}>₹{cost.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>PAYMENT METHOD</span>
            <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{payment?.paymentMethod || selectedMethod}</strong>
          </div>
          {isPaid && payment?.paidAt && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>PAID TIMESTAMP</span>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{new Date(payment.paidAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          )}
        </div>

        {!isPaid && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Select Payment Method:</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['UPI', 'CASH', 'CARD'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedMethod === method ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: selectedMethod === method ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                    color: selectedMethod === method ? '#60a5fa' : '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontWeight: 700 }}
              onClick={handleProcessPayment}
              disabled={processingPayment}
            >
              {processingPayment ? 'Processing Payment...' : `Mark ₹${cost.toFixed(2)} as Paid (${selectedMethod})`}
            </button>
          </div>
        )}
      </div>

      {/* 2. DRIVER REVIEW & RATING CARD */}
      <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={20} color="#fbbf24" /> Rate Your Driver ({request.assignedDriver?.name || 'Driver'})
        </h4>

        {reviewSuccess && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} /> {reviewSuccess}
          </div>
        )}

        {reviewError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {reviewError}
          </div>
        )}

        {review ? (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= review.rating ? '#fbbf24' : 'none'}
                  color={star <= review.rating ? '#fbbf24' : '#64748b'}
                />
              ))}
              <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#fbbf24' }}>{review.rating}.0 / 5</span>
            </div>
            {review.comment ? (
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{review.comment}"</p>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No written comment provided.</span>
            )}
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              Submitted on {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>Rating (1 - 5 Stars):</label>
              <div style={{ display: 'flex', gap: '0.4rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', padding: '0.2rem', cursor: 'pointer' }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= star ? '#fbbf24' : 'none'}
                      color={(hoverRating || rating) >= star ? '#fbbf24' : '#64748b'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', marginBottom: '0.4rem' }}>Comment (Optional):</label>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Share your experience with the driver's retrieval and delivery service..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
              disabled={submittingReview}
            >
              {submittingReview ? 'Submitting Review...' : 'Submit Driver Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
