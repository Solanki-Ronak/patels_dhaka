import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import endOfWeek from 'date-fns/endOfWeek';
import isWithinInterval from 'date-fns/isWithinInterval';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { db, auth } from '../firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import './CalendarSystem.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const categories = [
  { name: 'Work', color: '#4CAF50' },
  { name: 'Personal', color: '#2196F3' },
  { name: 'Important', color: '#F44336' },
  { name: 'Other', color: '#FFC107' }
];

const CalendarSystem = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    startTime: '', 
    endTime: '', 
    category: '', 
    completed: false 
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'events'), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedEvents = snapshot.docs.map(doc => {
          const data = doc.data();
          const start = new Date(`${data.date}T${data.startTime}`);
          const end = new Date(`${data.date}T${data.endTime}`);
          return {
            id: doc.id,
            ...data,
            start,
            end,
          };
        });
        setEvents(fetchedEvents);
      });

      return () => unsubscribe();
    } else {
      setEvents([]);
    }
  }, [user]);

  const addEvent = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (newEvent.title.trim() === '' || !newEvent.date || !newEvent.startTime || !newEvent.endTime || !newEvent.category) return;

    const start = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}`);

    const isOverlapping = events.some(event => 
      isWithinInterval(start, { start: event.start, end: event.end }) ||
      isWithinInterval(end, { start: event.start, end: event.end }) ||
      (start <= event.start && end >= event.end)
    );

    if (isOverlapping) {
      alert("This time slot is already occupied. Please choose a different time.");
      return;
    }

    try {
      await addDoc(collection(db, 'events'), {...newEvent, userId: user.uid});
      setNewEvent({ title: '', date: '', startTime: '', endTime: '', category: '', completed: false });
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };

  const toggleCompletion = async (event) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'events', event.id), {
        completed: !event.completed
      });
    } catch (error) {
      console.error("Error toggling completion status: ", error);
    }
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setIsEditing(false);
    setEditedEvent(null);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedEvent({
      ...selectedEvent,
      date: format(selectedEvent.start, 'yyyy-MM-dd'),
      startTime: format(selectedEvent.start, 'HH:mm'),
      endTime: format(selectedEvent.end, 'HH:mm'),
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!user || !editedEvent) return;

    const start = new Date(`${editedEvent.date}T${editedEvent.startTime}`);
    const end = new Date(`${editedEvent.date}T${editedEvent.endTime}`);

    const isOverlapping = events.some(event => 
      event.id !== editedEvent.id && (
        isWithinInterval(start, { start: event.start, end: event.end }) ||
        isWithinInterval(end, { start: event.start, end: event.end }) ||
        (start <= event.start && end >= event.end)
      )
    );

    if (isOverlapping) {
      alert("This time slot is already occupied. Please choose a different time.");
      return;
    }

    try {
      await updateDoc(doc(db, 'events', editedEvent.id), {
        title: editedEvent.title,
        date: editedEvent.date,
        startTime: editedEvent.startTime,
        endTime: editedEvent.endTime,
        category: editedEvent.category,
        completed: editedEvent.completed,
      });
      setIsEditing(false);
      setSelectedEvent(editedEvent);
    } catch (error) {
      console.error("Error updating event: ", error);
    }
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const goToView = (view) => {
      toolbar.onView(view);
    };

    const label = () => {
      const date = toolbar.date;
      if (toolbar.view === 'month') {
        return format(date, 'MMMM yyyy');
      }
      if (toolbar.view === 'week') {
        return `${format(startOfWeek(date), 'MMM d, yyyy')} - ${format(endOfWeek(date), 'MMM d, yyyy')}`;
      }
      if (toolbar.view === 'day') {
        return format(date, 'MMMM d, yyyy');
      }
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={goToToday}>Today</button>
          <button type="button" onClick={goToBack}>Back</button>
          <button type="button" onClick={goToNext}>Next</button>
        </span>
        <span className="rbc-toolbar-label">{label()}</span>
        <span className="rbc-btn-group">
          <button type="button" onClick={() => goToView('month')}>Month</button>
          <button type="button" onClick={() => goToView('week')}>Week</button>
          <button type="button" onClick={() => goToView('day')}>Day</button>
        </span>
      </div>
    );
  };

  const eventPropGetter = useCallback((event) => {
    const style = {
      backgroundColor: categories.find(cat => cat.name === event.category)?.color,
      opacity: event.completed ? 0.5 : 1,
      textDecoration: event.completed ? 'line-through' : 'none',
    };
    return { style };
  }, []);

  return (
    <div className="calendar-system">
      <div className="calendar-container">
        <div className="sidebar">
          <div className="add-event-section">
            <h2>Add a Task</h2>
            <form onSubmit={addEvent}>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Task title"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
              <div className="time-inputs">
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                />
                <span>to</span>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                />
              </div>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <button type="submit">Add Task</button>
            </form>
          </div>
        </div>
        <div className="main-calendar">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 80px)' }}
            onSelectEvent={onSelectEvent}
            view={view}
            onView={setView}
            eventPropGetter={eventPropGetter}
            defaultView={Views.MONTH}
            date={currentDate}
            onNavigate={handleNavigate}
            components={{
              toolbar: CustomToolbar
            }}
            views={['month', 'week', 'day']}
          />
        </div>
      </div>
      {isModalOpen && selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedEvent.title}</h3>
            <p>Date: {format(selectedEvent.start, 'MMMM d, yyyy')}</p>
            <p>Time: {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}</p>
            <p>Category: {selectedEvent.category}</p>
            <p>Status: {selectedEvent.completed ? 'Completed' : 'Pending'}</p>
            <button onClick={() => toggleCompletion(selectedEvent)}>
              {selectedEvent.completed ? 'Mark as Pending' : 'Mark as Completed'}
            </button>
            <button onClick={startEditing}>Edit Task</button>
            <button onClick={() => deleteEvent(selectedEvent.id)}>Delete Task</button>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input
              type="text"
              name="title"
              value={editedEvent.title}
              onChange={handleEditChange}
              placeholder="Task title"
            />
            <input
              type="date"
              name="date"
              value={editedEvent.date}
              onChange={handleEditChange}
            />
            <input
              type="time"
              name="startTime"
              value={editedEvent.startTime}
              onChange={handleEditChange}
            />
            <input
              type="time"
              name="endTime"
              value={editedEvent.endTime}
              onChange={handleEditChange}
            />
            <select
              name="category"
              value={editedEvent.category}
              onChange={handleEditChange}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <label>
              <input
                type="checkbox"
                name="completed"
                checked={editedEvent.completed}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, completed: e.target.checked }))}
              />
              Completed
            </label>
            <button onClick={saveEdit}>Save Changes</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSystem;