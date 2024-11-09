// LoginForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './loginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);

    axios.post('/api/login', { email: loginEmail, password: loginPassword })
      .then(response => {
        if (response.data.success) {
          onLoginSuccess();
          navigate('/profile'); // Navigate to ProfilePage on success
        } else {
          setLoginError('Invalid credentials');
        }
      })
      .catch(err => {
        setLoginError(err.response ? err.response.data.message : 'Login failed');
      });
  };

  return (
    <div className="card login-card">
      <h2>Login form</h2>
      <h3>Sign in</h3>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <span className="icon">✉️</span>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>
        <div className="form-group">
          <span className="icon">🔒</span>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>
        <button type="submit" className="btn login-btn">LOGIN</button>
        {loginError && <p className="error">{loginError}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
