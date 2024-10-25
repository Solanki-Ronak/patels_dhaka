import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { tasks } = useTaskContext();

  // Calculate basic statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.percentComplete === 100).length;
  const inProgressTasks = tasks.filter(task => task.percentComplete > 0 && task.percentComplete < 100).length;
  const pendingTasks = tasks.filter(task => task.percentComplete === 0).length;
  const completionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  // Project progress data
  const getProjectData = () => {
    const projectGroups = tasks.reduce((acc, task) => {
      const project = task.projectName || 'Uncategorized';
      if (!acc[project]) {
        acc[project] = {
          name: project,
          completed: 0,
          inProgress: 0,
          total: 0
        };
      }
      acc[project].total += 1;
      if (task.percentComplete === 100) {
        acc[project].completed += 1;
      } else if (task.percentComplete > 0) {
        acc[project].inProgress += 1;
      }
      return acc;
    }, {});

    return Object.values(projectGroups);
  };

  // Task status distribution data
  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#4CAF50' },
    { name: 'In Progress', value: inProgressTasks, color: '#2196F3' },
    { name: 'Pending', value: pendingTasks, color: '#FFC107' }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color || '#666' }}>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Task Analytics Overview</h1>
        <p>View your task progress and distribution</p>
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Total Tasks</h3>
          <div className="metric-value">{totalTasks}</div>
          <div className="metric-label">All tasks in system</div>
        </div>
        <div className="metric-card">
          <h3>Completed</h3>
          <div className="metric-value">{completedTasks}</div>
          <div className="metric-label">Tasks finished</div>
        </div>
        <div className="metric-card">
          <h3>In Progress</h3>
          <div className="metric-value">{inProgressTasks}</div>
          <div className="metric-label">Tasks being worked on</div>
        </div>
        <div className="metric-card">
          <h3>Completion Rate</h3>
          <div className="metric-value">{completionRate}%</div>
          <div className="metric-label">Overall progress</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Project Progress</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getProjectData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="completed" 
                  name="Completed" 
                  stackId="a" 
                  fill="#4CAF50" 
                />
                <Bar 
                  dataKey="inProgress" 
                  name="In Progress" 
                  stackId="a" 
                  fill="#2196F3" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;