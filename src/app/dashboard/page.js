"use client"; // Client-side only

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Map Placeholder component
const MapPlaceholder = () => (
  <div style={styles.mapPlaceholder}>
    <p style={styles.mapText}>Map Loading...</p>
  </div>
);

// Custom Segmented Gauge Component
const SegmentedGauge = ({ percentage }) => {
  const colors = ["#FF0000", "#FF4500", "#FFA500", "#FFFF00", "#ADFF2F", "#00FF00"];
  const segments = colors.length;
  const anglePerSegment = 360 / segments;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle cx="18" cy="18" r={radius} fill="none" stroke="#333" strokeWidth="3.8" />
      
      {/* Segments */}
      {colors.map((color, index) => (
        <circle
          key={index}
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.8"
          strokeDasharray={`${circumference / segments}, ${circumference}`}
          strokeDashoffset={(index * circumference) / segments}
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
      ))}

      {/* Foreground circle to represent the percentage */}
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        stroke="black"
        strokeWidth="3.8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />

      {/* Inner black circle */}
      <circle cx="18" cy="18" r="10" fill="black" />

      {/* Percentage text */}
      <text x="18" y="20.35" fill="white" fontSize="0.5em" fontWeight="bold" textAnchor="middle">
        {percentage}%
      </text>
    </svg>
  );
};

// Vertical Bar Graph component
const VerticalBarGraph = () => (
  <div style={styles.barGraph}>
    {[60, 80, 40, 70, 90, 50].map((height, index) => (
      <div key={index} style={{ ...styles.bar, height: `${height}%` }}></div>
    ))}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verify-token', {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Unauthorized');
      })
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("API call error:", error);
        setLoading(false);
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Row of Cards */}
      <div style={styles.topBottomRow}>
        <div style={styles.statCard}>
          <img src="car-image-url.png" alt="Car" style={styles.carImage} />
        </div>
        <div style={styles.statCard}><p>Top 2</p></div>
        <div style={styles.statCard}><p>Top 3</p></div>
        <div style={styles.statCard}><p>Top 4</p></div>
      </div>

      <div style={styles.content}>
        {/* Left Side Cards */}
        <div style={styles.sideColumn}>
          <div style={styles.statCard}><SegmentedGauge percentage={75} /></div>
          <div style={styles.statCard}><SegmentedGauge percentage={50} /></div>
          <div style={styles.statCard}><SegmentedGauge percentage={85} /></div>
        </div>

        {/* Center Map Section */}
        <main style={styles.main}>
          <MapPlaceholder />
        </main>

        {/* Right Side Cards */}
        <div style={styles.sideColumn}>
          <div style={styles.statCard}><SegmentedGauge percentage={30} /></div>
          <div style={styles.statCard}><SegmentedGauge percentage={65} /></div>
          <div style={styles.statCard}><SegmentedGauge percentage={90} /></div>
        </div>
      </div>

      {/* Bottom Row of Cards */}
      <div style={styles.topBottomRow}>
        <div style={styles.statCard}><VerticalBarGraph /></div>
        <div style={styles.statCard}><SegmentedGauge percentage={55} /></div>
        <div style={styles.statCard}><SegmentedGauge percentage={35} /></div>
        <div style={styles.statCard}><VerticalBarGraph /></div>
      </div>
    </div>
  );
}

// Styles for all components
const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    backgroundColor: '#B4D5C2', // Greenish-blue background color
    padding: '10px',
  },
  topBottomRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // Adjusts number of cards in each row
    gap: '10px',
    padding: '10px 0',
  },
  content: {
    display: 'flex',
    flex: 1,
    padding: '20px 0',
    alignItems: 'center',
  },
  sideColumn: {
    display: 'grid',
    gridTemplateRows: 'repeat(3, 1fr)', // Number of cards on each sidebar
    gap: '10px',
    width: '15%',
  },
  main: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    width: '100%',
    aspectRatio: '1', // Ensures square shape
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Adds shadow
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#2C3E50',
    position: 'relative',
  },
  carImage: {
    width: '80%', // Adjust image size
    height: 'auto',
    objectFit: 'cover',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#BDC3C7', // Map loading background color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  },
  mapText: {
    color: '#1E2A38', // Text color for map placeholder
    fontSize: '1.2em',
  },
  barGraph: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '80%',
    width: '100%',
    padding: '5px',
  },
  bar: {
    width: '10%',
    backgroundColor: '#4A90E2', // Adjust color as needed
    borderRadius: '4px 4px 0 0',
  },
};
