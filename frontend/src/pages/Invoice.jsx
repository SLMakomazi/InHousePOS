import React from 'react';
import './Invoice.css';

const Invoice = () => {
  const sampleInvoice = {
    invoiceNumber: 'INV-2025-001',
    date: '2025-05-20',
    client: {
      name: 'Tech Solutions Inc.',
      address: '123 Business Street, Cape Town, South Africa',
      email: 'accounts@techsolutions.com'
    },
    items: [
      {
        id: 1,
        description: 'Software Development Services',
        quantity: 1,
        unitPrice: 5000,
        amount: 5000
      },
      {
        id: 2,
        description: 'Project Management',
        quantity: 1,
        unitPrice: 2000,
        amount: 2000
      },
      {
        id: 3,
        description: 'Consulting Services',
        quantity: 1,
        unitPrice: 1500,
        amount: 1500
      }
    ],
    subtotal: 8500,
    vat: 1475,
    total: 9975,
    paymentTerms: 'Net 30 days',
    dueDate: '2025-06-19'
  };

  return (
    <div className="invoice-page">
      <div className="invoice-header">
        <h1>Invoice</h1>
        <div className="invoice-info">
          <div className="invoice-number">Invoice No: {sampleInvoice.invoiceNumber}</div>
          <div className="invoice-date">Date: {sampleInvoice.date}</div>
        </div>
      </div>

      <div className="invoice-client">
        <h2>Billed To</h2>
        <div className="client-details">
          <div>{sampleInvoice.client.name}</div>
          <div>{sampleInvoice.client.address}</div>
          <div>{sampleInvoice.client.email}</div>
        </div>
      </div>

      <div className="invoice-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sampleInvoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>R{item.unitPrice.toLocaleString()}</td>
                <td>R{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-summary">
        <div className="summary-item">
          <span>Subtotal:</span>
          <span>R{sampleInvoice.subtotal.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span>VAT (17.5%):</span>
          <span>R{sampleInvoice.vat.toLocaleString()}</span>
        </div>
        <div className="summary-item total">
          <span>Total:</span>
          <span>R{sampleInvoice.total.toLocaleString()}</span>
        </div>
      </div>

      <div className="invoice-footer">
        <div className="payment-terms">
          <h3>Payment Terms</h3>
          <p>{sampleInvoice.paymentTerms}</p>
          <p>Due Date: {sampleInvoice.dueDate}</p>
        </div>
        <div className="actions">
          <button className="download-btn">Download PDF</button>
          <button className="email-btn">Send Email</button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;