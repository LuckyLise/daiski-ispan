'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

export default function CourseMap({ lat, lng, name }) {
  useEffect(() => {
    // Leaflet 圖標修正（避免預設圖示破圖）
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  if (!lat || !lng) return null;

  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{name || '課程地點'}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
