import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'Task Management',
      description: 'Manage your tasks and projects',
      path: '/tasks',
      icon: '📋'
    },
    {
      title: 'Calendar',
      description: 'View and manage events',
      path: '/calendar',
      icon: '📅'
    },
    {
      title: 'Messages',
      description: 'Chat with team members',
      path: '/messages',
      icon: '💬'
    },
    {
      title: 'Analytics',
      description: 'View task analytics and metrics',
      path: '/analytics',
      icon: '📊'
    },
    {
      title: 'Reports',
      description: 'View task reports',
      path: '/reports',
      icon: '📈'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
      </div>
      
      <div className="dashboard-grid">
        {tiles.map((tile, index) => (
          <div 
            key={index}
            className="dashboard-tile"
            onClick={() => navigate(tile.path)}
          >
            <div className="tile-icon">{tile.icon}</div>
            <h2>{tile.title}</h2>
            <p>{tile.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;