import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapComponent
const MapComponent = dynamic(() => import('../src/components/MapComponent'), { ssr: false });

export default function TripHistoryPage() {
  const [tripHistory, setTripHistory] = useState(null);

  useEffect(() => {
    fetch('/api/vehicle/trips') // Fetch trip history data from LoopBack API
      .then(response => response.json())
      .then(data => setTripHistory(data));
  }, []);

  if (!tripHistory) return <div>Loading...</div>;

  return (
    <div>
      <h1>Trip History</h1>
      <MapComponent tripHistory={tripHistory} /> {/* Pass trip data to map */}
    </div>
  );
}
