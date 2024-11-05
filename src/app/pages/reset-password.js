import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    // Verify the token when the component mounts
    if (token) {
      axios.post('/api/verify-reset-token', { token })
        .then(response => {
          if (response.data.valid) {
            setIsTokenValid(true);
          } else {
            setError('Invalid or expired token.');
          }
        })
        .catch(() => setError('Failed to verify token.'));
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('/api/reset-password', { token, newPassword });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  if (!isTokenValid) {
    return <div>{error || 'Verifying token...'}</div>;
  }

  return (
    <div>
      <h1>Reset Password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message ? (
        <p>{message}</p>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
