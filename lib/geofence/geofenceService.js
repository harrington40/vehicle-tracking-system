import { pointInCircle, pointInPolygon, bboxOfGeofence, bboxContains } from './spatial';

export class GeofenceService {
  geofences = [];
  stateByVehicle = new Map();
  listeners = new Set();

  load(initial = []) {
    // Ensure defaults; active defaults to true unless explicitly false
    this.geofences = initial.map(g => ({ rules: {}, ...g, active: g.active !== false }));
  }
  upsert(g) {
    const norm = { rules: {}, ...g, active: g.active !== false };
    const i = this.geofences.findIndex(x => x.id === norm.id);
    if (i >= 0) this.geofences[i] = norm; else this.geofences.push(norm);
  }
  remove(id) { this.geofences = this.geofences.filter(g => g.id !== id); }
  onEvent(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(e) { this.listeners.forEach(l => l(e)); }

  evaluateLocation(v) {
    const { id: vehicleId, lat, lng, speedKph, timestamp } = v;
    const point = { lat, lng };
    let vs = this.stateByVehicle.get(vehicleId);
    if (!vs) { vs = {}; this.stateByVehicle.set(vehicleId, vs); }

    for (const gf of this.geofences) {
      if (gf.active === false) continue;
      const prev = vs[gf.id] || { inside: false, enteredAt: null, dwellReported: false };
      const bbox = bboxOfGeofence(gf);
      if (!bboxContains(bbox, point)) {
        if (prev.inside) { this._exit(vehicleId, gf, timestamp, prev.enteredAt); vs[gf.id] = { inside: false, enteredAt: null, dwellReported: false }; }
        continue;
      }
      const inside = this._inside(point, gf);
      if (inside && !prev.inside) {
        this._enter(vehicleId, gf, timestamp);
        vs[gf.id] = { inside: true, enteredAt: timestamp, dwellReported: false };
      } else if (!inside && prev.inside) {
        this._exit(vehicleId, gf, timestamp, prev.enteredAt);
        vs[gf.id] = { inside: false, enteredAt: null, dwellReported: false };
      } else if (inside && prev.inside) {
        if (gf.rules?.dwellSeconds && prev.enteredAt && !prev.dwellReported &&
            (timestamp - prev.enteredAt) / 1000 >= gf.rules.dwellSeconds) {
          this.emit({ type: 'GEOFENCE_DWELL', vehicleId, geofenceId: gf.id, dwellSeconds: gf.rules.dwellSeconds, at: timestamp });
          prev.dwellReported = true;
        }
        if (gf.rules?.speedLimit && speedKph && speedKph > gf.rules.speedLimit) {
          this.emit({ type: 'GEOFENCE_SPEED', vehicleId, geofenceId: gf.id, speedKph, limit: gf.rules.speedLimit, at: timestamp });
        }
      }
    }
  }

  _inside(point, gf) {
    if (gf.type === 'circle') return pointInCircle(point, gf.geometry.center, gf.geometry.radiusMeters);
    if (gf.type === 'polygon') {
      const coords = gf.geometry.coordinates;
      const closed = coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1] ? coords : [...coords, coords[0]];
      return pointInPolygon(point, closed);
    }
    return false;
  }

  _enter(vehicleId, gf, at) { if (gf.rules?.direction === 'exit') return; this.emit({ type: 'GEOFENCE_ENTER', vehicleId, geofenceId: gf.id, at }); }
  _exit(vehicleId, gf, at, enteredAt) {
    if (gf.rules?.direction === 'enter') return;
    this.emit({ type: 'GEOFENCE_EXIT', vehicleId, geofenceId: gf.id, at, dwellSeconds: enteredAt ? (at - enteredAt) / 1000 : null });
  }
}

export const geofenceService = new GeofenceService();
export default geofenceService;