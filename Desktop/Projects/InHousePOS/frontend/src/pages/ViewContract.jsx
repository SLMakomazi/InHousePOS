import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import contractService from '../services/contractService';
import projectService from '../services/projectService';
import { FiArrowLeft, FiDownload, FiEdit2, FiTrash2, FiExternalLink, FiDollarSign, FiCalendar, FiFileText, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './ViewContract.css';

const ViewContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch contract data
        const contractData = await contractService.getById(id);
        setContract(contractData);
        
        // If contract has a projectId, fetch project data
        if (contractData.projectId) {
          try {
            const projectData = await projectService.getProjectById(contractData.projectId);
            setProject(projectData);
          } catch (projectErr) {
            console.warn('Error fetching project:', projectErr);
            // Continue even if project fetch fails
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching contract:', err);
        setError('Failed to load contract. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Use the API directly to get the PDF with proper response type
      const response = await contractService.getPDF(id, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract-${contract?.contractNumber || id}.pdf`;
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (err) {
      console.error('Failed to download contract:', err);
      let errorMessage = 'Failed to download contract. Please try again.';
      
      // Try to extract error message from blob response if available
      if (err.response?.data?.type?.includes('application/json')) {
        try {
          const errorText = await new Response(err.response.data).text();
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      } else if (err.response?.data?.type?.includes('text/plain')) {
        errorMessage = await new Response(err.response.data).text();
      }
      
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        await contractService.deleteContract(id);
        navigate('/contracts', { state: { message: 'Contract deleted successfully' } });
      } catch (err) {
        console.error('Failed to delete contract:', err);
        setError('Failed to delete contract. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading contract details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/contracts')} 
          className="btn btn-secondary"
        >
          Back to Contracts
        </button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="not-found">
        <h2>Contract Not Found</h2>
        <p>The requested contract could not be found.</p>
        <Link to="/contracts" className="btn btn-primary">
          Back to Contracts
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="view-contract">
      <div className="contract-header">
        <Link to="/contracts" className="back-link">
          <FiArrowLeft /> Back to Contracts
        </Link>
        
        <div className="header-actions">
          <button 
            onClick={handleDownload} 
            className="btn btn-secondary"
            disabled={downloading}
          >
            <FiDownload /> {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <Link 
            to={`/contracts/${id}/edit`}
            className="btn btn-primary"
          >
            <FiEdit2 /> Edit Contract
          </Link>
        </div>
      </div>

      <div className="contract-card">
        <div className="contract-card-header">
          <div>
            <h1>
              {contract.contractNumber || `CONTRACT-${String(contract.id).padStart(6, '0')}`}
            </h1>
            <div className="contract-meta">
              <span className="meta-item">
                <FiCalendar className="meta-icon" />
                Created: {formatDate(contract.createdAt)}
              </span>
              <span className="meta-item">
                <FiCalendar className="meta-icon" />
                Effective: {formatDate(contract.effectiveDate || contract.startDate)}
              </span>
            </div>
          </div>
          <span className={`status-badge ${contract.status?.toLowerCase() || 'draft'}`}>
            {contract.status || 'Draft'}
          </span>
        </div>

        <div className="contract-details">
          {/* Client Information */}
          <div className="detail-section">
            <h3><FiUser /> Client Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Client Name</span>
                <span className="detail-value">{contract.clientName || 'N/A'}</span>
              </div>
              
              {contract.clientEmail && (
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">
                    <a href={`mailto:${contract.clientEmail}`} className="contact-link">
                      <FiMail /> {contract.clientEmail}
                    </a>
                  </span>
                </div>
              )}
              
              {contract.clientPhone && (
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    <a href={`tel:${contract.clientPhone}`} className="contact-link">
                      <FiPhone /> {contract.clientPhone}
                    </a>
                  </span>
                </div>
              )}
              
              {contract.clientAddress && (
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">
                    <FiMapPin className="contact-icon" /> {contract.clientAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="detail-section">
            <h3><FiFileText /> Project Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Project Name</span>
                <span className="detail-value">
                  {project ? (
                    <Link to={`/projects/${project.id}`} className="project-link">
                      {project.name} <FiExternalLink size={14} />
                    </Link>
                  ) : (
                    contract.title || 'N/A'
                  )}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">
                  {formatDate(contract.startDate || contract.effectiveDate)}
                </span>
              </div>
              
              {(contract.endDate || project?.endDate) && (
                <div className="detail-item">
                  <span className="detail-label">End Date</span>
                  <span className="detail-value">
                    {formatDate(contract.endDate || project?.endDate)}
                  </span>
                </div>
              )}
              
              <div className="detail-item">
                <span className="detail-label">Total Contract Value</span>
                <span className="detail-value amount">
                  {formatCurrency(contract.totalCost || 0)}
                </span>
              </div>
            </div>
            
            {contract.description && (
              <div className="detail-item full-width">
                <span className="detail-label">Description</span>
                <div className="description">
                  {contract.description}
                </div>
              </div>
            )}
          </div>

          {/* Payment Schedule */}
          {contract.paymentSchedule && (
            <div className="detail-section">
              <h3><FiDollarSign /> Payment Schedule</h3>
              <div className="payment-schedule">
                {/* Upfront Payment */}
                {contract.paymentSchedule.upfront?.amount > 0 && (
                  <div className="payment-item">
                    <div className="payment-header">
                      <span className="payment-title">Upfront Payment</span>
                      <span className="payment-amount">
                        {formatCurrency(contract.paymentSchedule.upfront.amount)}
                        {contract.paymentSchedule.upfront.percentage && (
                          <span className="payment-percentage">
                            ({contract.paymentSchedule.upfront.centage}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="payment-due">
                      Due: {formatDate(contract.effectiveDate || contract.startDate)}
                    </div>
                  </div>
                )}
                
                {/* Installments */}
                {contract.paymentSchedule.installments?.count > 0 && (
                  <div className="payment-item">
                    <div className="payment-header">
                      <span className="payment-title">
                        {contract.paymentSchedule.installments.count} Installment{contract.paymentSchedule.installments.count > 1 ? 's' : ''}
                      </span>
                      <span className="payment-amount">
                        {formatCurrency(contract.paymentSchedule.installments.amount)} each
                      </span>
                    </div>
                    {contract.paymentSchedule.installmentDates?.length > 0 ? (
                      <div className="installment-dates">
                        {contract.paymentSchedule.installmentDates.map((date, index) => (
                          <div key={index} className="installment-date">
                            Installment {index + 1}: {formatDate(date)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="payment-due">
                        First installment due: {formatDate(contract.startDate)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Terms */}
          {contract.additionalTerms && (
            <div className="detail-section">
              <h3>Additional Terms & Conditions</h3>
              <div className="terms">
                {contract.additionalTerms}
              </div>
            </div>
          )}
        </div>

        <div className="contract-actions">
          <button 
            onClick={handleDelete} 
            className="btn btn-danger"
            disabled={downloading}
          >
            <FiTrash2 /> Delete Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContract;
