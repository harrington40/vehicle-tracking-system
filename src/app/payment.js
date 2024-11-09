"use client";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../app/payment.css';

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate(); // Use useNavigate for programmatic navigation

  useEffect(() => {
    const plan = JSON.parse(localStorage.getItem("selectedPlan"));
    setSelectedPlan(plan);
  }, []);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    console.log("Payment submitted for plan:", selectedPlan?.name);
    
    // Logic for processing the payment goes here
    
    // Redirect to the receipt page after successful payment
    navigate('/receipt');
  };

  if (!selectedPlan) {
    return <p>Loading payment details...</p>;
  }

  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>

      <div className="payment-container">
        <form className="payment-form" onSubmit={handlePaymentSubmit}>
          <h2>Payment</h2>
          <div className="payment-option">
            <input type="radio" id="credit-card" name="paymentMethod" defaultChecked />
            <label htmlFor="credit-card">Credit Card</label>
          </div>

          <div className="credit-card-details">
            <label>Card Number</label>
            <input type="text" placeholder="Enter your card number" required />

            <label>Name on Card</label>
            <input type="text" placeholder="Enter name on card" required />

            <label>Expiry Date</label>
            <input type="text" placeholder="MM/YY" required />

            <label>CVV Code</label>
            <input type="text" placeholder="CVV" required />
          </div>

          <button type="submit" className="btn place-order-btn">Place Order</button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <p><strong>Plan:</strong> {selectedPlan.name}</p>
          <p><strong>Price:</strong> ${selectedPlan.price} / {selectedPlan.duration}</p>
          <hr />
          <p><strong>Total:</strong> ${selectedPlan.price}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
