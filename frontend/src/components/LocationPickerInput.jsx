import React, { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

const COMMON_SUGGESTIONS = [
  { address: "Central Station, Metropolitan Area", lat: 13.0827, lng: 80.2707 },
  { address: "International Airport Terminal 2", lat: 12.9941, lng: 80.1709 },
  { address: "Tech Park Phase 1, Innovation Way", lat: 12.9815, lng: 80.2180 },
  { address: "North Highway Service Hub & Rest Stop", lat: 13.1189, lng: 80.1920 },
  { address: "City Center Boulevard - Tower A", lat: 13.0604, lng: 80.2496 }
];

export const LocationPickerInput = ({ label, value, onChange, placeholder, required = false }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleTextChange = (e) => {
    const newAddress = e.target.value;
    onChange({
      ...value,
      address: newAddress
    });
  };

  const handleSelectSuggestion = (item) => {
    onChange({
      address: item.address,
      latitude: item.lat,
      longitude: item.lng
    });
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({
          address: value.address || `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          latitude,
          longitude
        });
        setIsDetecting(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Unable to retrieve your current location automatically.");
        setIsDetecting(false);
      }
    );
  };

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label className="form-label">{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={placeholder || "Type address or select location..."}
            value={value.address || ''}
            onChange={handleTextChange}
            onFocus={() => setShowSuggestions(true)}
            required={required}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={detectLocation}
          disabled={isDetecting}
          title="Detect Current GPS Location"
          style={{ padding: '0.75rem' }}
        >
          <Navigation size={18} className={isDetecting ? 'spin' : ''} />
        </button>
      </div>

      {/* Lat & Long Info Bar if captured */}
      {(value.latitude || value.longitude) && (
        <div style={{ fontSize: '0.775rem', color: '#34d399', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
          <span>Lat: {value.latitude ? Number(value.latitude).toFixed(4) : 'N/A'}</span>
          <span>Lng: {value.longitude ? Number(value.longitude).toFixed(4) : 'N/A'}</span>
        </div>
      )}

      {/* Dynamic Location Suggestions */}
      {showSuggestions && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '0.25rem',
            padding: '0.5rem',
            background: '#1e293b',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.25rem 0.5rem', fontWeight: 600 }}>
            QUICK SUGGESTIONS
          </div>
          {COMMON_SUGGESTIONS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(item)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f8fafc',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Search size={14} style={{ color: '#3b82f6' }} />
              <div>
                <div>{item.address}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.lat}, {item.lng}</div>
              </div>
            </div>
          ))}
          <div 
            onClick={() => setShowSuggestions(false)}
            style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', padding: '0.4rem', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            Close Suggestions
          </div>
        </div>
      )}
    </div>
  );
};
