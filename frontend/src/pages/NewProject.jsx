import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewProject.css';

const NewProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    status: 'Not Started'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!formData.client.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(formData.budget)) {
      newErrors.budget = 'Budget must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      navigate(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <div className="new-project-page">
      <h1>Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className={errors.projectName ? 'error' : ''}
          />
          {errors.projectName && <div className="error-message">{errors.projectName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="client">Client</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
            className={errors.client ? 'error' : ''}
          />
          {errors.client && <div className="error-message">{errors.client}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={errors.startDate ? 'error' : ''}
          />
          {errors.startDate && <div className="error-message">{errors.startDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={errors.endDate ? 'error' : ''}
          />
          {errors.endDate && <div className="error-message">{errors.endDate}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget (R)</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={errors.budget ? 'error' : ''}
          />
          {errors.budget && <div className="error-message">{errors.budget}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Create Project</button>
      </form>
    </div>
  );
};

export default NewProject;