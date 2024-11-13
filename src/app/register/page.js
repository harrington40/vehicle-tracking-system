"use client"; // Required for client-side interactivity in Next.js

import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
  
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      if (response.ok && result.success) {  // Check result.success instead of just response.ok
        setSuccess(true);
        setFormData({ name: '', email: '', confirmEmail: '', password: '' });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sign up</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {success && <p style={styles.success}>Registration successful!</p>}
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.inputGroup}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Name"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <FaEnvelope style={styles.icon} />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Email"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <FaExclamationTriangle style={styles.icon} />
          <input
            type="email"
            name="confirmEmail"
            placeholder="Confirm your email"
            value={formData.confirmEmail}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Confirm Email"
          />
        </div>
        
        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Registering...' : 'REGISTER'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
  },
  icon: {
    marginRight: '10px',
    color: '#aaa',
    fontSize: '1.2em',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: 'none',
    outline: 'none',
    fontSize: '1em',
    color: '#333',
  },
  showPasswordButton: {
    background: 'none',
    border: 'none',
    color: '#007BFF',
    cursor: 'pointer',
    fontSize: '0.9em',
  },
  button: {
    backgroundColor: '#00bcd4',
    color: '#fff',
    padding: '10px 0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: '0.9em',
    marginBottom: '10px',
  },
  success: {
    color: 'green',
    fontSize: '0.9em',
    marginBottom: '10px',
  },
};
