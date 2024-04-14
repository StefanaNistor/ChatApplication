import React, { useEffect, useState } from "react";
import NavBar from './NavBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../components-style/UserMasterList.css';

function UserMasterList(){

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user.id;
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
    }, []);
    
    async function getUsers(){
        try{
            const response = await axios.get(`http://localhost:7979/users/allUsers/${userId}`, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            console.log(response.data);
            setUsers(response.data);
        } catch(error){
            console.error('An error occurred while getting users!', error);
        }
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClickUser = async (clickedUserId) => {
        try {
            const response = await axios.get(`http://localhost:7979/privateChat/checkExistence/${userId}/${clickedUserId}`, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            if (response.data.exists) {
                alert('Private chat already exists!');
            } else {
                axios.post('http://localhost:7979/privateChat/create', {
                    user1_id: userId,
                    user2_id: clickedUserId,
                }, {
                    headers: {
                        "x-access-token": localStorage.getItem('token'),
                    },
                }).then((res) => {
                    console.log('Private chat created:', res.data);
                    navigate('/main');
                }).catch((error) => {
                    console.error('An error occurred while creating private chat!', error);
                });
            }
        } catch(error) {
            console.error('An error occurred while checking private chat existence!', error);
        }
    }

    return(
        <div className="user-master-list">
            <NavBar/>
            <div className="master-list-header">
                <h1>Hi, {user.username}!</h1>
                <input type="text" placeholder="Search for users..." value={searchQuery} onChange={handleSearch}/>
            </div>

            <div className="master-list-container">
                <div className="master-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button className="chat-btn" onClick={() => handleClickUser(user.id)}>Start a private chat</button>
                                        <button className="view-profile-btn" onClick={() => navigate(`/otherProfile/${user.id}`)}>View profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default UserMasterList;
