import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="loading">Loading project details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="error">Project not found</div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-header">
        <h1>{project.projectName}</h1>
        <div className="project-status">
          <span className={`status-badge ${project.status.toLowerCase()}`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="project-info">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Client:</span>
            <span className="value">{project.client}</span>
          </div>
          <div className="info-item">
            <span className="label">Start Date:</span>
            <span className="value">{project.startDate}</span>
          </div>
          <div className="info-item">
            <span className="label">End Date:</span>
            <span className="value">{project.endDate}</span>
          </div>
          <div className="info-item">
            <span className="label">Budget:</span>
            <span className="value">R{project.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="project-description">
        <h2>Description</h2>
        <p>{project.description}</p>
      </div>

      <div className="project-actions">
        <button className="edit-btn">Edit Project</button>
        <button className="delete-btn">Delete Project</button>
      </div>

      <div className="project-tasks">
        <h2>Tasks</h2>
        <div className="tasks-list">
          {project.tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status-badge ${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-details">
                <p>{task.description}</p>
                <div className="task-meta">
                  <span>Due: {task.dueDate}</span>
                  <span>Priority: {task.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="project-team">
        <h2>Team Members</h2>
        <div className="team-list">
          {project.team.map((member) => (
            <div key={member.id} className="team-member">
              <div className="member-avatar">
                <img src={member.avatar} alt={`${member.name} avatar`} />
              </div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-role">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;