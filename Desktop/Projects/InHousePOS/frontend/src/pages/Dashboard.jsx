import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import projectService from '../services/projectService';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching projects...');
        const data = await projectService.getProjects();
        console.log('Projects data received:', data);
        
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Unexpected data format:', data);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load projects. Please try again later.';
        console.error('Error fetching projects:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Calculate statistics from projects
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalRevenue: projects
      .filter(p => p.budget)
      .reduce((sum, project) => sum + parseFloat(project.budget || 0), 0)
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  };

  console.log('Calculated stats:', stats);

  // Get recent projects (limit to 5 most recent)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  console.log('Recent projects:', recentProjects);

  const getStatusInfo = (status) => {
    if (!status) return { text: 'Unknown', class: 'draft' };
    
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'in progress':
        return { text: 'In Progress', class: 'in-progress' };
      case 'completed':
        return { text: 'Completed', class: 'completed' };
      case 'cancelled':
        return { text: 'Cancelled', class: 'cancelled' };
      case 'draft':
      default:
        return { text: 'Draft', class: 'draft' };
    }
  };

  const calculateProgress = (project) => {
    if (!project) return 0;
    if (project.status === 'completed') return 100;
    if (project.status === 'in_progress' || project.status === 'In Progress') return 50;
    if (project.status === 'draft') return 10;
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid Date';
    }
  };

  const handleProjectClick = (projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="welcome-message">
          Welcome back, {user?.username || 'User'}!
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <div className="stat-value">{stats.totalProjects}</div>
        </div>
        <div className="stat-card">
          <h3>Active Projects</h3>
          <div className="stat-value">{stats.activeProjects}</div>
        </div>
        <div className="stat-card">
          <h3>Completed Projects</h3>
          <div className="stat-value">{stats.completedProjects}</div>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{stats.totalRevenue}</div>
        </div>
      </div>

      <div className="recent-projects">
        <h2>Recent Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="no-projects">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => {
                  if (!project) return null;
                  
                  const statusInfo = getStatusInfo(project.status);
                  const progress = calculateProgress(project);
                  
                  return (
                    <tr 
                      key={project.id || Math.random()} 
                      className="project-row"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="project-name">{project.name || 'Unnamed Project'}</td>
                      <td>{project.clientName || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td>
                        <div className="progress-container">
                          <div 
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                          ></div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                      </td>
                      <td>{formatDate(project.updatedAt || project.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;