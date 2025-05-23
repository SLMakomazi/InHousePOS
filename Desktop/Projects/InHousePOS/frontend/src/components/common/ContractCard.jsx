import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiDollarSign, FiCalendar, FiUser, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

const statusStyles = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  terminated: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

const ContractCard = ({ contract }) => {
  const formattedStartDate = contract.startDate ? format(new Date(contract.startDate), 'MMM d, yyyy') : 'N/A';
  const formattedEndDate = contract.endDate ? format(new Date(contract.endDate), 'MMM d, yyyy') : 'N/A';
  const status = contract.status?.toLowerCase() || 'draft';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {contract.contractNumber || 'Contract #' + contract.id}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {contract.projectName || 'No project name'}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <div className="border-b border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">Contract Value</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {contract.contractValue ? `$${parseFloat(contract.contractValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
              </dd>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <FiCalendar className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formattedStartDate} - {formattedEndDate}
              </dd>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Client Information</h4>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiUser className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">{contract.clientName || 'N/A'}</p>
              <div className="flex items-center text-sm text-gray-500">
                <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">{contract.clientEmail || 'No email'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span>{contract.clientContact || 'No phone'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Created </span>
            <span className="font-medium text-gray-900">
              {contract.createdAt ? format(new Date(contract.createdAt), 'MMM d, yyyy') : 'N/A'}
            </span>
          </div>
          <Link 
            to={`/contracts/${contract.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View contract <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
