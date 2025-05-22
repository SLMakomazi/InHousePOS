import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    client: ''
  });

  // Status options based on database schema
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleFilter = (type, value) => {
    const newFilters = {
      ...filters,
      [type]: value
    };
    
    setFilters(newFilters);

    const filtered = projects.filter(project => {
      const matchesStatus = !newFilters.status || project.status === newFilters.status;
      const matchesClient = !newFilters.client || 
        (project.clientName && project.clientName.toLowerCase().includes(newFilters.client.toLowerCase()));
      
      return matchesStatus && matchesClient;
    });

    setFilteredProjects(filtered);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleViewProject = (id) => {
    navigate(`/projects/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'draft':
      default:
        return 'status-draft';
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="create-btn" onClick={handleCreateProject}>
          Create New Project
        </button>
      </div>

      <div className="projects-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select 
            id="statusFilter" 
            value={filters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="clientFilter">Client:</label>
          <input
            type="text"
            id="clientFilter"
            placeholder="Filter by client name"
            value={filters.client}
            onChange={(e) => handleFilter('client', e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id}
                  className="project-row"
                  onClick={() => handleViewProject(project.id)}
                >
                  <td className="project-name">{project.name}</td>
                  <td>{project.clientName || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{formatDate(project.startDate)}</td>
                  <td>{formatDate(project.endDate)}</td>
                  <td>
                    {project.budget ? 
                      new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      }).format(project.budget) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Projects;