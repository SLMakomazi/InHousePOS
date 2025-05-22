import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import contractService from '../services/contractService';
import projectService from '../services/projectService';
import ContractTemplate from '../components/contracts/ContractTemplate';

const CreateContract = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    contractNumber: `CONTRACT-${Date.now().toString().slice(-6)}`,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    clientName: '',
    projectName: '',
    projectDescription: '',
    totalCost: '',
    paymentSchedule: {
      upfront: { percentage: 40 },
      installments: { count: 3, amount: 0 }
    },
    additionalTerms: ''
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState('');

  // Fetch projects if no projectId is provided
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects(); 
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      }
    };

    if (!projectId) {
      fetchProjects();
    }
  }, [projectId]);

  // If projectId is provided, fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      
      try {
        const project = await projectService.getProjectById(projectId); 
        setFormData(prev => ({
          ...prev,
          projectId: project.id,
          clientName: project.clientName || '',
          projectName: project.name || '',
          projectDescription: project.description || '',
          totalCost: project.budget || '',
          paymentSchedule: {
            ...prev.paymentSchedule,
            installments: {
              ...prev.paymentSchedule.installments,
              amount: project.budget ? (project.budget * 0.6) / 3 : 0
            }
          }
        }));
      } catch (err) {
        setError('Failed to load project details');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the contract content using the template
      const contractContent = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };
      
      await contractService.create(contractContent);
      navigate('/contracts');
    } catch (err) {
      setError('Failed to create contract');
      console.error('Error creating contract:', err);
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
          {projectId ? 'Create Contract' : 'Create New Contract'}
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
            {!projectId && (
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                  Select Project
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                    Upfront Payment (%)
                  </label>
                  <input
                    type="number"
                    id="upfront.percentage"
                    name="upfront.percentage"
                    value={formData.paymentSchedule.upfront.percentage}
                    onChange={handlePaymentScheduleChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="installments.count" className="block text-sm font-medium text-gray-700">
                    Number of Installments
                  </label>
                  <input
                    type="number"
                    id="installments.count"
                    name="installments.count"
                    value={formData.paymentSchedule.installments.count}
                    onChange={handlePaymentScheduleChange}
                    min="0"
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/contracts')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Contract
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-6">Contract Preview</h2>
          <div className="border rounded-lg overflow-hidden">
            <ContractTemplate
              contractNumber={formData.contractNumber}
              effectiveDate={new Date(formData.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              clientName={formData.clientName}
              projectName={formData.projectName}
              projectDescription={formData.projectDescription}
              totalCost={parseFloat(formData.totalCost) || 0}
              paymentSchedule={{
                upfront: formData.paymentSchedule.upfront,
                installments: {
                  ...formData.paymentSchedule.installments,
                  amount: (parseFloat(formData.totalCost) * (1 - formData.paymentSchedule.upfront.percentage / 100)) / 
                          (formData.paymentSchedule.installments.count || 1)
                }
              }}
              additionalTerms={formData.additionalTerms}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContract;
