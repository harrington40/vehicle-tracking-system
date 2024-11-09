// DeviceTable.js
import React, { useState } from 'react';
import './deviceTable.css';

const DeviceTable = () => {
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(id)
        ? prevExpandedRows.filter((rowId) => rowId !== id)
        : [...prevExpandedRows, id]
    );
  };

  const data = [
    {
      id: 1,
      first: 'Mark',
      last: 'Otto',
      handle: '@mdo',
      deviceDetails: {
        orderId: 1,
        orderDate: '24-07-1996',
        address: '35 King George',
      },
    },
    {
      id: 2,
      first: 'Jacob',
      last: 'Thornton',
      handle: '@fat',
    },
    {
      id: 3,
      first: 'Larry',
      last: 'the Bird',
      handle: '@twitter',
    },
  ];

  return (
    <div className="device-table">
      <table>
        <thead>
          <tr>
            <th>Vehicle:</th>
            <th>Driver:</th>
            <th>Date:</th>
            <th>Status:</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <React.Fragment key={row.id}>
              <tr>
                <td>
                  <button
                    className={`expand-btn ${expandedRows.includes(row.id) ? 'expanded' : ''}`}
                    onClick={() => toggleRow(row.id)}
                  >
                    {expandedRows.includes(row.id) ? '▼' : '▶'}
                  </button>
                  {row.id}
                </td>
                <td>{row.first}</td>
                <td>{row.last}</td>
                <td>{row.handle}</td>
              </tr>
              {expandedRows.includes(row.id) && row.deviceDetails && (
                <tr className="expanded-row">
                  <td colSpan="4">
                    <div className="expanded-content">
                      <table className="inner-table">
                        <thead>
                          <tr>
                            <th>Device ID</th>
                            <th>Activation Date</th>
                            <th>Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{row.deviceDetails.orderId}</td>
                            <td>{row.deviceDetails.orderDate}</td>
                            <td>{row.deviceDetails.address}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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

export default DeviceTable;
