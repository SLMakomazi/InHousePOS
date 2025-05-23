import React from 'react';
import { FiFileText, FiDollarSign, FiCalendar, FiUser, FiMail, FiPhone, FiInfo } from 'react-icons/fi';

const ContractForm = ({
  formData,
  errors = {},
  onChange,
  onSubmit,
  loading = false,
  submitText = 'Save Contract',
  projects = []
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Contract Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Selection */}
          <div className="col-span-2">
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId || ''}
              onChange={onChange}
              className={`block w-full rounded-md shadow-sm ${errors.projectId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
              disabled={loading || projects.length === 0}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
          </div>


          {/* Contract Number */}
          <div>
            <label htmlFor="contractNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Contract Number
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="contractNumber"
                id="contractNumber"
                value={formData.contractNumber || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.contractNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="CTR-2023-001"
                disabled={loading}
              />
            </div>
            {errors.contractNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.contractNumber}</p>
            )}
          </div>

          {/* Contract Value */}
          <div>
            <label htmlFor="contractValue" className="block text-sm font-medium text-gray-700 mb-1">
              Contract Value
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="contractValue"
                id="contractValue"
                value={formData.contractValue || ''}
                onChange={onChange}
                min="0"
                step="0.01"
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.contractValue ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.contractValue && (
              <p className="mt-1 text-sm text-red-600">{errors.contractValue}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                disabled={loading}
              />
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate || ''}
                onChange={onChange}
                min={formData.startDate || ''}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.endDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                disabled={loading || !formData.startDate}
              />
            </div>
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>

          {/* Payment Terms */}
          <div className="col-span-2">
            <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3">
                <FiInfo className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="paymentTerms"
                id="paymentTerms"
                rows="3"
                value={formData.paymentTerms || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.paymentTerms ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="Payment terms and conditions..."
                disabled={loading}
              />
            </div>
            {errors.paymentTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentTerms}</p>
            )}
          </div>
        </div>
      </div>

      {/* Client Information Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Client Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="clientName"
                id="clientName"
                value={formData.clientName || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.clientName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
            )}
          </div>

          {/* Client Email */}
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Client Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="clientEmail"
                id="clientEmail"
                value={formData.clientEmail || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.clientEmail ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="client@example.com"
                disabled={loading}
              />
            </div>
            {errors.clientEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
            )}
          </div>

          {/* Client Contact */}
          <div>
            <label htmlFor="clientContact" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="clientContact"
                id="clientContact"
                value={formData.clientContact || ''}
                onChange={onChange}
                className={`block w-full pl-10 sm:text-sm rounded-md ${errors.clientContact ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </div>
            {errors.clientContact && (
              <p className="mt-1 text-sm text-red-600">{errors.clientContact}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contract Terms Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Contract Terms
        </h3>
        
        <div className="space-y-6">
          {/* Scope of Work */}
          <div>
            <label htmlFor="scopeOfWork" className="block text-sm font-medium text-gray-700 mb-1">
              Scope of Work
            </label>
            <textarea
              name="scopeOfWork"
              id="scopeOfWork"
              rows="4"
              value={formData.scopeOfWork || ''}
              onChange={onChange}
              className={`block w-full shadow-sm sm:text-sm rounded-md ${errors.scopeOfWork ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="Describe the scope of work in detail..."
              disabled={loading}
            />
            {errors.scopeOfWork && (
              <p className="mt-1 text-sm text-red-600">{errors.scopeOfWork}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div>
            <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              name="termsAndConditions"
              id="termsAndConditions"
              rows="4"
              value={formData.termsAndConditions || ''}
              onChange={onChange}
              className={`block w-full shadow-sm sm:text-sm rounded-md ${errors.termsAndConditions ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="Additional terms and conditions..."
              disabled={loading}
            />
            {errors.termsAndConditions && (
              <p className="mt-1 text-sm text-red-600">{errors.termsAndConditions}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default ContractForm;
