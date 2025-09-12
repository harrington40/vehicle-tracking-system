// Pure spatial helpers. Coordinates are [lat, lng]. Point is { lat, lng }.

// Haversine distance in meters
function haversineMeters(a, b) {
  const R = 6371000; // meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function pointInCircle(point, center, radiusMeters) {
  return haversineMeters(point, center) <= radiusMeters;
}

// Ray casting for polygon where ring = [[lat, lng], ...] (closed or open)
export function pointInPolygon(point, ring) {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  let inside = false;
  const y = point.lat;
  const x = point.lng;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][0], xi = ring[i][1];
    const yj = ring[j][0], xj = ring[j][1];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Compute bbox for circle or polygon
export function bboxOfGeofence(gf) {
  if (!gf) return null;

  if (gf.type === 'circle') {
    const { lat, lng } = gf.geometry.center;
    const r = gf.geometry.radiusMeters || 0;
    const dLat = r / 111320; // deg per meter (approx)
    const dLng = r / (111320 * Math.cos((lat * Math.PI) / 180) || 1e-6);
    return {
      minLat: lat - dLat,
      minLng: lng - dLng,
      maxLat: lat + dLat,
      maxLng: lng + dLng,
    };
  }

  if (gf.type === 'polygon') {
    const coords = gf.geometry?.coordinates || [];
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    for (const [lat, lng] of coords) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    if (!isFinite(minLat)) return null;
    return { minLat, minLng, maxLat, maxLng };
  }

  return null;
}

export function bboxContains(bbox, point) {
  if (!bbox || !point) return false;
  return (
    point.lat >= bbox.minLat &&
    point.lat <= bbox.maxLat &&
    point.lng >= bbox.minLng &&
    point.lng <= bbox.maxLng
  );
}