import React from 'react';
import '../components-style/NavBar.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowRightFromBracket} from '@fortawesome/free-solid-svg-icons';

function NavBar(){

    const navigate = useNavigate();
    
    const handleHomeClick = () => {
        console.log('HOOOEME');
        navigate('/main');
    }

    const handleProfileClick = () => {
        console.log('profiel');
        navigate('/profile');
    }

    const handleCalendarClick = () => {
        console.log('calendar');
        navigate('/calendar');
    }

    const handleToDoListClick = () => {
        console.log('todo');
        navigate('/todo-list');
    }

    const handleLogout = () => {
        console.log('logout');
        navigate('/');
    }

    const handleUserMasterListClick = () => {
        console.log('user master list');
        navigate('/user-master-list');
    }
    
    return(
        <div className='navbar-container'>
            <ul id='navList'>
                <li onClick={handleHomeClick}>Home</li>
                <li onClick={handleProfileClick}>Profile</li>
                <li onClick={handleUserMasterListClick}>User Master List</li>
                <li onClick={handleToDoListClick}>To Do List</li>
                <li onClick={handleCalendarClick}>Calendar</li>
                <li><button id="logoutBtn" onClick={handleLogout}><FontAwesomeIcon icon={faArrowRightFromBracket} /></button></li>
            </ul>
        </div>

    )

}

export default NavBar;