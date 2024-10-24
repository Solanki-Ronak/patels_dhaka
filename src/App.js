import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CalendarSystem from './components/CalendarSystem';
import MessageSystem from './components/MessageSystem';
import UserProfile from './components/UserProfile';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSystem, setActiveSystem] = useState('calendar');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <nav>
          <div className="app-name">Patel's Tadka</div>
          {user && (
            <UserProfile 
              user={user} 
              onSystemChange={setActiveSystem} 
              activeSystem={activeSystem}
            />
          )}
        </nav>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              user ? (
                activeSystem === 'calendar' ? (
                  <CalendarSystem />
                ) : (
                  <MessageSystem />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;