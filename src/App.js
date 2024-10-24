import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { TaskProvider } from './context/TaskContext';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CalendarSystem from './components/CalendarSystem';
import MessageSystem from './components/MessageSystem';
import TaskManagement from './components/TaskManagement';
import FileSharing from './components/FileSharing';
import Reports from './components/Reports';
import ForgotPassword from './components/ForgotPassword';
import Navbar from './components/Navbar';
import './App.css';

const MainLayout = ({ children, user }) => {
  return (
    <div className="main-layout">
      <Navbar user={user} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <TaskProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
            
            <Route
              path="/"
              element={
                user ? (
                  <MainLayout user={user}>
                    <Dashboard />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/tasks"
              element={
                user ? (
                  <MainLayout user={user}>
                    <TaskManagement />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/calendar"
              element={
                user ? (
                  <MainLayout user={user}>
                    <CalendarSystem />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/messages"
              element={
                user ? (
                  <MainLayout user={user}>
                    <MessageSystem />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/files"
              element={
                user ? (
                  <MainLayout user={user}>
                    <FileSharing />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            
            <Route
              path="/reports"
              element={
                user ? (
                  <MainLayout user={user}>
                    <Reports />
                  </MainLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </div>
      </Router>
    </TaskProvider>
  );
};

export default App;