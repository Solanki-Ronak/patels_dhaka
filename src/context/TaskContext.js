import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where("userId", "==", auth.currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        duration: calculateDuration(doc.data().startDate, doc.data().endDate)
      }));
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const addTask = async (taskData) => {
    const tasksRef = collection(db, 'tasks');
    await addDoc(tasksRef, {
      ...taskData,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateTask = async (taskId, taskData) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, taskData);
  };

  const deleteTask = async (taskId) => {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        loading, 
        addTask, 
        updateTask, 
        deleteTask,
        calculateDuration 
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;