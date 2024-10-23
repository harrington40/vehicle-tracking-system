"use client"; // Ensure this component runs on the client-side


import { useState, useEffect } from 'react';
import Image from 'next/image';
import LoginModal from './LoginModal'; // Import the LoginModal component
import CreateAccountModal from './CreateAccountModal'; // Import the CreateAccountModal component

const LoginComponent = () => {
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isLoginModalOpen, setLoginModalOpen] = useState(false); // State to handle login modal visibility
  const [isCreateAccountModalOpen, setCreateAccountModalOpen] = useState(false); // State to handle create account modal
  const [timerVisible, setTimerVisible] = useState(false); // Track whether timer should be visible
  const [remainingTime, setRemainingTime] = useState(120); // 2-minute inactivity timer

  useEffect(() => {
    let inactivityInterval;
    if (timerVisible) {
      inactivityInterval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
        if (remainingTime === 0) {
          clearInterval(inactivityInterval);
          setLoginModalOpen(false);
          setCreateAccountModalOpen(false);
        }
      }, 1000);
    }

    return () => clearInterval(inactivityInterval);
  }, [timerVisible, remainingTime]);

  // Handle showing the login modal
  const handleLogin = () => {
    setLoginModalOpen(true);
    setTimerVisible(true); // Start timer when modal opens
  };

  // Handle showing the create account modal
  const handleCreateAccount = () => {
    setCreateAccountModalOpen(true);
    setTimerVisible(true); // Start timer when modal opens
  };

  // Handle the login submission from the modal
  const handleLoginSubmit = ({ username, role }) => {
    console.log('Username:', username);
    console.log('Role:', role);
    // Add your login logic here
  };

  // Handle the create account submission from the modal
  const handleCreateAccountSubmit = (accountData) => {
    console.log('Account Data:', accountData);
    // Add your create account logic here
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Vehicle Tracking Icon */}
        <div className="logo-container">
          <Image
            src="/icons/test.svg"
            alt="Vehicle Tracking"
            width={400}
            height={500}
          />
        </div>

        <h2>IMEI Number</h2>

        {/* IMEI Input */}
        <input
          type="text"
          placeholder="Enter IMEI Number"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          className="inputField"
        />

        {/* WiFi Icon above Serial Number */}
        <div className="serial-number-container">
          <div className="circular-background">
            <Image
              src="/icons/test.png"
              alt="WiFi Icon"
              width={40}
              height={40}
              className="circular-image"
            />
          </div>
          <h2>Serial Number</h2>
        </div>

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
          <div className="icon-item">
            <div className="circular-background">
              <Image
                src="/icons/marker.svg"
                alt="IMEI"
                width={90}
                height={90}
              />
            </div>
            <p>IMEI Number</p>
          </div>

          <div className="separator" />

          <div className="icon-item">
            <div className="circular-background">
              <Image
                src="/icons/wifi.svg"
                alt="Serial Number"
                width={90}
                height={90}
              />
            </div>
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

      {/* Render the login modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSubmit={handleLoginSubmit}
        setTimerVisible={setTimerVisible}
      />

      {/* Render the create account modal */}
      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setCreateAccountModalOpen(false)}
        onSubmit={handleCreateAccountSubmit}
        setTimerVisible={setTimerVisible}
      />

      {/* Timer display */}
      {timerVisible && (
        <div className="timer">
          Inactivity Timer: {remainingTime}s
        </div>
      )}

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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
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

        .serial-number-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 15px;
        }

        .circular-background {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100px;
          height: 100px;
          background-color: #f0f0f0;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .login-button {
          background-color: #4a90e2;
          color: white;
        }

        .create-account-button {
          background-color: #f0ad4e;
          color: white;
        }

        /* Timer styles */
        .timer {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 14px;
          color: #f00;
        }
      `}</style>
    </div>
  );
};

export default LoginComponent;
