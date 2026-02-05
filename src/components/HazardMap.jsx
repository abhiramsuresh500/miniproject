import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const severityColors = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#eab308',
  low: '#16a34a',
};

const severityRadii = {
  critical: 2000,
  high: 1500,
  medium: 1000,
  low: 500,
};

const HazardMap = ({ userLocation, hazards = [] }) => {
  const mapRef = useRef(null);

  // Default center (if no user location, use world center)
  const center = userLocation ? [userLocation[0], userLocation[1]] : [20, 0];
  const zoom = userLocation ? 13 : 2;

  useEffect(() => {
    // Fix for leaflet container not initializing properly
    if (mapRef.current) {
      setTimeout(() => {
        if (mapRef.current && mapRef.current._map) {
          mapRef.current._map.invalidateSize();
        }
      }, 300);
    }
  }, []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-500/30">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-2xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation[0], userLocation[1]]}>
            <Popup>
              <div className="font-semibold text-blue-600">
                Your Location
                <br />
                <span className="text-sm text-gray-600">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hazard Markers and Zones */}
        {hazards.map((hazard) => {
          const color = severityColors[hazard.severity_level] || severityColors.low;
          const radius = severityRadii[hazard.severity_level] || severityRadii.low;

          return (
            <div key={hazard.id}>
              {/* Hazard Zone Circle */}
              <Circle
                center={[hazard.latitude, hazard.longitude]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2,
                  dasharray: '5, 5',
                }}
              />

              {/* Hazard Marker */}
              <Marker
                position={[hazard.latitude, hazard.longitude]}
                icon={L.icon({
                  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                })}
              >
                <Popup>
                  <div className="w-64">
                    <h3 className="font-bold text-lg mb-2 capitalize">
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      />
                      {hazard.severity_level} Hazard
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">{hazard.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <strong>Type:</strong> {hazard.hazard_type}
                      </p>
                      <p>
                        <strong>Location:</strong> {hazard.latitude.toFixed(4)}, {hazard.longitude.toFixed(4)}
                      </p>
                      <p>
                        <strong>Reported:</strong> {new Date(hazard.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HazardMap;