import React from 'react';
import { CheckCircle2, Circle, Clock, Key, FileText, Truck, MapPin, Flag } from 'lucide-react';

const STEPS = [
  { id: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { id: 'PICKUP_OTP_PENDING', label: 'Pickup OTP', icon: Key },
  { id: 'PICKUP_VERIFIED', label: 'OTP Verified', icon: CheckCircle2 },
  { id: 'INSPECTION_PENDING', label: 'Pre-Inspection', icon: FileText },
  { id: 'IN_PROGRESS', label: 'In Transit', icon: Truck },
  { id: 'DESTINATION_REACHED', label: 'Arrived', icon: MapPin },
  { id: 'DELIVERY_OTP_PENDING', label: 'Delivery OTP', icon: Key },
  { id: 'DELIVERY_VERIFIED', label: 'OTP Verified', icon: CheckCircle2 },
  { id: 'POST_INSPECTION_PENDING', label: 'Post-Inspection', icon: FileText },
  { id: 'DELIVERED', label: 'Delivered', icon: Flag }
];

export const TripProgressTracker = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '0.75rem 0' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Handover & Trip Lifecycle Progress
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.5rem' }}>
        {STEPS.map((step, idx) => {
          const isPassed = idx <= currentIndex && currentIndex !== -1;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: '70px', opacity: isPassed ? 1 : 0.4 }}>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCurrent ? 'var(--primary)' : isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isCurrent ? '2px solid #ffffff' : isPassed ? '1px solid #10b981' : '1px solid var(--border-color)',
                  color: isCurrent ? '#ffffff' : isPassed ? '#34d399' : '#64748b',
                  marginBottom: '0.35rem'
                }}
              >
                <StepIcon size={16} />
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#3b82f6' : isPassed ? '#f8fafc' : '#64748b', textAlign: 'center' }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
