"use client"; // Client-side only

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.push('/login');
  }, [router]);

  return (
    <div style={styles.container}>
      {/* Optional loading message or spinner */}
      <p style={styles.message}>Redirecting...</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5', // Light gray background color for a minimalist look
  },
  message: {
    color: '#333', // Darker color for loading message
    fontSize: '1.2em',
  },
};
