import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';

const Navbar = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-text">Patel's Tadka</Link>
      </div>

      {user && (
        <>
          <div className="navbar-links">
            <Link 
              to="/tasks" 
              className={isActiveRoute('/tasks') ? 'active' : ''}
            >
              Task Management
            </Link>
            <Link 
              to="/calendar"
              className={isActiveRoute('/calendar') ? 'active' : ''}
            >
              Calendar
            </Link>
            <Link 
              to="/messages"
              className={isActiveRoute('/messages') ? 'active' : ''}
            >
              Messages
            </Link>
            <Link 
              to="/analytics"
              className={isActiveRoute('/analytics') ? 'active' : ''}
            >
              Analytics
            </Link>
            <Link 
              to="/reports"
              className={isActiveRoute('/reports') ? 'active' : ''}
            >
              Reports
            </Link>
          </div>

          <div className="navbar-user">
            <div 
              className="user-avatar" 
              onClick={() => setShowDropdown(!showDropdown)}
              title={user.displayName || user.email}
            >
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </div>
            
            {showDropdown && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-name">{user.displayName || 'User'}</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <button onClick={handleSignOut}>
                  <span>Sign Out</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;