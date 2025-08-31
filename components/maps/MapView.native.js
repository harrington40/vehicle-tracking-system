// This file just re-exports based on platform
// React Native's module resolver will automatically pick the right file:
// - MapView.web.js for web
// - MapView.native.js for native platforms
// - MapView.js as fallback

import { Platform } from 'react-native';

// This is just a fallback - the .web.js and .native.js files should be used automatically
export default function MapViewFallback(props) {
  if (Platform.OS === 'web') {
    const WebMapView = require('./MapView.web').default;
    return <WebMapView {...props} />;
  } else {
    const NativeMapView = require('./MapView.native').default;
    return <NativeMapView {...props} />;
  }
}