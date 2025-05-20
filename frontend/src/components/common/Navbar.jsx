import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          In-House POS
        </Link>
      </div>
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">
          Dashboard
        </Link>
        <Link to="/projects" className="navbar-item">
          Projects
        </Link>
        <Link to="/new-project" className="navbar-item">
          New Project
        </Link>
      </div>
      <div className="navbar-user">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;