"use client"; // Add this line at the top to mark this as a client-side component

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import '../../src/app/globals.css';
import LoginComponent from '../../src/app/components/pages/LoginComponent'; // Assuming this is your login component

// Dynamically import MapComponent with no SSR (server-side rendering)
const MapComponent = dynamic(() => import('../../src/app/components/MapComponent'), { ssr: false });

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Use useState to track login status

  const handleLogin = () => {
    setIsLoggedIn(true); // Simulate a login
  };

  return (
    <div>
      <Head>
        {/* Load the Leaflet SidePanel CSS */}
        <link rel="stylesheet" href="/leaflet-sidepanel/leaflet-sidepanel.css" />
        <link rel="stylesheet" href="https://cdn.osmbuildings.org/OSMBuildings.css" />
        <script src="https://cdn.osmbuildings.org/OSMBuildings.js"></script>
      </Head>

      {/* Conditionally render login or map */}
      {!isLoggedIn ? (
        <LoginComponent onLogin={handleLogin} />
      ) : (
        <div>
          <h1>OpenStreetMap Integration in Next.js</h1>
          {/* Dynamically load the SidePanel JS */}
          <script src="/leaflet-sidepanel/leaflet-sidepanel.min.js" strategy="lazyOnload"></script>

          {/* Render the MapComponent */}
          <MapComponent />
        </div>
      )}
    </div>
  );
}
