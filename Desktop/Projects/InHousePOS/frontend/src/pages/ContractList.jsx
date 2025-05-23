import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiSearch, 
  FiRefreshCw, 
  FiChevronDown, 
  FiChevronUp,
  FiExternalLink,
  FiEdit2,
  FiEye
} from 'react-icons/fi';
import contractService from '../services/contractService';
import projectService from '../services/projectService';
import { format } from 'date-fns';
import './ContractList.css';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const contractsData = await contractService.getAll();
      setContracts(contractsData);
      
      // Skip project fetching if projectService is not available
      if (!projectService.getProjectById) {
        console.warn('Project service not available. Skipping project data fetch.');
        setProjects({});
        setError(null);
        return;
      }

      // Fetch projects for each contract
      const projectIds = [...new Set(contractsData.map(c => c.projectId).filter(Boolean))];
      const projectsData = await Promise.all(
        projectIds.map(id => 
          projectService.getProjectById(id).catch(() => null)
        )
      );
      
      const projectsMap = projectsData.reduce((acc, project) => {
        if (project) acc[project.id] = project;
        return acc;
      }, {});
      
      setProjects(projectsMap);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' 
      ? <FiChevronUp className="sort-icon" /> 
      : <FiChevronDown className="sort-icon" />;
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    switch (status.toLowerCase()) {
      case 'active': return 'status-badge status-active';
      case 'draft': return 'status-badge status-draft';
      case 'completed': return 'status-badge status-completed';
      case 'terminated':
      case 'expired': 
        return 'status-badge status-terminated';
      default: return 'status-badge';
    }
  };

  const filteredAndSortedContracts = useMemo(() => {
    let result = [...contracts].filter(contract => {
      const project = projects[contract.projectId] || {};
      const matchesSearch = 
        (contract.contractNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (contract.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (project?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (contract.status?.toLowerCase() === statusFilter.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const projectA = projects[a.projectId] || {};
        const projectB = projects[b.projectId] || {};
        
        let valueA, valueB;
        
        if (sortConfig.key === 'projectName') {
          valueA = projectA.name || '';
          valueB = projectB.name || '';
        } else if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          valueA = projectA[sortConfig.key] || '';
          valueB = projectB[sortConfig.key] || '';
        } else {
          valueA = a[sortConfig.key] || '';
          valueB = b[sortConfig.key] || '';
        }

        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [contracts, projects, searchTerm, statusFilter, sortConfig]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <div className="header-left">
          <h1>Contracts</h1>
          <p>Manage all your contracts in one place</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData}>
            <FiRefreshCw className="btn-icon" />
            Refresh
          </button>
          <Link to="/contracts/new" className="btn btn-primary">
            <FiPlus className="btn-icon" />
            New Contract
          </Link>
        </div>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="table-container">
        <table className="contracts-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('contractNumber')}>
                <div className="th-content">
                  Contract # {getSortIcon('contractNumber')}
                </div>
              </th>
              <th onClick={() => requestSort('projectName')}>
                <div className="th-content">
                  Project {getSortIcon('projectName')}
                </div>
              </th>
              <th onClick={() => requestSort('clientName')}>
                <div className="th-content">
                  Client {getSortIcon('clientName')}
                </div>
              </th>
              <th onClick={() => requestSort('startDate')}>
                <div className="th-content">
                  Start Date {getSortIcon('startDate')}
                </div>
              </th>
              <th onClick={() => requestSort('endDate')}>
                <div className="th-content">
                  End Date {getSortIcon('endDate')}
                </div>
              </th>
              <th onClick={() => requestSort('status')}>
                <div className="th-content">
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedContracts.length > 0 ? (
              filteredAndSortedContracts.map((contract) => {
                const project = projects[contract.projectId] || {};
                return (
                  <tr key={contract.id}>
                    <td>
                      <Link to={`/contracts/${contract.id}`} className="contract-link">
                        <FiExternalLink className="link-icon" />
                        {contract.contractNumber || `CONTRACT-${String(contract.id).padStart(6, '0')}`}
                      </Link>
                    </td>
                    <td>{project?.name || 'N/A'}</td>
                    <td>{contract.clientName || 'N/A'}</td>
                    <td className="date-cell">{project?.startDate ? formatDate(project.startDate) : 'N/A'}</td>
                    <td className="date-cell">{project?.endDate ? formatDate(project.endDate) : 'N/A'}</td>
                    <td>
                      <span className={getStatusBadgeClass(contract.status)}>
                        {contract.status || 'N/A'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link 
                        to={`/contracts/${contract.id}`}
                        className="action-btn view-btn"
                        title="View contract"
                      >
                        <FiEye />
                      </Link>
                      <Link
                        to={`/contracts/${contract.id}/edit`}
                        className="action-btn edit-btn"
                        title="Edit contract"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking edit
                        }}
                      >
                        <FiEdit2 />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No contracts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractList;