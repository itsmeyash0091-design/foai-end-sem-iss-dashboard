import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// Custom ISS icon
const issIcon = L.divIcon({
  className: 'iss-marker',
  html: `<div style="
    width:40px; height:40px;
    background: radial-gradient(circle at 40% 35%, #6366f1, #1e1b4b);
    border-radius:50%;
    border:2px solid #818cf8;
    box-shadow:0 0 16px #6366f1, 0 0 40px rgba(99,102,241,0.3);
    display:flex; align-items:center; justify-content:center;
    font-size:20px;
    animation: pulse 2s infinite;
  ">🛸</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
});

const trailIcon = L.divIcon({
  className: '',
  html: `<div style="width:6px;height:6px;background:#818cf8;border-radius:50%;opacity:0.6"></div>`,
  iconSize: [6, 6],
  iconAnchor: [3, 3],
});

function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lon], map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function ISSMap({ position, positions }) {
  const center = position ? [position.lat, position.lon] : [0, 0];
  const polyPoints = positions.map(p => [p.lat, p.lon]);

  return (
    <div className="w-full h-full min-h-[350px] rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={3}
        style={{ height: '100%', width: '100%', minHeight: '350px', background: '#0a0e1a' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {positions.slice(0, -1).map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon]} icon={trailIcon} />
        ))}
        {polyPoints.length > 1 && (
          <Polyline
            positions={polyPoints}
            pathOptions={{ color: '#818cf8', weight: 2, opacity: 0.7, dashArray: '6 4' }}
          />
        )}
        {position && (
          <Marker position={[position.lat, position.lon]} icon={issIcon}>
            <Popup>
              <div className="font-mono text-sm">
                <div className="font-bold mb-1">🛸 ISS Position</div>
                <div>Lat: {position.lat.toFixed(4)}°</div>
                <div>Lon: {position.lon.toFixed(4)}°</div>
              </div>
            </Popup>
          </Marker>
        )}
        {position && <MapRecenter position={position} />}
      </MapContainer>
    </div>
  );
}
