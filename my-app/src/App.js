import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

import React from 'react';

function App() {
  
  const today = new Date();

  const token = localStorage.getItem('token');

  const checkIfLoggedIn = () => {
    if (!token) {
      return false;
    }
    return true;
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/main' element={<MainPage />} />
        <Route path='/todo-list' element={checkIfLoggedIn() ? <ToDoList /> : <AccessDenied />} />
        <Route path='/profile' element={checkIfLoggedIn() ? <Profile /> : <AccessDenied />} />
        <Route path='/calendar' element={checkIfLoggedIn() ? <Calendar /> : <AccessDenied />} />
        <Route path='/user-master-list' element={checkIfLoggedIn() ? <UserMasterList /> : <AccessDenied />} />
        <Route path='/other-profile' element={checkIfLoggedIn() ? <OtherProfile /> : <AccessDenied />} />
        <Route path='/admin' element={checkIfLoggedIn() ? <AdminPanel /> : <AccessDenied />} />
        <Route path='/statistics' element={checkIfLoggedIn() ? <MainStatistics /> : <AccessDenied />} />
        <Route path='*' element={<h1>Not Found</h1>} />
      </Routes>
  </Router>
  
  );
}

export default App;
