'use client'; // Required for client-side rendering

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import OSMMap to avoid SSR issues
const OSMMap = dynamic(() => import('../../components/OSMMap'), { ssr: false });

export default function MapPage() {
  // Define points to display on the map
  const points = [
    { name: 'Monrovia', lat: 6.3156, lon: -10.8072 }, // Monrovia
    { name: 'Point B', lat: 6.3286, lon: -10.7904 },  // Nearby point
    { name: 'Point C', lat: 6.3550, lon: -10.7200 },  // Another point
  ];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <OSMMap points={points} />
    </div>
  );
}
