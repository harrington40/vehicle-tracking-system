"use client";
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './navbar';
import './navbar.css';
import './profilePage.css';
import './subscriptionPage.css';
import ProfilePage from './profilePage';
import SubscriptionPage from './subscriptionPage';
import LoginForm from './LoginForm';
import PaymentPage from './payment';
import ReceiptPage from './ReceiptPage';
import DeviceManagementPage from './device-management'; // Import DeviceManagementPage

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // Update authentication status
  };

  return (
    <Router>
      <Navbar />
      <div className="homepage-container">
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              ) : (
                <ProfilePage />
              )
            }
          />

          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <div>Please log in to access your profile.</div>}
          />

          <Route
            path="/subscription"
            element={isAuthenticated ? <SubscriptionPage /> : <div>Please log in to view subscriptions.</div>}
          />

          <Route
            path="/payment"
            element={isAuthenticated ? <PaymentPage /> : <div>Please log in to access the payment page.</div>}
          />

          <Route
            path="/receipt"
            element={isAuthenticated ? <ReceiptPage /> : <div>Please log in to view the receipt.</div>}
          />

          <Route
            path="/device-management"
            element={isAuthenticated ? <DeviceManagementPage /> : <div>Please log in to access device management.</div>}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default HomePage;
