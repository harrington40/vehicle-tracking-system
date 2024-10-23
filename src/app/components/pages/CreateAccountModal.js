"use client"; // Ensure client-side component
import { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

const CreateAccountModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user'); // Default to 'user'
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null; // Don't render the modal if it's not open
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate that passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Hash the password before sending it to the backend
    const salt = bcrypt.genSaltSync(10); // Generate salt
    const hashedPassword = bcrypt.hashSync(password, salt); // Hash the password

    // Gather form data
    const formData = {
      email,
      password: hashedPassword, // Use the hashed password
      country,
      city,
      areaCode,
      countryCode,
      phoneNumber,
      role,
    };

    try {
      const response = await axios.post('http://127.0.0.2:3022/users', formData);
      console.log('Response:', response);
      onSubmit(response.data); // Pass user data to parent
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error creating account:', error.response ? error.response.data : error.message);
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
      }
      setErrorMessage('Error creating account. Please check the form and try again.');
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

        <input
          type="text"
          placeholder="Enter Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Enter Area Code"
          value={areaCode}
          onChange={(e) => setAreaCode(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Enter Country Code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="modal-input"
        />

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="modal-button-group">
          <button onClick={handleSubmit} className="modal-button" disabled={isSubmitting}>
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
        }

        .error-message {
          color: red;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default CreateAccountModal;
