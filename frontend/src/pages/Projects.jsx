import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));

    const filtered = projects.filter(project => {
      const matchesStatus = !filters.status || project.status === filters.status;
      const matchesClient = !filters.client || 
        project.client.toLowerCase().includes(filters.client.toLowerCase());
      
      return matchesStatus && matchesClient;
    });

    setFilteredProjects(filtered);
  };

  const handleCreateProject = () => {
    navigate('/new-project');
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <div className="error">Error: {error}</div>
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
            <option value="">All</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="clientFilter">Client:</label>
          <input
            type="text"
            id="clientFilter"
            value={filters.client}
            placeholder="Search by client..."
            onChange={(e) => handleFilter('client', e.target.value)}
          />
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <span className={`status-badge ${project.status.toLowerCase()}`}>
                {project.status}
              </span>
            </div>
            <div className="project-details">
              <div className="detail-item">
                <span className="label">Client:</span>
                <span className="value">{project.client}</span>
              </div>
              <div className="detail-item">
                <span className="label">Budget:</span>
                <span className="value">R{project.budget.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Start Date:</span>
                <span className="value">{project.startDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">End Date:</span>
                <span className="value">{project.endDate}</span>
              </div>
            </div>
            <div className="project-actions">
              <button 
                className="view-btn"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;