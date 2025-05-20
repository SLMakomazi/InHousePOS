import React from 'react';
import { useAuth } from '../context/authContext.js';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalProjects: 15,
    activeProjects: 8,
    completedProjects: 7,
    totalRevenue: '$25,000',
    recentProjects: [
      {
        id: 1,
        name: 'Project Alpha',
        status: 'Active',
        progress: 60,
        lastUpdated: '2025-05-20'
      },
      {
        id: 2,
        name: 'Project Beta',
        status: 'Completed',
        progress: 100,
        lastUpdated: '2025-05-15'
      },
      {
        id: 3,
        name: 'Project Gamma',
        status: 'In Progress',
        progress: 30,
        lastUpdated: '2025-05-18'
      }
    ]
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="welcome-message">
          Welcome back, {user?.username}!
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
        <div className="projects-list">
          {stats.recentProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>
              <div className="project-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${project.progress}%` }}
                  >
                    {project.progress}%
                  </div>
                </div>
              </div>
              <div className="project-meta">
                <span>Last Updated: {project.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;