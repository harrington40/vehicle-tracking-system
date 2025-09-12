import { useEffect, useState } from 'react';
import { geofenceService } from '../../lib/geofence/geofenceService';

export function useGeofenceEvents(limit = 150) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!geofenceService?.onEvent) return;
    const off = geofenceService.onEvent((e) => {
      setEvents((prev) => [e, ...prev].slice(0, limit));
    });
    return () => off?.();
  }, [limit]);

  return events;
}