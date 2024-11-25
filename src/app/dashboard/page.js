"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      try {
        const response = await fetch("/api/verify-token", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        await response.json();
        setLoading(false);
      } catch (error) {
        console.error("API call error:", error);
        router.push("/login");
      }
    }

    verifyToken();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Dashboard implementation here */}
    </div>
  );
}

// Add your styles for DashboardPage here
const styles = {
  dashboardContainer: {
    // Add your styles
  },
};
