// HeatmapMap.js
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';

function HeatmapMap({ points }) {
  return (
    <div style={{ height: '500px', marginBottom: '2rem' }}>
      <MapContainer
        center={[32.7767, -96.7970]} // Dallas, TX
        zoom={11}
        style={{ height: '100%'}}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer points={points} />
      </MapContainer>
    </div>
  );
}

export default HeatmapMap;
