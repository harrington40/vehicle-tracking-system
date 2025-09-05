import React from 'react';
import { Platform } from 'react-native';

// Import platform-specific implementations
let OSMMapComponent;

if (Platform.OS === 'web') {
  // Use your existing web implementation
  OSMMapComponent = require('./MapView.web.js').default;
} else {
  // Use native implementation
  OSMMapComponent = require('./MapView.native.js').default;
}

export default function MapView(props) {
  return <OSMMapComponent {...props} />;
}