"use client"; // Ensure client-side component

import { useState, useEffect } from 'react';
import axios from 'axios'; // For making HTTP requests

const LoginModal = ({ isOpen, onClose, onSubmit, setTimerVisible }) => {
  const [email, setEmail] = useState(''); // Using email for login
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role set to "user"
  const [attempts, setAttempts] = useState(0); // Track failed attempts
  const [isSpam, setIsSpam] = useState(false); // Anti-spam flag
  const [isHuman, setIsHuman] = useState(false); // Track if the human test is passed
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes countdown
  const [errorMessage, setErrorMessage] = useState(''); // Error message state for invalid login
  const [successMessage, setSuccessMessage] = useState(''); // Success message state for successful login

  useEffect(() => {
    // Inactivity timer: Close the modal after 5 minutes of inactivity
    let inactivityInterval;
    if (isOpen) {
      inactivityInterval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
        if (remainingTime <= 0) {
          onClose(); // Close the modal automatically after 5 minutes
          setTimerVisible(false); // Hide timer
        }
      }, 1000); // Update timer every second
    }

    return () => clearInterval(inactivityInterval);
  }, [isOpen, remainingTime, onClose, setTimerVisible]);

  useEffect(() => {
    if (attempts >= 3) {
      setIsSpam(true);
      // Lock for 1 minute after 3 failed attempts
      const spamLockTimer = setTimeout(() => {
        setIsSpam(false);
        setAttempts(0); // Reset attempts after spam lock period
      }, 60000); // 1-minute spam lock

      return () => clearTimeout(spamLockTimer);
    }
  }, [attempts]);

  const handleSubmit = async () => {
    if (isSpam || !isHuman) return; // Prevent submission if spam detected or human test failed
  
    console.log('Attempting login with:', { email, password });
  
    try {
      // Make a request to the backend login endpoint
      const response = await axios.post('http://127.0.0.2:3022/users', {
        email,
        password,
      });
  
      console.log('Backend response:', response.data);
  
      if (response.data.token) {
        // Successful login
        setSuccessMessage('Login successful!');
        setErrorMessage('');
        onSubmit({ email, role, token: response.data.token }); // Pass the token along with the email and role
        onClose(); // Close modal on successful login
        setTimerVisible(false); // Hide the timer on login
      } else {
        setErrorMessage('Invalid login. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setErrorMessage('Invalid login. Please check your credentials.');
      setAttempts(attempts + 1);
    }
  };
  
  return isOpen ? (
    <div className="modal">
      <div className="modal-content">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Enter Email"
          value={email} // Using email instead of username
          onChange={(e) => setEmail(e.target.value)}
          className="modal-input"
          disabled={isSpam} // Disable input if spam is detected
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modal-input"
          disabled={isSpam} // Disable input if spam is detected
          autoComplete="off" // Ensure password is not saved
        />

        {/* Role Selection */}
        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === 'user'}
              onChange={() => setRole('user')}
            />
            User
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              onChange={() => setRole('admin')}
            />
            Admin
          </label>
        </div>

        {/* Human Test */}
        <div className="human-test">
          <label>
            <input
              type="checkbox"
              checked={isHuman}
              onChange={() => setIsHuman(!isHuman)}
            />
            I am not a robot
          </label>
        </div>

        <div className="modal-button-group">
          <button onClick={handleSubmit} className="modal-button" disabled={isSpam || !isHuman}>
            Submit
          </button>
          <button onClick={onClose} className="modal-button">
            Cancel
          </button>
        </div>

        {isSpam && <p className="error-message">Too many attempts. Please wait 1 minute.</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* Inactivity Timer Display */}
        <div className="timer">
          Inactivity Timer: {remainingTime}s
        </div>
      </div>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }

        .modal-input {
          display: block;
          width: 100%;
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 16px;
        }

        .role-selection {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
        }

        .human-test {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .modal-button-group {
          display: flex;
          justify-content: space-between;
        }

        .modal-button {
          width: 48%;
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #4a90e2;
          color: white;
        }

        .error-message {
          color: red;
          font-size: 14px;
        }

        .success-message {
          color: green;
          font-size: 14px;
        }

        /* Timer Styles */
        .timer {
          margin-top: 15px;
          font-size: 14px;
          color: #f00;
        }
      `}</style>
    </div>
  ) : null;
};

export default LoginModal;
