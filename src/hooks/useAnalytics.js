import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

export const useAnalytics = (timeframe = 'week', selectedProject = 'all') => {
  const { tasks } = useTaskContext();
  const [analyticsData, setAnalyticsData] = useState({
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      averageCompletionTime: 0,
    },
    projectProgress: [],
    completionTrend: [],
    statusDistribution: [],
    projects: [],
  });

  useEffect(() => {
    if (!tasks) return;

    const filteredTasks = selectedProject === 'all' 
      ? tasks 
      : tasks.filter(task => task.projectName === selectedProject);

    // Calculate basic stats
    const completed = filteredTasks.filter(task => task.percentComplete === 100);
    const overdue = filteredTasks.filter(task => {
      const dueDate = new Date(task.endDate);
      return dueDate < new Date() && task.percentComplete < 100;
    });

    // Get unique projects
    const uniqueProjects = [...new Set(tasks.map(task => task.projectName))];

    // Calculate project progress
    const projectProgress = uniqueProjects.map(project => {
      const projectTasks = tasks.filter(task => task.projectName === project);
      const completedTasks = projectTasks.filter(task => task.percentComplete === 100);
      return {
        name: project,
        total: projectTasks.length,
        completed: completedTasks.length,
        inProgress: projectTasks.length - completedTasks.length,
      };
    });

    // Calculate completion trend
    const timeframes = {
      week: 7,
      month: 30,
      year: 365
    };

    const days = timeframes[timeframe];
    const completionTrend = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];

      const completedOnDay = tasks.filter(task => {
        const taskDate = new Date(task.endDate);
        return taskDate.toISOString().split('T')[0] === dayStr && task.percentComplete === 100;
      }).length;

      completionTrend.push({
        date: dayStr,
        completed: completedOnDay
      });
    }

    // Calculate status distribution
    const statusDistribution = [
      { name: 'Not Started', value: filteredTasks.filter(t => t.percentComplete === 0).length },
      { name: 'In Progress', value: filteredTasks.filter(t => t.percentComplete > 0 && t.percentComplete < 100).length },
      { name: 'Completed', value: filteredTasks.filter(t => t.percentComplete === 100).length }
    ];

    // Calculate average completion time
    const avgCompletionTime = completed.length 
      ? completed.reduce((sum, task) => {
          const start = new Date(task.startDate);
          const end = new Date(task.endDate);
          return sum + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completed.length
      : 0;

    setAnalyticsData({
      stats: {
        totalTasks: filteredTasks.length,
        completedTasks: completed.length,
        inProgressTasks: filteredTasks.length - completed.length,
        overdueTasks: overdue.length,
        completionRate: filteredTasks.length 
          ? (completed.length / filteredTasks.length * 100).toFixed(1) 
          : 0,
        averageCompletionTime: Math.round(avgCompletionTime)
      },
      projectProgress,
      completionTrend,
      statusDistribution,
      projects: ['all', ...uniqueProjects]
    });
  }, [tasks, timeframe, selectedProject]);

  return analyticsData;
};