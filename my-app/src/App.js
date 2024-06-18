import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MainPage from './components/MainPage';
import ToDoList from './components/ToDoList';
import Profile from './components/Profile';
import Calendar from './components/Calendar';
import UserMasterList from './components/UserMasterList';
import OtherProfile from './components/OtherProfile';
import AdminPanel from './components/AdminPanel';
import MainStatistics from './components/MainStatistics';
import AccessDenied from './components/AccessDenied';
import { useState, useEffect } from 'react';
import React from 'react';

function App() {
  const today = new Date();

  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setTokenExists(!!token);
  }, []);

  const ProtectedRoute = ({ element }) => {
    return tokenExists ? element : <Navigate to="/access-denied" />;
  };

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login setTokenExists={setTokenExists} />} />
        <Route path='/main' element={<ProtectedRoute element={<MainPage />} />} />
        <Route path='/todo-list' element={<ProtectedRoute element={<ToDoList />} />} />
        <Route path='/profile' element={<ProtectedRoute element={<Profile />} />} />
        <Route path='/calendar' element={<ProtectedRoute element={<Calendar todayDate={today} />} />} />
        <Route path='/user-master-list' element={<ProtectedRoute element={<UserMasterList />} />} />
        <Route path='/otherProfile/:id' element={<ProtectedRoute element={<OtherProfile />} />} />
        <Route path='/admin' element={<ProtectedRoute element={<AdminPanel />} />} />
        <Route path='/statistics' element={<ProtectedRoute element={<MainStatistics />} />} />
        <Route path='/access-denied' element={<AccessDenied />} />
        <Route path='*' element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
