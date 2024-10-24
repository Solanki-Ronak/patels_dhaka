import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { useTaskContext } from '../context/TaskContext';
import './Reports.css';

const Reports = () => {
  const { tasks } = useTaskContext();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showChart, setShowChart] = useState(false);

  // Calculate statistics
  const stats = {
    totalTasks: tasks.length || 24, // Default value as per design
    projects: new Set(tasks.map(task => task.projectName)).size || 3,
    completed: tasks.filter(task => task.percentComplete === 100).length || 4,
    inProgress: tasks.filter(task => task.percentComplete < 100).length || 20
  };

  const handleTaskSelection = (taskId) => {
    const newSelected = selectedTasks.includes(taskId)
      ? selectedTasks.filter(id => id !== taskId)
      : [...selectedTasks, taskId];
    setSelectedTasks(newSelected);
    setShowChart(newSelected.length > 0);
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
      setShowChart(false);
    } else {
      setSelectedTasks(tasks.map(task => task.id));
      setShowChart(true);
    }
  };

  const getChartData = () => {
    return tasks
      .filter(task => selectedTasks.includes(task.id))
      .map(task => ({
        name: task.taskName,
        projectName: task.projectName,
        daysLeft: calculateDaysLeft(task.endDate)
      }));
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="reports-container">
      {/* Stats Header */}
      <div className="stats-boxes">
        <div className="stat-box">
          <div className="stat-number">{stats.totalTasks}</div>
          <div className="stat-label">Tasks</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.projects}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">InProgress</div>
        </div>
      </div>

      {/* Task Selection Table */}
      <div className="task-selection-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Task Name</th>
              <th>Project Name</th>
              <th>Duration Days/Percent</th>
              <th>
                <label className="select-all">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === tasks.length}
                    onChange={handleSelectAll}
                  />
                  Select all
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>{task.taskName}</td>
                <td>{task.projectName}</td>
                <td>{calculateDaysLeft(task.endDate)} days / {task.percentComplete}%</td>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleTaskSelection(task.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      {showChart && (
        <div className="chart-container">
          <h2>Bar Chart</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={getChartData()}
              margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="projectName" 
                label={{ 
                  value: 'Project Name', 
                  position: 'bottom' 
                }}
              />
              <YAxis
                label={{ 
                  value: 'Days Left', 
                  angle: -90, 
                  position: 'insideLeft'
                }}
              />
              <Bar dataKey="daysLeft" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Reports;