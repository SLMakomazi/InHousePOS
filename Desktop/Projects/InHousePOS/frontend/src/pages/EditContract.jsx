import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import contractService from '../services/contractService';

const EditContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    projectId: '',
    contractNumber: '',
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    clientName: '',
    projectName: '',
    projectDescription: '',
    totalCost: '',
    paymentSchedule: {
      upfront: { percentage: 40, amount: 0 },
      installments: { count: 3, amount: 0 }
    },
    additionalTerms: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch contract data when component mounts
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const contract = await contractService.getById(id);
        
        // Format the contract data for the form
        setFormData({
          ...contract,
          projectId: contract.project?.id || '',
          projectName: contract.title || contract.projectName || '',
          projectDescription: contract.description || '',
          totalCost: contract.totalCost || '',
          paymentSchedule: contract.paymentSchedule || {
            upfront: { percentage: 40, amount: 0 },
            installments: { count: 3, amount: 0 }
          },
          additionalTerms: contract.additionalTerms || ''
        });
        
        setError('');
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Failed to load contract. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentScheduleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      paymentSchedule: {
        ...prev.paymentSchedule,
        [parent]: {
          ...prev.paymentSchedule[parent],
          [child]: parseFloat(value) || 0
        }
      }
    }));
  };

  useEffect(() => {
    if (formData.totalCost) {
      const total = parseFloat(formData.totalCost);
      const upfrontAmount = total * 0.4; // Fixed 40% upfront
      const remainingAmount = total - upfrontAmount;
      const installmentAmount = remainingAmount / (formData.paymentSchedule.installments.count || 1);

      setFormData(prev => ({
        ...prev,
        paymentSchedule: {
          ...prev.paymentSchedule,
          upfront: { 
            ...prev.paymentSchedule.upfront,
            amount: upfrontAmount 
          },
          installments: {
            ...prev.paymentSchedule.installments,
            amount: parseFloat(installmentAmount.toFixed(2))
          }
        }
      }));
    }
  }, [formData.totalCost, formData.paymentSchedule.installments.count]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const contractData = {
        contractNumber: formData.contractNumber,
        title: formData.projectName || 'Project Contract',
        description: formData.projectDescription || '',
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        clientAddress: formData.clientAddress || '',
        effectiveDate: formData.effectiveDate,
        startDate: formData.effectiveDate,
        totalCost: parseFloat(formData.totalCost) || 0,
        paymentSchedule: {
          upfront: {
            percentage: 40,
            amount: parseFloat(formData.paymentSchedule.upfront.amount) || 0
          },
          installments: {
            count: parseInt(formData.paymentSchedule.installments.count) || 0,
            amount: parseFloat(formData.paymentSchedule.installments.amount) || 0
          }
        },
        additionalTerms: formData.additionalTerms || '',
        status: 'draft'
      };
      
      await contractService.update(id, contractData);
      
      // Show success message and navigate to view contract
      alert('Contract updated successfully!');
      navigate(`/contracts/${id}`);
    } catch (error) {
      console.error('Error updating contract:', error);
      setError(error.message || 'Failed to update contract');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Contract
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">Contract Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contractNumber" className="block text-sm font-medium text-gray-700">
                  Contract Number
                </label>
                <input
                  type="text"
                  id="contractNumber"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                Project Description
              </label>
              <textarea
                id="projectDescription"
                name="projectDescription"
                rows="3"
                value={formData.projectDescription}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">
                Total Project Cost (ZAR)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R</span>
                </div>
                <input
                  type="number"
                  id="totalCost"
                  name="totalCost"
                  value={formData.totalCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Payment Schedule</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="upfront.percentage" className="block text-sm font-medium text-gray-700">
                    Upfront Payment (40%)
                  </label>
                  <input
                    type="number"
                    id="upfront.percentage"
                    name="upfront.percentage"
                    value={40}
                    readOnly
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Amount: R{formData.paymentSchedule?.upfront?.amount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div>
                  <label htmlFor="installments.count" className="block text-sm font-medium text-gray-700">
                    Number of Installments
                  </label>
                  <input
                    type="number"
                    id="installments.count"
                    name="installments.count"
                    value={formData.paymentSchedule?.installments?.count || 0}
                    onChange={handlePaymentScheduleChange}
                    min="0"
                    max="12"
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Amount per installment: R{formData.paymentSchedule?.installments?.amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="additionalTerms" className="block text-sm font-medium text-gray-700">
                Additional Terms & Conditions
              </label>
              <textarea
                id="additionalTerms"
                name="additionalTerms"
                rows="4"
                value={formData.additionalTerms}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-6">Contract Preview</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-2">{formData.projectName || 'Project Contract'}</h3>
            <p className="text-sm text-gray-600 mb-4">Contract #{formData.contractNumber}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Client:</h4>
                <p>{formData.clientName || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Project:</h4>
                <p>{formData.projectName || 'N/A'}</p>
                {formData.projectDescription && (
                  <p className="text-sm text-gray-600 mt-1">{formData.projectDescription}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium">Payment Schedule:</h4>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Upfront Payment (40%):</span>
                    <span>R{formData.paymentSchedule?.upfront?.amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  {formData.paymentSchedule?.installments?.count > 0 && (
                    <div>
                      <div className="flex justify-between">
                        <span>{formData.paymentSchedule.installments.count} Installments of:</span>
                        <span>R{formData.paymentSchedule.installments.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        (Total: R{(formData.paymentSchedule.installments.count * formData.paymentSchedule.installments.amount).toFixed(2)})
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                    <span>Total:</span>
                    <span>R{formData.totalCost ? parseFloat(formData.totalCost).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
              
              {formData.additionalTerms && (
                <div>
                  <h4 className="font-medium">Additional Terms:</h4>
                  <p className="whitespace-pre-line text-sm text-gray-600">{formData.additionalTerms}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditContract;
