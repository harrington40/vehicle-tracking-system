import dynamic from 'next/dynamic';

// Dynamically import MapComponent with no SSR (server-side rendering)
const MapComponent = dynamic(() => import('../../src/app/components/MapComponent'), { ssr: false });

export default function HomePage() {
  return (
    <div>
      <h1>OpenStreetMap Integration in Next.js</h1>
      <MapComponent />
    </div>
  );
}
