"use client";  // Add this at the top of the file
import { useState } from 'react';
import Image from 'next/image';

const LoginComponent = () => {
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const handleLogin = () => {
    // Handle login logic
  };

  const handleCreateAccount = () => {
    // Handle create account logic
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Vehicle Tracking Icon */}
        <div className="logo-container">
          <Image src="/icons/test.svg" alt="Vehicle Tracking" width={400} height={500} />
        </div>

      

        {/* IMEI Input */}
        <input
          type="text"
          placeholder="Enter IMEI Number"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          className="inputField"
        />

        {/* Serial Number Input */}
        <input
          type="text"
          placeholder="Enter Serial Number"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className="inputField"
        />

        {/* Icon Group with IMEI and WiFi */}
        <div className="icon-group">
          {/* IMEI Icon */}
          <div className="icon-item">
            <Image src="/icons/location-pin.png" alt="IMEI" width={40} height={40} />
            <p>IMEI Number</p>
          </div>

          {/* Vertical Separator */}
          <div className="separator" />

          {/* WiFi Icon */}
          <div className="icon-item">
            <Image src="/icons/wifi.png" alt="Serial Number" width={40} height={40} />
            <p>Serial Number</p>
          </div>
        </div>

        {/* Login and Create Account Buttons */}
        <div className="button-group">
          <button onClick={handleLogin} className="login-button">
            Login
          </button>
          <button onClick={handleCreateAccount} className="create-account-button">
            Create Account
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f0f0;
        }

        .login-box {
          background-color: white;
          border-radius: 20px;
          padding: 40px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Elevated shadow */
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth transition for rising effect */
        }

        /* Hover effect to "raise" the login box */
        .login-box:hover {
          transform: translateY(-10px); /* Moves the box up */
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2); /* Deeper shadow on hover */
        }

        .logo-container {
          margin-bottom: 30px;
        }

        h2 {
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: bold;
          color: #4a90e2;
        }

        .inputField {
          display: block;
          width: 100%;
          margin-bottom: 15px;
          padding: 15px;
          border: 2px solid #ccc;
          border-radius: 10px;
          font-size: 16px;
        }

        /* Icon Group Styling */
        .icon-group {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
        }

        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .icon-item p {
          margin-top: 10px;
          font-size: 14px;
          color: #333;
        }

        .separator {
          width: 2px;
          height: 60px;
          background-color: #ccc;
          margin: 0 30px;
        }

        /* Increased margin for spacing between the icon group and button group */
        .icon-group {
          margin-bottom: 40px;
        }

        .button-group {
          display: flex;
          justify-content: space-between;
        }

        .login-button,
        .create-account-button {
          width: 48%;
          padding: 12px;
          font-size: 16px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Raised elevation */
        }

        .login-button {
          background-color: #4a90e2;
          color: white;
        }

        .create-account-button {
          background-color: #f0ad4e;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default LoginComponent;
