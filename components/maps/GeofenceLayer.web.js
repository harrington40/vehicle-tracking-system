import React, { useEffect, useMemo } from 'react';

// Build a polygon ring approximating a circle
function circleToRing(center, radiusMeters, steps = 64) {
  const out = [];
  const R = 6371000;
  const lat0 = center.lat * Math.PI / 180;
  const lon0 = center.lng * Math.PI / 180;
  for (let i = 0; i < steps; i++) {
    const b = (i / steps) * 2 * Math.PI;
    const lat = Math.asin(Math.sin(lat0) * Math.cos(radiusMeters / R) +
      Math.cos(lat0) * Math.sin(radiusMeters / R) * Math.cos(b));
    const lon = lon0 + Math.atan2(
      Math.sin(b) * Math.sin(radiusMeters / R) * Math.cos(lat0),
      Math.cos(radiusMeters / R) - Math.sin(lat0) * Math.sin(lat)
    );
    out.push([lon * 180 / Math.PI, lat * 180 / Math.PI]);
  }
  out.push(out[0]);
  return out;
}

function toFeatureCollection(geofences) {
  return {
    type: 'FeatureCollection',
    features: (geofences || []).map(g => {
      if (g.type === 'circle') {
        const ring = circleToRing(g.geometry.center, g.geometry.radiusMeters);
        return {
          type: 'Feature',
          properties: { stroke: g.meta?.color || '#16a34a', fill: (g.meta?.color || '#16a34a') + '33' },
          geometry: { type: 'Polygon', coordinates: [ring] }
        };
      }
      if (g.type === 'polygon') {
        const ring = g.geometry.coordinates.map(([lat, lng]) => [lng, lat]);
        if (ring.length > 2 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
          ring.push(ring[0]);
        }
        return {
          type: 'Feature',
          properties: { stroke: g.meta?.color || '#2563eb', fill: (g.meta?.color || '#2563eb') + '22' },
          geometry: { type: 'Polygon', coordinates: [ring] }
        };
      }
      return null;
    }).filter(Boolean)
  };
}

export default function GeofenceLayer({ geofences, postToMap, isMapLoaded }) {
  const fc = useMemo(() => toFeatureCollection(geofences), [geofences]);

  useEffect(() => {
    if (!isMapLoaded || !postToMap) return;
    postToMap({ type: 'setGeofences', featureCollection: fc });
    return () => postToMap({ type: 'clearGeofences' });
  }, [fc, isMapLoaded, postToMap]);

  return null;
}