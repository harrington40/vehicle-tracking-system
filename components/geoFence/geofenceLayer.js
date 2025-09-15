import React from 'react';
import { Circle, Polyline } from 'react-native-maps';

export default function GeofenceLayer({ geofences }) {
  return (
    <>
      {geofences.map(g => {
        if (g.type === 'circle') {
          return (
            <Circle
              key={g.id}
              center={{ latitude: g.geometry.center.lat, longitude: g.geometry.center.lng }}
              radius={g.geometry.radiusMeters}
              strokeColor={g.meta.color}
              fillColor={g.meta.color + '33'}
              strokeWidth={2}
            />
          );
        }
        if (g.type === 'polygon') {
          return (
            <Polyline
              key={g.id}
              coordinates={g.geometry.coordinates.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
              strokeColor={g.meta.color}
              strokeWidth={3}
            />
          );
        }
        return null;
      })}
    </>
  );
}