"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Mock Data
const mockUser = {
  name: "John Doe",
  avatar: "https://via.placeholder.com/40", // Replace with actual avatar URL
};

const mockVehicleData = [
  { id: "V001", speed: "65 mph", status: "Active", condition: "Good", usage: 240 },
  { id: "V002", speed: "50 mph", status: "Inactive", condition: "Requires Maintenance", usage: 150 },
  { id: "V003", speed: "72 mph", status: "Active", condition: "Good", usage: 300 },
];

const lastMaintenanceData = [
  { vehicle: "Truck 450", time: "9:20 AM", alertType: "Idle Stop", alertCondition: "Idled for 46 minutes" },
  { vehicle: "Van 320", time: "10:18 AM", alertType: "Idle Stop", alertCondition: "Idled for 20 minutes" },
  { vehicle: "Truck 575", time: "12:24 PM", alertType: "Posted Speed", alertCondition: "13 mph over speed limit" },
  { vehicle: "Van 315", time: "2:42 PM", alertType: "Tampering", alertCondition: "Device lost external power" },
  { vehicle: "Sedan 105", time: "2:59 PM", alertType: "Long Stop", alertCondition: "Stopped for 4 days" },
];

const DashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState(mockVehicleData); // Mock vehicle data

  useEffect(() => {
    // Simulate token verification
    fetch("/api/verify-token", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error("Unauthorized");
      })
      .then(() => setLoading(false))
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
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <ul style={styles.navList}>
          <li style={styles.navItem}>🏠</li>
          <li style={styles.navItem}>📊</li>
          <li style={styles.navItem}>📍</li>
          <li style={styles.navItem}>⚙️</li>
        </ul>
      </aside>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.userInfo}>
          <img src={mockUser.avatar} alt="User Avatar" style={styles.avatar} />
          <span style={styles.userName}>{mockUser.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.contentContainer}>
        {/* Left Section */}
        <section style={styles.leftContainer}>
          <h3>Vehicle Performance</h3>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} style={styles.vehicleCard}>
              <p style={styles.vehicleTitle}>
                {vehicle.id} - {vehicle.status}
              </p>
              <HorizontalBarGraph value={vehicle.usage} />
            </div>
          ))}
        </section>

        {/* Center Section (Map) */}
        <section style={styles.centerContainer}>
          <h3>Map (All Vehicles)</h3>
          <div style={styles.mapPlaceholder}>
            <p style={styles.mapText}>Map Loading...</p>
          </div>
        </section>

        {/* Right Section */}
        <section style={styles.rightContainer}>
          <h3>Quick Metrics</h3>
          <div style={styles.card}>Total Active Vehicles: 25</div>
          <div style={styles.card}>Pending Maintenance Alerts: 3</div>
          <div style={styles.card}>Miles Driven Today: 1500</div>
        </section>
      </div>

      {/* Bottom Section */}
      <div style={styles.bottomContainer}>
        <div style={styles.card}>
          <h4 style={styles.tableTitle}>Recent Alerts (All Vehicles)</h4>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Vehicle</th>
                  <th style={styles.tableHeader}>Time</th>
                  <th style={styles.tableHeader}>Alert Type</th>
                  <th style={styles.tableHeader}>Alert Condition</th>
                </tr>
              </thead>
              <tbody>
                {lastMaintenanceData.map((entry, index) => (
                  <tr key={index}>
                    <td style={styles.tableCell}>{entry.vehicle}</td>
                    <td style={styles.tableCell}>{entry.time}</td>
                    <td style={styles.tableCell}>{entry.alertType}</td>
                    <td style={styles.tableCell}>{entry.alertCondition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={styles.lightGreenCard}>Fuel Consumption: <strong>120 Gallons</strong></div>
        <div style={styles.card}>Average Speed: <strong>60 mph</strong></div>
      </div>
    </div>
  );
};

// Horizontal Bar Graph Component
const HorizontalBarGraph = ({ value }) => (
  <div style={styles.horizontalGraph}>
    <div
      style={{
        ...styles.horizontalBar,
        width: `${value / 2}px`, // Adjust width based on value
        backgroundColor: value > 200 ? "#4CAF50" : "#FF9800", // Dynamic coloring
      }}
    ></div>
    <span style={styles.barLabel}>{value} pts</span>
  </div>
);

const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f9",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
  },
  sidebar: {
    position: "fixed",
    width: "60px",
    height: "100vh",
    backgroundColor: "#2C3E50",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0",
    zIndex: 1000,
  },
  navList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  navItem: {
    padding: "15px 0",
    fontSize: "24px",
    cursor: "pointer",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    display: "flex",
    flex: 1,
    marginLeft: "80px",
    padding: "20px",
    gap: "20px",
  },
  leftContainer: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  vehicleCard: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  vehicleTitle: {
    fontWeight: "bold",
    marginBottom: "5px",
  },
  horizontalGraph: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  horizontalBar: {
    height: "20px",
    borderRadius: "4px",
  },
  barLabel: {
    fontSize: "0.9em",
  },
  centerContainer: {
    flex: 2,
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    textAlign: "center",
    padding: "10px",
  },
  mapPlaceholder: {
    height: "300px",
    backgroundColor: "#BDC3C7",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    color: "#2C3E50",
    fontSize: "18px",
  },
  rightContainer: {
    flex: 1,
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  bottomContainer: {
    marginLeft: "80px",
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    display: "flex",
    gap: "15px",
    justifyContent: "space-between",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f4f4f9",
    fontWeight: "bold",
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
  },
  card: {
    flex: 1,
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  lightGreenCard: {
    flex: 1,
    padding: "15px",
    backgroundColor: "#4CAF50", // Light green color
    color: "#fff", // White font
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default DashboardPage;
