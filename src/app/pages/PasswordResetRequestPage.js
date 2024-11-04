'use client';
import { useState } from 'react';
import '../app/page.css'; // Your CSS file for styling

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState('');

  const handleResetRequest = (e) => {
    e.preventDefault();
    // Add your password reset request logic here
    console.log('Requesting password reset for', email);
  };

  return (
    <div className="card password-reset-card">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleResetRequest}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn">Send Reset Link</button>
      </form>
      <p className="link">
        Remember your password? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default PasswordResetRequestPage;
