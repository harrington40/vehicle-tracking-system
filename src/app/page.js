"use client"; // Add this line at the top to mark this as a client-side component



import Head from 'next/head';
import '../../src/app/globals.css';
import LoginComponent from './components/pages/LoginComponent'; // Import the LoginComponent
import CreateAccountModal from './components/pages/CreateAccountModal';

export default function HomePage() {
  return (
    <div>
      <Head>
        {/* Load additional styles or scripts if needed */}
        <link rel="stylesheet" href="/leaflet-sidepanel/leaflet-sidepanel.css" />
        <link rel="stylesheet" href="https://cdn.osmbuildings.org/OSMBuildings.css" />
        <script src="https://cdn.osmbuildings.org/OSMBuildings.js"></script>
      </Head>

      {/* Render only the LoginComponent */}
      <LoginComponent />
      <CreateAccountModal/>
    </div>
  );
}
