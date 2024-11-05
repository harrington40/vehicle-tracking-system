'use client'; // Indicate this is a client-side component

import { useEffect, useState } from 'react';
import axios from 'axios';
import '../app/page.css'; // Assuming you have a CSS file for styling

const HomePage = () => {
  // State to hold the list of vehicles, user information, and any errors
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [formType, setFormType] = useState('login'); // 'login', 'register', 'resetPassword'

  // State for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);

  // State for password reset form
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  // useEffect hook to make the API call when the component mounts
  useEffect(() => {
    console.log('Starting API call to /api/getVehicleByMake with make=Toyota');

    axios.get('/api/getVehicleByMake?make=Toyota')
      .then(response => {
        console.log('API call successful:', response);
        console.log('Vehicles data:', response.data.vehicles);
        setVehicles(response.data.vehicles);
      })
      .catch(err => {
        console.error('Error during API call:', err);
        console.log('Error details:', err.response ? err.response.data : err.message);
        setError(err.message);
      });
  }, []);

  // Login form submission handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);

    axios.post('/api/login', { email: loginEmail, password: loginPassword })
      .then(response => {
        if (response.data.success) {
          console.log('Login successful:', response.data);
          setIsAuthenticated(true);
        } else {
          setLoginError('Invalid credentials');
        }
      })
      .catch(err => {
        console.error('Error during login:', err);
        setLoginError(err.response ? err.response.data.message : 'Login failed');
      });
  };

  // Registration form submission handler
  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    axios.post('/api/register', { name, email, password })
      .then(response => {
        console.log('Registration successful:', response.data);
        setRegisterSuccess('User registered successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setFormType('login'); // Switch to the login form after successful registration
      })
      .catch(err => {
        console.error('Error during registration:', err);
        setRegisterError(err.response ? err.response.data.message : 'Registration failed');
      });
  };

  // Password reset form submission handler
  const handlePasswordReset = (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
  
    axios.post('/api/reset-password', { email: resetEmail })
      .then(response => {
        console.log('Password reset email sent:', response.data);
        setResetSuccess('Password reset email sent! Check your inbox.');
        setResetEmail('');
        setFormType('login'); // Switch back to login form after reset
      })
      .catch(err => {
        console.error('Error during password reset:', err);
        setResetError(err.response ? err.response.data.message : 'Password reset failed');
      });
  };
  // If there is an error, render an error message
  if (error) {
    console.log('Rendering error component with message:', error);
    return <div className="error">Error: {error}</div>;
  }

  // Render the welcome page if the user is authenticated
  if (isAuthenticated) {
    return (
      <div className="welcome-page">
        <h1>Welcome to the Vehicle Tracking System</h1>
        <p>You are successfully logged in!</p>
        <button onClick={() => setIsAuthenticated(false)} className="btn">Logout</button>
      </div>
    );
  }

  console.log('Rendering vehicle list with', vehicles.length, 'items');

  // Render login/registration/reset-password cards
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <img src="/logo.png" alt="Vehicle Tracking Logo" className="logo" />
        <h1>Vehicle Tracking System</h1>
      </header>
      <main className="user-auth-container">
        {formType === 'login' && (
          <div className="card login-card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" />
              </div>
              <button type="submit" className="btn">Login</button>
              {loginError && <p className="error">{loginError}</p>}
              <p>
                Don't have an account?{' '}
                <span className="link" onClick={() => setFormType('register')}>Register here</span>
              </p>
              <p>
                Forgot your password?{' '}
                <span className="link" onClick={() => setFormType('resetPassword')}>Reset it here</span>
              </p>
            </form>
          </div>
        )}
        
        {formType === 'register' && (
          <div className="card registration-card">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              </div>
              <button type="submit" className="btn">Register</button>
              {registerError && <p className="error">{registerError}</p>}
              {registerSuccess && <p className="success">{registerSuccess}</p>}
              <p>
                Already have an account?{' '}
                <span className="link" onClick={() => setFormType('login')}>Login here</span>
              </p>
            </form>
          </div>
        )}

        {formType === 'resetPassword' && (
          <div className="card reset-password-card">
            <h2>Reset Password</h2>
            <form onSubmit={handlePasswordReset}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email:</label>
                <input type="email" id="resetEmail" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email" />
              </div>
              <button type="submit" className="btn">Send Reset Link</button>
              {resetError && <p className="error">{resetError}</p>}
              {resetSuccess && <p className="success">{resetSuccess}</p>}
              <p>
                Remembered your password?{' '}
                <span className="link" onClick={() => setFormType('login')}>Login here</span>
              </p>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
