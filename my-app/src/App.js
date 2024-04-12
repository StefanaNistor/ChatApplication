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

import React from 'react';

function App() {
  
  const today = new Date();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/main" element={<MainPage />} />
        <Route path='todo-list' element={<ToDoList/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='calendar' element={<Calendar todayDate={today}/>}/>
        <Route path='user-master-list' element={<UserMasterList/>}/>
        <Route path="/otherProfile/:otherUserID" element={<OtherProfile />} />
        <Route path='admin' element={<AdminPanel/>}/>

      </Routes>
  </Router>
  
  );
}

export default App;
