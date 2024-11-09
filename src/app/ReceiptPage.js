"use client";
import React from 'react';
import './ReceiptPage.css';

const ReceiptPage = () => {
  const items = [
    { id: 4, description: "Youtube channel", details: "Useful videos to improve your Javascript skills. Subscribe and stay tuned :)", hourPrice: 0, hours: 100, total: 0 },
    { id: 1, description: "Website Design", details: "Creating a recognizable design solution based on the company's existing visual identity", hourPrice: 40, hours: 30, total: 1200 },
    { id: 2, description: "Website Development", details: "Developing a Content Management System-based Website", hourPrice: 40, hours: 80, total: 3200 },
    { id: 3, description: "Search Engines Optimization", details: "Optimize the site for search engines (SEO)", hourPrice: 40, hours: 20, total: 800 }
  ];

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.25;
  const grandTotal = subtotal + tax;

  return (
    <div className="receipt-page">
      <div className="header">
        <div className="company-info">
          <h2>Arboshiki</h2>
          <p>455 Foggy Heights, AZ 85004, US</p>
          <p>(123) 456-789</p>
          <p>company@example.com</p>
        </div>
        <div className="invoice-info">
          <h3>INVOICE 3-2-1</h3>
          <p>Date of Invoice: 01/10/2018</p>
          <p>Due Date: 30/10/2018</p>
        </div>
      </div>
      <div className="invoice-to">
        <h4>INVOICE TO:</h4>
        <p>John Doe</p>
        <p>796 Silver Harbour, TX 79273, US</p>
        <p>john@example.com</p>
      </div>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Hour Price</th>
            <th>Hours</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="item-id">{item.id}</td>
              <td>
                <strong>{item.description}</strong><br />
                <span className="details">{item.details}</span>
              </td>
              <td>${item.hourPrice.toFixed(2)}</td>
              <td>{item.hours}</td>
              <td className="item-total">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="totals">
        <p>SUBTOTAL: <span>${subtotal.toFixed(2)}</span></p>
        <p>TAX 25%: <span>${tax.toFixed(2)}</span></p>
        <hr />
        <p className="grand-total">GRAND TOTAL: <span>${grandTotal.toFixed(2)}</span></p>
      </div>
      <p className="thank-you">Thank you!</p>
    </div>
  );
};

export default ReceiptPage;
