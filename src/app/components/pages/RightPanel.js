import React, { useState } from 'react';

const sidebarStyle = {
  width: '60px', // Collapsed width
  transition: 'width 0.3s',
  height: 'calc(100vh - 20vh)', // Stop above the table
  backgroundColor: '#46494E',
  color: '#fff',
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
};

const expandedSidebarStyle = {
  width: '200px', // Expanded width
  transition: 'width 0.3s',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '15px',
  margin: '10px 0', // Equal spacing between cards
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', // Subtle shadow for card
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  cursor: 'pointer',
};

const iconStyle = {
  cursor: 'pointer',
  width: '24px',   // Adjust size based on your image
  height: '24px',  // Adjust size based on your image
};

const cardTextStyle = {
  marginLeft: '10px',
  fontWeight: 'bold',
};

const RightPanel = ({ activateGeofence }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div
      style={{
        ...sidebarStyle,
        ...(isSidebarExpanded ? expandedSidebarStyle : {}),
      }}
      onMouseEnter={toggleSidebar}
      onMouseLeave={toggleSidebar}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        {isSidebarExpanded ? (
          <img src="/your-logo-here.png" alt="Logo" style={{ width: '80px', height: '80px' }} />
        ) : (
          <div style={iconStyle}>Logo</div> // Placeholder for the logo
        )}
      </div>

      {/* Sidebar Menu Items as Cards */}
      <div style={{ flex: 1, width: '100%', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Geofence - Using custom image */}
        <div style={cardStyle} onClick={activateGeofence}> {/* Geofence activated on click */}
          <img src="/icons/geo-fencing-icon.png" alt="Geofence Icon" style={iconStyle} />
          {isSidebarExpanded && <span style={cardTextStyle}>Geofence</span>}
        </div>

        {/* Tracking */}
        <div style={cardStyle}>
          <i className="fa fa-globe" style={iconStyle}></i>
          {isSidebarExpanded && <span style={cardTextStyle}>Tracking</span>}
        </div>

        {/* Reports */}
        <div style={cardStyle}>
          <i className="fa fa-chart-bar" style={iconStyle}></i>
          {isSidebarExpanded && <span style={cardTextStyle}>Reports</span>}
        </div>

        {/* Tasks */}
        <div style={cardStyle}>
          <i className="fa fa-tasks" style={iconStyle}></i>
          {isSidebarExpanded && <span style={cardTextStyle}>Tasks</span>}
        </div>

        {/* Fleet */}
        <div style={cardStyle}>
          <i className="fa fa-truck" style={iconStyle}></i>
          {isSidebarExpanded && <span style={cardTextStyle}>Fleet</span>}
        </div>
      </div>

      {/* Help Section */}
      <div style={{ marginBottom: '20px', width: '100%', padding: '0 10px' }}>
        <div style={cardStyle}>
          <i className="fa fa-question-circle" style={iconStyle}></i>
          {isSidebarExpanded && <span style={cardTextStyle}>Help</span>}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
