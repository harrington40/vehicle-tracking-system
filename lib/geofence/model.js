export const GeofenceType = { CIRCLE: 'circle', POLYGON: 'polygon' };

export function createCircle({ id, name, center, radiusMeters, color }) {
  return {
    id, name, type: GeofenceType.CIRCLE,
    geometry: { center, radiusMeters },
    rules: { dwellSeconds: 0, speedLimit: null, direction: 'both', schedule: null },
    meta: { color: color || '#2563eb', createdAt: Date.now(), updatedAt: Date.now() },
    active: true,
  };
}

export function createPolygon({ id, name, coordinates, color }) {
  return {
    id, name, type: GeofenceType.POLYGON,
    geometry: { coordinates },
    rules: { dwellSeconds: 0, speedLimit: null, direction: 'both', schedule: null },
    meta: { color: color || '#16a34a', createdAt: Date.now(), updatedAt: Date.now() },
    active: true,
  };
}


export function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const s1 = Math.sin(dLat/2), s2 = Math.sin(dLng/2);
  const c = s1*s1 + Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * s2*s2;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1-c));
}
export function pointInCircle(p, c, r){ return haversineMeters(p,c) <= r; }
export function pointInPolygon(point, poly) {
  let inside=false;
  for (let i=0,j=poly.length-1;i<poly.length;j=i++) {
    const xi=poly[i][0], yi=poly[i][1];
    const xj=poly[j][0], yj=poly[j][1];
    const intersect=((yi>point.lat)!=(yj>point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / ((yj - yi) || 1e-9) + xi);
    if (intersect) inside=!inside;
  }
  return inside;
}
export function bboxOfGeofence(g){
  if (g.type==='circle'){
    const d=g.geometry.radiusMeters/111320;
    return { minLat:g.geometry.center.lat-d, maxLat:g.geometry.center.lat+d,
             minLng:g.geometry.center.lng-d, maxLng:g.geometry.center.lng+d };
  }
  const c=g.geometry.coordinates;
  let minLat=90,maxLat=-90,minLng=180,maxLng=-180;
  c.forEach(([lat,lng])=>{ if(lat<minLat)minLat=lat; if(lat>maxLat)maxLat=lat; if(lng<minLng)minLng=lng; if(lng>maxLng)maxLng=lng; });
  return { minLat,maxLat,minLng,maxLng };
}
export function bboxContains(b,p){
  return p.lat>=b.minLat && p.lat<=b.maxLat && p.lng>=b.minLng && p.lng<=b.maxLng;
}