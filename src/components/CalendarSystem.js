import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import './CalendarSystem.css';

const CalendarSystem = () => {
  const { tasks, addTask } = useTaskContext();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    taskName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    description: '',
    priority: 'medium'
  });
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const handleEventClick = (task) => {
    setSelectedEvent(task);
    setShowEventDetails(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getTaskCountForDay = (date, tasksForDay) => {
    return tasksForDay.length > 0 ? (
      <span className="task-count">{tasksForDay.length} task{tasksForDay.length > 1 ? 's' : ''}</span>
    ) : null;
  };

  const generateCalendarDays = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let calendar = [];
    
    // Add header row
    calendar.push(
      <div key="header" className="calendar-row header">
        {days.map(day => (
          <div key={day} className="calendar-cell header">
            {day.slice(0,1)}
          </div>
        ))}
      </div>
    );

    // Add date cells
    let cells = [];
    for (let i = 0; i < startingDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const tasksForDay = tasks.filter(task => 
        new Date(task.startDate).toDateString() === date.toDateString()
      );

      cells.push(
        <div key={day} className={`calendar-cell ${isToday(date) ? 'today' : ''}`}>
          {getTaskCountForDay(date, tasksForDay)}
          <span className="date-number">{day}</span>
          <div className="task-container">
            {tasksForDay.map(task => (
              <div 
                key={task.id} 
                className={`task-item ${task.percentComplete === 100 ? 'completed' : ''}`}
                onClick={() => handleEventClick(task)}
              >
                {task.taskName}
              </div>
            ))}
          </div>
        </div>
      );
    }

    while (cells.length % 7 !== 0) {
      cells.push(<div key={`empty-end-${cells.length}`} className="calendar-cell empty"></div>);
    }

    let rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        <div key={`row-${i}`} className="calendar-row">
          {cells.slice(i, i + 7)}
        </div>
      );
    }

    calendar.push(...rows);
    return calendar;
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await addTask({
        ...newEvent,
        percentComplete: 0
      });
      setNewEvent({
        taskName: '',
        projectName: '',
        startDate: '',
        endDate: '',
        description: '',
        priority: 'medium'
      });
      setShowAddEvent(false);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <div className="calendar-system">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-button" onClick={goToPrevMonth}>
            ← Previous
          </button>
          <button className="nav-button today-button" onClick={goToToday}>
            Today
          </button>
          <button className="nav-button" onClick={goToNextMonth}>
            Next →
          </button>
        </div>
        <div className="calendar-title">
          <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        </div>
        <button className="add-event-button" onClick={() => setShowAddEvent(true)}>
          + Add Event
        </button>
      </div>
      <div className="calendar-grid">
        {generateCalendarDays()}
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="modal-overlay">
          <div className="event-modal">
            <h3>Add New Event</h3>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.taskName}
                  onChange={(e) => setNewEvent({...newEvent, taskName: e.target.value})}
                  required
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newEvent.projectName}
                  onChange={(e) => setNewEvent({...newEvent, projectName: e.target.value})}
                  required
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newEvent.priority}
                  onChange={(e) => setNewEvent({...newEvent, priority: e.target.value})}
                  required
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows="3"
                  placeholder="Enter event description"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Add Event</button>
                <button type="button" onClick={() => setShowAddEvent(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal-overlay">
          <div className="event-modal">
            <div className="event-details">
              <h3>
                {selectedEvent.taskName}
                <span className={`task-badge ${selectedEvent.percentComplete === 100 ? 'completed' : 'pending'}`}>
                  {selectedEvent.percentComplete === 100 ? 'Completed' : 'Pending'}
                </span>
              </h3>
              <div className="detail-item">
                <strong>Project</strong>
                {selectedEvent.projectName}
              </div>
              <div className="detail-item">
                <strong>Priority</strong>
                {selectedEvent.priority || 'Not set'}
              </div>
              <div className="detail-item">
                <strong>Start Date</strong>
                {formatDate(selectedEvent.startDate)}
              </div>
              <div className="detail-item">
                <strong>End Date</strong>
                {formatDate(selectedEvent.endDate)}
              </div>
              {selectedEvent.description && (
                <div className="detail-item">
                  <strong>Description</strong>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              <div className="detail-item">
                <strong>Progress</strong>
                {selectedEvent.percentComplete}%
              </div>
              <div className="modal-buttons">
                <button onClick={() => setShowEventDetails(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSystem;