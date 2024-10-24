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
      <div className="navbar-left">
        <Link to="/" className="nav-brand">APP4080</Link>
      </div>
      
      <div className="navbar-center">
        <Link to="/tasks" className="nav-link">Task Management</Link>
        <Link to="/files" className="nav-link">File Sharing</Link>
        <Link to="/calendar" className="nav-link">Calendar</Link>
        <Link to="/messages" className="nav-link">Messages</Link>
      </div>

      <div className="navbar-right">
        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="profile-icon">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <p className="user-name">{user?.displayName}</p>
                <p className="user-email">{user?.email}</p>
              </div>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;