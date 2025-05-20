import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import './MainLayout.css';

function MainLayout({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar onLogout={logout} />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;