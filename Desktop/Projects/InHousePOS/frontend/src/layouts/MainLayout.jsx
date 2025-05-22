import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import './MainLayout.css';

function MainLayout() {
  const { isAuthenticated, logout, loading, user: _user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = useCallback((isOpen) => {
    setIsSidebarOpen(isOpen !== undefined ? isOpen : prev => !prev);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="main-layout">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={logout}
      />
      <div className={`dropdown-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>
      <div className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;