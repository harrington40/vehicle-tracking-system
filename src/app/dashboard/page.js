"use client"; // Client-side only

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import DynamicMap to avoid SSR issues
const DynamicMap = dynamic(() => import("../dynamicMap/page"), { ssr: false });

// Custom Segmented Gauge Component
const SegmentedGauge = ({ percentage }) => {
  const colors = ["#FF0000", "#FF4500", "#FFA500", "#FFFF00", "#ADFF2F", "#00FF00"];
  const segments = colors.length;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "#333" }} />
          <stop offset="100%" style={{ stopColor: "#000" }} />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r={radius} fill="none" stroke="url(#grad)" strokeWidth="3.8" />
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
          style={{
            transition: "stroke-dashoffset 0.5s",
            filter: "drop-shadow(0 0 6px rgba(0,0,0,0.3))",
            strokeLinecap: "round",
          }}
        />
      ))}
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
      <circle
        cx="18"
        cy="18"
        r="9"
        fill="black"
        style={{
          animation: "pulse 2s infinite",
        }}
      />
      <text
        x="18"
        y="20.35"
        fill="white"
        fontSize="0.6em"
        fontWeight="bold"
        textAnchor="middle"
        style={{
          textShadow: "0px 0px 3px rgba(0, 0, 0, 0.5)",
        }}
      >
        {percentage}%
      </text>
      <style>
        {`
          @keyframes pulse {
            0% { r: 9; }
            50% { r: 10; }
            100% { r: 9; }
          }
        `}
      </style>
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
    fetch("/api/verify-token", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Unauthorized");
      })
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("API call error:", error);
        setLoading(false);
        router.push("/login");
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
        <div style={styles.statCard}>
          <p>Top 2</p>
        </div>
        <div style={styles.statCard}>
          <p>Top 3</p>
        </div>
        <div style={styles.statCard}>
          <p>Top 4</p>
        </div>
      </div>

      <div style={styles.content}>
        {/* Left Side Cards */}
        <div style={styles.sideColumn}>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={75} />
          </div>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={50} />
          </div>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={85} />
          </div>
        </div>

        {/* Center Map Section */}
        <main style={styles.main}>
          <DynamicMap />
        </main>

        {/* Right Side Cards */}
        <div style={styles.sideColumn}>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={30} />
          </div>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={65} />
          </div>
          <div style={styles.statCard}>
            <SegmentedGauge percentage={90} />
          </div>
        </div>
      </div>

      {/* Bottom Row of Cards */}
      <div style={styles.topBottomRow}>
        <div style={styles.statCard}>
          <VerticalBarGraph />
        </div>
        <div style={styles.statCard}>
          <SegmentedGauge percentage={55} />
        </div>
        <div style={styles.statCard}>
          <SegmentedGauge percentage={35} />
        </div>
        <div style={styles.statCard}>
          <VerticalBarGraph />
        </div>
      </div>
    </div>
  );
}

// Styles for all components
const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    backgroundColor: "#B4D5C2",
    padding: "10px",
  },
  topBottomRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    padding: "20px 0",
  },
  content: {
    display: "flex",
    flex: 1,
    padding: "20px 0",
    alignItems: "center",
  },
  sideColumn: {
    display: "grid",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: "15px",
    width: "15%",
  },
  main: {
    flex: 1,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statCard: {
    background: "linear-gradient(145deg, #e0e5ec, #ffffff)",
    borderRadius: "16px",
    padding: "15px",
    width: "100%",
    maxWidth: "230px",
    aspectRatio: "1",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#2C3E50",
    position: "relative",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  carImage: {
    width: "80%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "8px",
  },
  barGraph: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: "80%",
    width: "100%",
    padding: "10px",
  },
  bar: {
    width: "8%",
    backgroundColor: "#4A90E2",
    borderRadius: "4px 4px 0 0",
  },
};
