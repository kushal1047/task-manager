import React, { useEffect, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const res = await fetchTasks();
    setTasks(res.data);
  };

  const handleAdd = async title => {
    const res = await createTask(title);
    setTasks([res.data, ...tasks]);
  };
  const handleToggle = async (id, completed) => {
    const res = await updateTask(id, completed);
    setTasks(tasks.map(t => (t._id === id ? res.data : t)));
  };

  const handleDelete = async id => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };