import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Custom SVG Markers for Pickup (Green) and Destination (Red)
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">
        <div style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
        ">${label}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const pickupIcon = createCustomIcon('#10b981', 'A');
const destinationIcon = createCustomIcon('#ef4444', 'B');

// Helper to auto-fit map view to contain both markers
const MapBoundsFitter = ({ pickup, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (pickup?.lat && pickup?.lng) {
      map.setView([pickup.lat, pickup.lng], 13);
    } else if (destination?.lat && destination?.lng) {
      map.setView([destination.lat, destination.lng], 13);
    }
  }, [pickup, destination, map]);

  return null;
};

export const InteractiveMap = ({ pickup, destination, height = '320px' }) => {
  const hasPickup = pickup?.lat && pickup?.lng;
  const hasDestination = destination?.lat && destination?.lng;

  // Fallback center if no coordinates provided yet
  const defaultCenter = hasPickup 
    ? [pickup.lat, pickup.lng] 
    : hasDestination 
    ? [destination.lat, destination.lng] 
    : [13.0827, 80.2707]; // General center

  const routePolyline = hasPickup && hasDestination ? [
    [pickup.lat, pickup.lng],
    [destination.lat, destination.lng]
  ] : [];

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', margin: '0.75rem 0' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: '100%', height: '100%', background: '#0b0f19' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsFitter pickup={pickup} destination={destination} />

        {hasPickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <strong>Pickup Location (A)</strong><br />
              {pickup.address || 'Pickup Point'}
            </Popup>
          </Marker>
        )}

        {hasDestination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <strong>Destination Location (B)</strong><br />
              {destination.address || 'Destination Point'}
            </Popup>
          </Marker>
        )}

        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8, dashArray: '8, 8' }}
          />
        )}
      </MapContainer>

      {!hasPickup && !hasDestination && (
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.85)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.775rem', color: '#94a3b8', zIndex: 1000, pointerEvents: 'none', border: '1px solid var(--border-color)' }}>
          Select or type pickup & destination to render interactive map route
        </div>
      )}
    </div>
  );
};
