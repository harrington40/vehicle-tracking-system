import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapComponent
const MapComponent = dynamic(() => import('../src/components/MapComponent'), { ssr: false });

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    fetch('/api/vehicle/tracking') // Fetch from LoopBack tracking API
      .then(response => response.json())
      .then(data => setTrackingData(data));
  }, []);

  if (!trackingData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Real-Time Tracking</h1>
      <MapComponent trackingData={trackingData} /> {/* Pass tracking data to map */}
    </div>
  );
}
