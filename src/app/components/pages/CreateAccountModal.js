"use client"; // Ensure client-side component
import { useState, useEffect } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

const CreateAccountModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check if modal should be locked
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setTimeout(() => setLockoutTime(0), lockoutTime * 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTime]);

  if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (lockoutTime > 0) return; // Exit if modal is locked
  
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    // Validate that passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
  
    // Hash the password before sending it to the backend
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
  
    // Gather form data
    const formData = {
      email,
      password: hashedPassword,
    };
  
    try {
      const response = await axios.post('http://localhost:3002/vehicles', formData);

      console.log('Response:', response);
      onSubmit(response.data); // Pass user data to parent
  
      // Show success message and close modal after delay
      setSuccessMessage('Thank you! Account created successfully.');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        setAttempts(0); // Reset attempts on success
      }, 2000);
    } catch (error) {
      console.error('Error creating account:', error.response ? error.response.data : error.message);
      setErrorMessage('Error creating account. Please check the form and try again.');
  
      // Increment failed attempts and apply lockout if needed
      setAttempts((prev) => prev + 1);
      if (attempts >= 2) {
        const nextLockoutTime = attempts === 2 ? 180 : attempts === 3 ? 300 : 600;
        setLockoutTime(nextLockoutTime);
        setErrorMessage(`Too many attempts. Please try again in ${nextLockoutTime / 60} minutes.`);
        setAttempts(0); // Reset attempts after lockout
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Account</h2>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="modal-input"
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="modal-input"
          required
        />
        <input
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="modal-input"
          required
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="modal-button-group">
          <button 
            onClick={handleSubmit} 
            className={`modal-button ${isSubmitting ? 'submitting' : ''}`} 
            disabled={isSubmitting || lockoutTime > 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button onClick={onClose} className="modal-button">
            Cancel
          </button>
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
          transition: background-color 0.2s;
        }

        .modal-button:active {
          background-color: #3b78c0;
        }

        .submitting {
          background-color: #888;
          cursor: not-allowed;
        }

        .error-message {
          color: red;
          font-size: 14px;
        }

        .success-message {
          color: green;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default CreateAccountModal;
