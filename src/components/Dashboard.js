import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';


const Dashboard = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'Task Management',
      description: 'Manage your tasks and projects',
      path: '/tasks'
    },
    {
      title: 'File Sharing',
      description: 'Share and manage files',
      path: '/files'
    },
    {
      title: 'Calendar',
      description: 'View and manage events',
      path: '/calendar'
    },
    {
      title: 'Messages',
      description: 'Chat with team members',
      path: '/messages'
    },
    {
      title: 'Reports',
      description: 'View task analytics and reports',
      path: '/reports'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {tiles.map((tile, index) => (
          <div 
            key={index} 
            className="dashboard-tile"
            onClick={() => navigate(tile.path)}
          >
            <h2>{tile.title}</h2>
            <p>{tile.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;