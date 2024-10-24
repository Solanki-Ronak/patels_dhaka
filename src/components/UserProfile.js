import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ user, onSystemChange, activeSystem }) => {
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
    <div className="user-profile">
      <div className="profile-logo" onClick={() => setShowDropdown(!showDropdown)}>
        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
      </div>
      {showDropdown && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <p><strong>{user.displayName}</strong></p>
            <p>{user.email}</p>
          </div>
          <button 
            onClick={() => onSystemChange('calendar')}
            className={activeSystem === 'calendar' ? 'active' : ''}
          >
            Calendar
          </button>
          <button 
            onClick={() => onSystemChange('messaging')}
            className={activeSystem === 'messaging' ? 'active' : ''}
          >
            Messaging
          </button>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;