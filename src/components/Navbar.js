import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';

const Navbar = ({ user }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-text">APP4080</Link>
      </div>

      {user && (
        <>
          <div className="navbar-links">
            <Link to="/tasks">Task Management</Link>
            <Link to="/files">File Sharing</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/messages">Messages</Link>
          </div>

          <div className="navbar-user">
            <div 
              className="user-avatar" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </div>
            
            {showDropdown && (
              <div className="user-dropdown">
                <div className="user-info">
                  <p className="user-name">{user.displayName}</p>
                  <p className="user-email">{user.email}</p>
                </div>
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;