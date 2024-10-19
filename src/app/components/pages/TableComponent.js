import React, { useState } from 'react';

const dataGridContainerStyle = {
  backgroundColor: '#e9f1f7',
  padding: '20px',
  height: '20vh',
  overflowY: 'auto',
};

const mainTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const nestedTableStyle = {
  width: '100%',
  marginLeft: '20px',
  borderCollapse: 'collapse',
};

const headerStyle = {
  backgroundColor: '#4a90e2',
  color: '#fff',
  padding: '10px',
  textAlign: 'left',
};

const cellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ccc',
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  marginRight: '10px',
};

const iconStyle = {
  cursor: 'pointer',
  marginRight: '5px',
};

const TableComponent = () => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // Sample Data for the Grid
  const gridData = [
    {
      id: 1, // Add a unique id for each item
      name: 'Steven Buchanan',
      role: 'Sales Manager',
      city: 'London',
      address: '14 Garrett Hill',
      photo: 'https://randomuser.me/api/portraits/men/1.jpg',
      shipDetails: [
        { shipName: 'Rattlesnake Canyon Grocery', address: '2817 Milton Dr.', city: 'Albuquerque', country: 'USA' },
        { shipName: 'GROSELLA-Restaurante', address: '5° Ave. Los Palos Grandes', city: 'Caracas', country: 'Venezuela' },
      ],
    },
    {
      id: 2, // Add a unique id for each item
      name: 'Laura Callahan',
      role: 'Inside Sales Coordinator',
      city: 'Seattle',
      address: '4726 - 11th Ave. N.E.',
      photo: 'https://randomuser.me/api/portraits/women/2.jpg',
      shipDetails: [
        { shipName: 'Tortuga Restaurante', address: 'Avda. Azteca 123', city: 'Mexico D.F.', country: 'Mexico' },
        { shipName: 'Lehmanns Marktkauf', address: 'Magazinweg 7', city: 'Frankfurt a.M.', country: 'Germany' },
      ],
    },
  ];

  return (
    <div style={dataGridContainerStyle}>
      <table style={mainTableStyle}>
        <thead>
          <tr>
            <th style={headerStyle}>Photo</th>
            <th style={headerStyle}>First Name</th>
            <th style={headerStyle}>Last Name</th>
            <th style={headerStyle}>Title</th>
            <th style={headerStyle}>Address</th>
            <th style={headerStyle}>City</th>
          </tr>
        </thead>
        <tbody>
          {gridData.map((person) => (
            <React.Fragment key={person.id}> {/* Add a key for each main row */}
              <tr>
                <td style={cellStyle}>
                  <img src={person.photo} alt="avatar" style={avatarStyle} />
                </td>
                <td style={cellStyle}>{person.name.split(' ')[0]}</td>
                <td style={cellStyle}>{person.name.split(' ')[1]}</td>
                <td style={cellStyle}>{person.role}</td>
                <td style={cellStyle}>{person.address}</td>
                <td style={cellStyle}>
                  {person.city} 
                  <span onClick={() => toggleRowExpansion(person.id)} style={iconStyle}>
                    {expandedRow === person.id ? '▲' : '▼'}
                  </span>
                </td>
              </tr>
              {expandedRow === person.id && (
                <tr>
                  <td colSpan="6" style={cellStyle}>
                    <table style={nestedTableStyle}>
                      <thead>
                        <tr>
                          <th style={headerStyle}>Ship Name</th>
                          <th style={headerStyle}>Ship Address</th>
                          <th style={headerStyle}>Ship City</th>
                          <th style={headerStyle}>Ship Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.shipDetails.map((ship, shipIndex) => (
                          <tr key={shipIndex}> {/* Add a key for each nested row */}
                            <td style={cellStyle}>{ship.shipName}</td>
                            <td style={cellStyle}>{ship.address}</td>
                            <td style={cellStyle}>{ship.city}</td>
                            <td style={cellStyle}>{ship.country}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
