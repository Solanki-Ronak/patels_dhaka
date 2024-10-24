import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTaskContext } from '../context/TaskContext';
import './Reports.css';

const Reports = () => {
  const { tasks } = useTaskContext();
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    projects: 0,
    completed: 0,
    inProgress: 0
  });

  useEffect(() => {
    console.log("Tasks in Reports:", tasks);
    if (tasks?.length) {
      // Update stats
      const completedTasks = tasks.filter(task => task.percentComplete === 100);
      const uniqueProjects = new Set(tasks.map(task => task.projectName));

      setStats({
        totalTasks: tasks.length,
        projects: uniqueProjects.size,
        completed: completedTasks.length,
        inProgress: tasks.length - completedTasks.length
      });

      // Prepare chart data
      const data = tasks.map(task => ({
        name: task.taskName,
        daysLeft: calculateDaysLeft(task.endDate),
        progress: task.percentComplete
      }));
      setChartData(data);
    }
  }, [tasks]);

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="reports-container">
      {/* Stats Display */}
      <div className="stats-header">
        <div className="stat-box">
          <h3>{stats.totalTasks}</h3>
          <p>Tasks</p>
        </div>
        <div className="stat-box">
          <h3>{stats.projects}</h3>
          <p>Projects</p>
        </div>
        <div className="stat-box">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-box">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-section">
        <h2>Task Progress Overview</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="daysLeft" fill="#8884d8" name="Days Left" />
              <Bar dataKey="progress" fill="#82ca9d" name="Progress (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;