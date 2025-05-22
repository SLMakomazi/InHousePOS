import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Navbar.css';

const Navbar = ({ onLogout, isSidebarOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const navbarRef = useRef(null);

  // Handle click outside to close sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        toggleSidebar(false);
      }
    }

    // Only add event listener if sidebar is open
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <div className="navbar-wrapper" ref={navbarRef}>
      <nav className="navbar">
        <div className="navbar-section navbar-left">
          <button 
            className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`} 
            onClick={() => toggleSidebar(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
        <div className="navbar-section navbar-center">
          <Link to="/" className="navbar-logo">
            In-House POS
          </Link>
        </div>
        <div className="navbar-section navbar-right">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <button onClick={onLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;