// HeatmapLayer.js
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import HeatmapOverlay from 'leaflet-heatmap';

function HeatmapLayer({ points }) {
  const map = useMap();
  const heatmapRef = useRef();

  useEffect(() => {
    if (!map) return;

    const config = {
      radius: 0.01,
      maxOpacity: 0.8,
      scaleRadius: true,
      useLocalExtrema: true,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'amount',
    };

    heatmapRef.current = new HeatmapOverlay(config);
    heatmapRef.current.addTo(map);

    heatmapRef.current.setData({
      max: Math.max(...points.map(p => p.amount)),
      data: points,
    });

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.remove();
      }
    };
  }, [map, points]);

  return null; // This component adds layers to the map, not UI
}

export default HeatmapLayer;
