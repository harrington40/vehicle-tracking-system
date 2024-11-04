'use client'; // Indicate this is a client-side component

import { useEffect, useState } from 'react';
import axios from 'axios';
import '../app/page.css'; // Assuming you have a CSS file for styling

const HomePage = () => {
  // State to hold the list of vehicles, user information, and any errors
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // Toggle between login and registration

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

  // useEffect hook to make the API call when the component mounts
  useEffect(() => {
    console.log('Starting API call to /api/getVehicleByMake with make=Toyota');

    axios.get('/api/getVehicleByMake?make=Toyota')
      .then(response => {
        console.log('API call successful:', response);
        console.log('Vehicles data:', response.data.vehicles);
        // Set the vehicles state with the data from the response
        setVehicles(response.data.vehicles);
      })
      .catch(err => {
        // Handle errors and set the error state
        console.error('Error during API call:', err);
        console.log('Error details:', err.response ? err.response.data : err.message);
        setError(err.message);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Login form submission handler
  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoginError(null);

    axios.post('/api/login', { email: loginEmail, password: loginPassword })
      .then(response => {
        if (response.data.success) {
          console.log('Login successful:', response.data);
          setIsAuthenticated(true); // Set authentication state to true
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
    e.preventDefault(); // Prevent default form submission
    setRegisterError(null);
    setRegisterSuccess(null);

    axios.post('/api/register', { name, email, password })
      .then(response => {
        console.log('Registration successful:', response.data);
        setRegisterSuccess('User registered successfully!');
        setName('');
        setEmail('');
        setPassword('');
      })
      .catch(err => {
        console.error('Error during registration:', err);
        setRegisterError(err.response ? err.response.data.message : 'Registration failed');
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

  // Render login/registration cards and vehicle data
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <img src="/logo.png" alt="Vehicle Tracking Logo" className="logo" />
        <h1>Vehicle Tracking System</h1>
      </header>
      <main className="user-auth-container">
        {showLogin ? (
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
                <span className="link" onClick={() => setShowLogin(false)}>Register here</span>
              </p>
            </form>
          </div>
        ) : (
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
                <span className="link" onClick={() => setShowLogin(true)}>Login here</span>
              </p>
            </form>
          </div>
        )}
      </main>
      <section className="vehicle-list-container">
        {vehicles.length > 0 ? (
          <ul className="vehicle-list">
            {vehicles.map((vehicle, index) => (
              <li key={index} className="vehicle-item">
                <div className="vehicle-info">
                  <p><strong>ID:</strong> {vehicle.id}</p>
                  <p><strong>Make:</strong> {vehicle.make}</p>
                  <p><strong>Model:</strong> {vehicle.model}</p>
                  <p><strong>Year:</strong> {vehicle.year}</p>
                  <p><strong>Status:</strong> {vehicle.status}</p>
                  <p><strong>Owner:</strong> {vehicle.owner ? vehicle.owner.name : 'N/A'}</p>
                  <p><strong>VIN:</strong> {vehicle.vin}</p>
                  <p><strong>Registered Date:</strong> {vehicle.registeredDate}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="loading-message">Loading vehicle data...</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
