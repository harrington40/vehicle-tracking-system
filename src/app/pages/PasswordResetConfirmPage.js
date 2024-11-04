'use client';
import { useState } from 'react';
import '../app/page.css'; // Your CSS file for styling

const PasswordResetConfirmPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      // Add your password reset logic here
      console.log('Resetting password');
    } else {
      alert('Passwords do not match!');
    }
  };

  return (
    <div className="card password-reset-confirm-card">
      <h2>Enter New Password</h2>
      <form onSubmit={handlePasswordReset}>
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn">Reset Password</button>
      </form>
    </div>
  );
};

export default PasswordResetConfirmPage;
