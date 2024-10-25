import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
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

  // Filter tasks safely with null checks
  const filteredTasks = tasks.filter(task => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (task?.taskName?.toLowerCase()?.includes(searchLower) ?? false) ||
      (task?.projectName?.toLowerCase()?.includes(searchLower) ?? false)
    );
  });

  const handleNewTask = async (e) => {
    e.preventDefault();
    try {
      await addTask({
        ...newTask,
        createdAt: new Date().toISOString()
      });
      setNewTask({
        taskName: '',
        projectName: '',
        startDate: '',
        endDate: '',
        percentComplete: 0
      });
      setActiveTab('all');
    } catch (error) {
      console.error("Error adding task:", error);
    }
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

      {activeTab === 'all' && (
        <div className="all-tasks">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">Search</button>
            </div>
          </div>

          <table className="tasks-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Task Name</th>
                <th>Project Name</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Duration</th>
                <th>Days Left</th>
                <th>Percent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={task.id || index}>
                  <td>{index + 1}</td>
                  <td>{task.taskName || 'N/A'}</td>
                  <td>{task.projectName || 'N/A'}</td>
                  <td>{task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{task.duration || 0} days</td>
                  <td>{task.daysLeft || 0} days</td>
                  <td>{task.percentComplete || 0}%</td>
                  <td>
                    <button className="edit-button" onClick={() => updateTask(task.id)}>Edit</button>
                    <button className="delete-button" onClick={() => deleteTask(task.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTasks.length === 0 && (
            <div className="no-results">
              No tasks found matching your search.
            </div>
          )}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="new-task-form">
          <h2>Create New Task</h2>
          <form onSubmit={handleNewTask}>
            <div className="form-group">
              <label>Task Name:</label>
              <input
                type="text"
                value={newTask.taskName}
                onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name:</label>
              <input
                type="text"
                value={newTask.projectName}
                onChange={(e) => setNewTask({...newTask, projectName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Percentage Complete:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newTask.percentComplete}
                onChange={(e) => setNewTask({...newTask, percentComplete: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <button type="submit">Add Task</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;