"use client"; // Required for client-side interactivity in the Next.js app directory

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Redirect to the dashboard on successful login
        router.push('/dashboard');
      } else {
        const { error } = await res.json();
        setError(error || 'Login failed');
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        {/* Links for "Register" and "Forgot Password" */}
        <div style={styles.linkContainer}>
          <a href="/register" style={styles.link}>Register</a>
          <span style={styles.linkSeparator}>|</span>
          <a href="/forgot-password" style={styles.link}>Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.5em',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#4A90E2', // Blue color for the login button
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '15px',
  },
  link: {
    fontSize: '0.9em',
    color: '#4A90E2',
    textDecoration: 'none',
    margin: '0 5px',
    cursor: 'pointer',
  },
  linkSeparator: {
    color: '#888', // Separator color
  },
};
