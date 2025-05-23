import React from 'react';

const ContractTemplate = ({
  contractNumber,
  effectiveDate,
  clientName,
  projectName,
  projectDescription,
  totalCost,
  paymentSchedule,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="contract-template bg-white p-6 rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">DEVELOPMENT SERVICES AGREEMENT</h2>
        <p className="text-sm text-gray-600">Contract #{contractNumber}</p>
      </div>

      <div className="mb-6 border-b pb-4">
        <p className="text-sm">
          This Contract Agreement ("Agreement") is entered into on {effectiveDate || today} ("Effective Date") by and between 
          <span className="font-semibold"> [Your Company Name] </span> ("Developer") and 
          <span className="font-semibold"> {clientName || '[Client Name]'} </span> ("Client") 
          for the development and deployment of the {projectName || '[Project Name]'} ("Project").
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. Scope of Work</h3>
        <p className="text-sm mb-4">
          The Developer agrees to design, develop, and deploy the Project, including {projectDescription || '[brief project description]'}, 
          as outlined in the proposal dated {effectiveDate || today}.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2. Payment Terms</h3>
        <ul className="list-disc pl-5 text-sm space-y-2">
          <li>Total Project Cost: {formatCurrency(totalCost) || 'R 0.00'}</li>
          {paymentSchedule?.upfront && (
            <li>Upfront Payment: {paymentSchedule.upfront.percentage}% of {formatCurrency(totalCost)} = {formatCurrency(totalCost * (paymentSchedule.upfront.percentage / 100))} (due upon signing of this Agreement)</li>
          )}
          {paymentSchedule?.installments && paymentSchedule.installments.count > 0 && (
            <li>
              Installment Payments: {paymentSchedule.installments.count} monthly payments of {formatCurrency(paymentSchedule.installments.amount)} 
              ({formatCurrency(paymentSchedule.installments.count * paymentSchedule.installments.amount)} total)
            </li>
          )}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">3. Intellectual Property</h3>
        <p className="text-sm">
          The Developer retains ownership of the intellectual property rights to the Project, including any custom code, designs, 
          and other creative works. The Client is granted a non-exclusive license to use the Project for their business purposes.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">4. Maintenance and Support</h3>
        <p className="text-sm">
          The Developer may offer optional maintenance and support services, including updates, upgrades, and technical support, 
          for an additional fee.
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">5. Termination</h3>
        <p className="text-sm">
          Either party may terminate this Agreement upon written notice to the other party. Upon termination, the Client shall 
          pay the Developer for all work completed prior to termination.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">6. Governing Law</h3>
        <p className="text-sm">
          This Agreement shall be governed by and construed in accordance with the laws of South Africa.
        </p>
      </div>

      <div className="text-sm">
        <p className="mb-6">
          By signing below, the parties acknowledge that they have read, understand, and agree to be bound by the terms and 
          conditions of this Agreement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div>
            <h4 className="font-semibold border-b border-gray-300 pb-1 mb-2">Client Signature</h4>
            <div className="mb-2">{clientName || '[Client Name]'}</div>
            <div className="mt-6">
              <div className="border-t border-gray-400 pt-1">Signature: ______________________</div>
              <div className="mt-2">Date: ___________________________</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold border-b border-gray-300 pb-1 mb-2">Developer Signature</h4>
            <div className="mb-2">[Calvin Tech Solutions]</div>
            <div className="mt-6">
              <div className="border-t border-gray-400 pt-1">Signature: ______________________</div>
              <div className="mt-2">Date: ___________________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTemplate;
