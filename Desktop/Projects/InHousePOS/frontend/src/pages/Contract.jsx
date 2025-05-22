import React from 'react';
import { useParams } from 'react-router-dom';
import './Contract.css';

const Contract = () => {
  const { id } = useParams();

  return (
    <div className="contract-page">
      <div className="contract-header">
        <h1>Contract Details</h1>
        <div className="contract-id">Contract ID: {id}</div>
      </div>
      
      <div className="contract-content">
        <div className="contract-section">
          <h2>Project Information</h2>
          <div className="contract-details">
            <div className="detail-item">
              <span className="label">Project Name:</span>
              <span className="value">Project Name</span>
            </div>
            <div className="detail-item">
              <span className="label">Client:</span>
              <span className="value">Client Name</span>
            </div>
            <div className="detail-item">
              <span className="label">Contract Date:</span>
              <span className="value">Date</span>
            </div>
          </div>
        </div>

        <div className="contract-section">
          <h2>Terms and Conditions</h2>
          <div className="terms-content">
            <p>
              These are the terms and conditions of the contract. This section will
              contain the detailed terms and conditions agreed upon by both parties.
            </p>
          </div>
        </div>

        <div className="contract-section">
          <h2>Payment Terms</h2>
          <div className="payment-details">
            <div className="detail-item">
              <span className="label">Total Amount:</span>
              <span className="value">$0.00</span>
            </div>
            <div className="detail-item">
              <span className="label">Payment Terms:</span>
              <span className="value">Terms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-actions">
        <button className="action-button primary">Download PDF</button>
        <button className="action-button secondary">Edit Contract</button>
      </div>
    </div>
  );
};

export default Contract;