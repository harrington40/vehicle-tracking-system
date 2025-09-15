// components/maps/MapView.js
import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

let L = null; // Leaflet (web only)

function ensureLeafletCss() {
  if (Platform.OS !== 'web') return;
  const href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

function latLngFromInitialRegion(initialRegion) {
  // supports your initialRegion shape (lat/long + optional deltas/zoom)
  return [initialRegion?.latitude ?? 0, initialRegion?.longitude ?? 0];
}

//
// WEB MAP (Leaflet)
//
function WebMap({
  vehicles = [],
  initialRegion,
  showControls = true,
  style,
  onWebMapReady,
  children,
}) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      ensureLeafletCss();
      if (!L) {
        const mod = await import('leaflet');
        L = mod.default || mod; // ESM/CJS safety
      }
      if (cancelled) return;

      if (!divRef.current) return;
      const [lat, lng] = latLngFromInitialRegion(initialRegion);
      const map = L.map(divRef.current, {
        zoomControl: showControls,
        attributionControl: true,
      }).setView([lat, lng], initialRegion?.zoom ?? 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
      onWebMapReady && onWebMapReady(map);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  // (Re)draw vehicle markers when vehicles change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !L) return;

    // clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    vehicles.forEach(v => {
      if (typeof v.latitude !== 'number' || typeof v.longitude !== 'number') return;
      const m = L.marker([v.latitude, v.longitude], {
        title: v.name || `Vehicle ${v.id}`,
      }).addTo(map);
      const status = v.status ? ` • ${v.status}` : '';
      const speed = typeof v.speed === 'number' ? ` • ${v.speed} km/h` : '';
      m.bindPopup(`<b>${v.name ?? v.id}</b>${status}${speed}`);
      markersRef.current.push(m);
    });
  }, [vehicles]);

  return (
    <View style={[{ width: '100%', minHeight: 260, borderRadius: 12, overflow: 'hidden' }, style]}>
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
      {/* children render so GeofenceLayer can run once map is ready */}
      {ready && children}
    </View>
  );
}

//
// NATIVE MAP (react-native-maps)
//
function NativeMap({
  vehicles = [],
  initialRegion,
  style,
  children,
}) {
  // Lazy require to avoid bundling on web
  const { default: RNMapView, Marker } = require('react-native-maps');

  const region = initialRegion
    ? {
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        latitudeDelta: initialRegion.latitudeDelta ?? 0.05,
        longitudeDelta: initialRegion.longitudeDelta ?? 0.05,
      }
    : undefined;

  return (
    <View style={[{ width: '100%', minHeight: 260, borderRadius: 12, overflow: 'hidden' }, style]}>
      <RNMapView
        style={{ flex: 1 }}
        initialRegion={region}
      >
        {vehicles.map(v => (
          <Marker
            key={String(v.id)}
            coordinate={{ latitude: v.latitude, longitude: v.longitude }}
            title={v.name ?? `Vehicle ${v.id}`}
            description={
              [v.status && `Status: ${v.status}`, typeof v.speed === 'number' && `Speed: ${v.speed} km/h`]
                .filter(Boolean)
                .join(' • ')
            }
          />
        ))}
        {children}
      </RNMapView>
    </View>
  );
}

//
// PUBLIC COMPONENT
//
export default function MapView(props) {
  if (Platform.OS === 'web') {
    return <WebMap {...props} />;
  }
  return <NativeMap {...props} />;
}
