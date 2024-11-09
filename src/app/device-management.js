import React, { useState } from 'react';

// Sample mock data for device information
const initialDeviceData = {
  id: 1,
  name: 'Tracker Device 1',
  status: 'Active',
  subscriptionStatus: 'Valid until 2025-01-01',
  notifications: [
    { id: 1, message: 'Battery low', date: '2024-11-01' },
    { id: 2, message: 'Device inactive for 2 days', date: '2024-11-03' },
  ],
  fuelBudget: 100, // Initial gas budget in dollars
};

const DeviceManagementPage = () => {
  const [deviceData, setDeviceData] = useState(initialDeviceData);
  const [fuelExpense, setFuelExpense] = useState(0);

  // Toggle device status between Active and Inactive
  const toggleDeviceStatus = () => {
    setDeviceData((prevData) => ({
      ...prevData,
      status: prevData.status === 'Active' ? 'Inactive' : 'Active',
    }));
  };

  // Update fuel expense and recalculate budget
  const handleFuelExpenseChange = (event) => {
    const expense = parseFloat(event.target.value);
    if (!isNaN(expense)) {
      setFuelExpense(expense);
    }
  };

  const calculateRemainingBudget = () => deviceData.fuelBudget - fuelExpense;

  return (
    <div className="device-management-container">
      <h1 className="text-2xl font-bold">Device Management - {deviceData.name}</h1>

      {/* Device Status and Controls */}
      <section className="device-status-section bg-white p-4 shadow-lg rounded-lg my-4">
        <h2 className="text-xl font-semibold">Device Status</h2>
        <p>Status: {deviceData.status}</p>
        <button
          onClick={toggleDeviceStatus}
          className={`px-4 py-2 mt-2 rounded ${
            deviceData.status === 'Active' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {deviceData.status === 'Active' ? 'Disable Device' : 'Enable Device'}
        </button>
      </section>

      {/* Subscription Information */}
      <section className="subscription-section bg-white p-4 shadow-lg rounded-lg my-4">
        <h2 className="text-xl font-semibold">Subscription Information</h2>
        <p>Subscription Status: {deviceData.subscriptionStatus}</p>
        <button className="px-4 py-2 mt-2 bg-blue-500 rounded text-white">Edit Subscription</button>
      </section>

      {/* Notifications */}
      <section className="notifications-section bg-white p-4 shadow-lg rounded-lg my-4">
        <h2 className="text-xl font-semibold">Device Notifications</h2>
        <ul>
          {deviceData.notifications.map((notification) => (
            <li key={notification.id} className="py-1">
              <p>{notification.message}</p>
              <span className="text-gray-500 text-sm">{notification.date}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Fuel Budget and Calculation */}
      <section className="fuel-budget-section bg-white p-4 shadow-lg rounded-lg my-4">
        <h2 className="text-xl font-semibold">Fuel Budget Management</h2>
        <p>Initial Fuel Budget: ${deviceData.fuelBudget}</p>
        <div className="mt-2">
          <label className="block mb-1">Enter Fuel Expense:</label>
          <input
            type="number"
            value={fuelExpense}
            onChange={handleFuelExpenseChange}
            placeholder="Enter expense"
            className="p-2 border rounded w-full"
          />
        </div>
        <p className="mt-4">Remaining Fuel Budget: ${calculateRemainingBudget()}</p>
      </section>
    </div>
  );
};

export default DeviceManagementPage;
