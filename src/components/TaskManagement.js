import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { FaSearch } from 'react-icons/fa';
import './TaskManagement.css';

const TaskManagement = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTask, setNewTask] = useState({
    taskName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    percentComplete: 0
  });

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleNewTask = async (e) => {
    e.preventDefault();
    const duration = calculateDuration(newTask.startDate, newTask.endDate);
    const taskData = {
      ...newTask,
      duration,
      taskNumber: (tasks.length + 1).toString().padStart(3, '0'),
      createdAt: new Date().toISOString()
    };
    await addTask(taskData);
    setNewTask({
      taskName: '',
      projectName: '',
      startDate: '',
      endDate: '',
      percentComplete: 0
    });
    setActiveTab('all');
  };

  const handlePercentChange = (value) => {
    const percent = Math.min(Math.max(0, parseInt(value) || 0), 100);
    setNewTask({ ...newTask, percentComplete: percent });
  };

  return (
    <div className="task-management">
      <div className="task-header">
        <h1>Task Management</h1>
        <div className="task-tabs">
          <button 
            className={activeTab === 'new' ? 'active' : ''} 
            onClick={() => setActiveTab('new')}
          >
            New Task
          </button>
          <button 
            className={activeTab === 'all' ? 'active' : ''} 
            onClick={() => setActiveTab('all')}
          >
            All Tasks
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="new-task-form">
          <h2>Enter the following details:</h2>
          <form onSubmit={handleNewTask}>
            <div className="form-row">
              <label>No:</label>
              <input
                type="text"
                value={(tasks.length + 1).toString().padStart(3, '0')}
                disabled
              />
              <span className="hint">should be automatic</span>
            </div>
            
            <div className="form-row">
              <label>Task Name:</label>
              <input
                type="text"
                value={newTask.taskName}
                onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <label>Project Name:</label>
              <input
                type="text"
                value={newTask.projectName}
                onChange={(e) => setNewTask({...newTask, projectName: e.target.value})}
                required
              />
            </div>

            <div className="form-row">
              <label>Start Date:</label>
              <div className="date-input">
                <input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                  required
                />
                <span className="calendar-icon">📅</span>
              </div>
            </div>

            <div className="form-row">
              <label>End Date:</label>
              <div className="date-input">
                <input
                  type="date"
                  value={newTask.endDate}
                  onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                  required
                />
                <span className="calendar-icon">📅</span>
              </div>
            </div>

            <div className="form-row">
              <label>Duration:</label>
              <input
                type="text"
                value={calculateDuration(newTask.startDate, newTask.endDate)}
                disabled
              />
              <span className="hint">should automatic calculate days by taking End - Start</span>
            </div>

            <div className="form-row">
              <label>Percentage Complete:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newTask.percentComplete}
                onChange={(e) => handlePercentChange(e.target.value)}
                required
              />
              <span className="hint">restrict to 0-100 (should be within)</span>
            </div>

            <button type="submit" className="add-button">Add</button>
          </form>
        </div>
      )}

      {activeTab === 'all' && (
        <div className="all-tasks">
          <div className="search-section">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="search-button">Search</button>
          </div>

          <table className="tasks-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Task Name</th>
                <th>Project Name</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Total Duration</th>
                <th>Days Left</th>
                <th>Percent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks
                .filter(task => 
                  task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  task.projectName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.taskName}</td>
                    <td>{task.projectName}</td>
                    <td>{new Date(task.startDate).toLocaleDateString()}</td>
                    <td>{new Date(task.endDate).toLocaleDateString()}</td>
                    <td>{task.duration} days</td>
                    <td>{calculateDaysLeft(task.endDate)} days</td>
                    <td>{task.percentComplete}%</td>
                    <td>
                      <button className="edit-button" onClick={() => updateTask(task.id)}>Edit</button>
                      <button className="delete-button" onClick={() => deleteTask(task.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;