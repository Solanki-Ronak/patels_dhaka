import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import './TaskManagement.css';

const TaskManagement = () => {
  const { tasks, addTask, updateTask, deleteTask } = useTaskContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    taskName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    percentComplete: 0
  });

  const handleNewTask = async (e) => {
    e.preventDefault();
    try {
      await addTask(newTask);
      setNewTask({
        taskName: '',
        projectName: '',
        startDate: '',
        endDate: '',
        percentComplete: 0
      });
      setActiveTab('all');
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask({
      ...task,
      startDate: task.startDate.split('T')[0],
      endDate: task.endDate.split('T')[0]
    });
    setActiveTab('edit');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask(editingTask.id, {
        taskName: editingTask.taskName,
        projectName: editingTask.projectName,
        startDate: editingTask.startDate,
        endDate: editingTask.endDate,
        percentComplete: parseInt(editingTask.percentComplete)
      });
      setEditingTask(null);
      setActiveTab('all');
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
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

      {activeTab === 'new' && (
        <div className="new-task-form">
          <h2>Create New Task</h2>
          <form onSubmit={handleNewTask}>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.taskName}
              onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Project Name"
              value={newTask.projectName}
              onChange={(e) => setNewTask({...newTask, projectName: e.target.value})}
              required
            />
            <div className="date-inputs">
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                required
              />
              <input
                type="date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({...newTask, endDate: e.target.value})}
                required
              />
            </div>
            <input
              type="number"
              placeholder="Percentage Complete (0-100)"
              min="0"
              max="100"
              value={newTask.percentComplete}
              onChange={(e) => setNewTask({...newTask, percentComplete: parseInt(e.target.value)})}
              required
            />
            <button type="submit">Add Task</button>
          </form>
        </div>
      )}

      {activeTab === 'edit' && editingTask && (
        <div className="edit-task-form">
          <h2>Edit Task</h2>
          <form onSubmit={handleEditSubmit}>
            <input
              type="text"
              placeholder="Task Name"
              value={editingTask.taskName}
              onChange={(e) => setEditingTask({...editingTask, taskName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Project Name"
              value={editingTask.projectName}
              onChange={(e) => setEditingTask({...editingTask, projectName: e.target.value})}
              required
            />
            <div className="date-inputs">
              <input
                type="date"
                value={editingTask.startDate}
                onChange={(e) => setEditingTask({...editingTask, startDate: e.target.value})}
                required
              />
              <input
                type="date"
                value={editingTask.endDate}
                onChange={(e) => setEditingTask({...editingTask, endDate: e.target.value})}
                required
              />
            </div>
            <input
              type="number"
              placeholder="Percentage Complete (0-100)"
              min="0"
              max="100"
              value={editingTask.percentComplete}
              onChange={(e) => setEditingTask({...editingTask, percentComplete: parseInt(e.target.value)})}
              required
            />
            <div className="form-buttons">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => {
                setEditingTask(null);
                setActiveTab('all');
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'all' && (
        <div className="all-tasks">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <th>Progress</th>
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
                    <td>{task.percentComplete}%</td>
                    <td>
                      <button onClick={() => handleEdit(task)}>Edit</button>
                      <button onClick={() => handleDelete(task.id)}>Delete</button>
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