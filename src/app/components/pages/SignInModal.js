"use client";
import React from 'react';
import { useRouter } from 'next/router'; // Import the router

const SignInModal = ({ isOpen, onClose }) => {


  if (!isOpen) return null;

  const handleRedirect = () => {
    onClose();
    router.push('/dashboard'); // Redirect to dashboard or any other page after closing the modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Sign In Successful</h1>
        <p>Welcome to the system.</p>
        <button onClick={handleRedirect}>Go to Dashboard</button>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          width: 300px;
        }

        button {
          padding: 10px 20px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SignInModal;
