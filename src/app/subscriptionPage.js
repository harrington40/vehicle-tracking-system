"use client";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import './subscriptionPage.css';

const plans = [
  { id: 1, name: 'Basic Plan', description: 'Basic tracking for one vehicle', price: 15, duration: 'Monthly' },
  { id: 2, name: 'Standard Plan', description: 'Tracking for up to 3 vehicles with alerts', price: 40, duration: 'Monthly' },
  { id: 3, name: 'Premium Plan', description: 'Unlimited vehicle tracking with full analytics', price: 100, duration: 'Monthly' },
  { id: 4, name: 'Annual Premium Plan', description: 'Full analytics and tracking for the entire year', price: 1000, duration: 'Yearly' },
];

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Use useNavigate for programmatic navigation

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleProceedToPayment = () => {
    if (selectedPlan) {
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan)); // Save selected plan to local storage
      setShowModal(false); // Close the modal
      navigate("/payment"); // Programmatically navigate to the payment page
    }
  };

  return (
    <div className="subscription-page">
      <h1>Choose Your Subscription Plan</h1>
      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`} 
            onClick={() => handlePlanSelect(plan)}
          >
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <p><strong>${plan.price} / {plan.duration}</strong></p>
            <button 
              className="select-btn" 
              onClick={() => handlePlanSelect(plan)}
            >
              {selectedPlan?.id === plan.id ? 'Selected' : 'Select'}
            </button>
          </div>
        ))}
      </div>

      <div className="summary">
        {selectedPlan ? (
          <>
            <h3>Selected Plan:</h3>
            <p><strong>{selectedPlan.name}</strong> - ${selectedPlan.price} / {selectedPlan.duration}</p>
            <button className="btn proceed-btn" onClick={() => setShowModal(true)}>
              Proceed to Payment
            </button>
          </>
        ) : (
          <p>Please select a plan to continue.</p>
        )}
      </div>

      {showModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Your Subscription</h3>
            <p>You're about to subscribe to the <strong>{selectedPlan.name}</strong> plan for <strong>${selectedPlan.price} / {selectedPlan.duration}</strong>.</p>
            <p>Once you confirm, you’ll be redirected to the payment page to complete your subscription.</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleProceedToPayment}>
                Confirm and Pay
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
