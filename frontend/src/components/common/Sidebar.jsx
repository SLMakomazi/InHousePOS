import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/projects', icon: '📁', label: 'Projects' },
    { path: '/new-project', icon: '➕', label: 'New Project' },
    { path: '/contracts', icon: '📄', label: 'Contracts' },
    { path: '/invoices', icon: '💰', label: 'Invoices' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>In-House POS</h2>
        {user && (
          <div className="user-info">
            <span>{user.username}</span>
            <span className="user-role">{user.role}</span>
          </div>
        )}
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link to={item.path} className="nav-link">
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;