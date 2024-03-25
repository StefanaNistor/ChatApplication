import { React, useState, useEffect } from "react";
import axios from "axios";
import "../components-style/AdminPanel.css";
import NavBar from "./NavBar";




function AdminPanel() {
    const [allUsers, setAllUsers] = useState([]);
    const [otherUsers, setOtherUsers] = useState([]);

    useEffect(() => {
        getAllButCurrentUser();
        getAllUsers();
    }, []);

    async function getAllButCurrentUser() {
        const userID = JSON.parse(localStorage.getItem('user')).id;
        try {
            const response = await axios.get(`http://localhost:7979/users/allUsers/${userID}`, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            console.log(response.data);
            setAllUsers(response.data);
        } catch (error) {
            console.error('An error occurred while getting users!', error);
        }
    }

    async function getAllUsers() {
        try {
            const response = await axios.get("http://localhost:7979/users/all", {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            console.log(response.data);
            setOtherUsers(response.data);
        } catch (error) {
            console.error('An error occurred while getting users!', error);
        }
    }

    const handleDelete = () => {
        document.getElementById("delete-user-confirm-btn").style.display = "block";
    }

    const handleConfirmDelete = () => {
        const deletedUserId= document.getElementById("delete-user-dropdown").value;
        console.log(deletedUserId);
        axios.delete(`http://localhost:7979/users/${deletedUserId}`, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {
            console.log('User deleted:', res.data);
            const message = document.createElement('p');
            message.textContent = 'User has been deleted!';
            document.querySelector('.delete-user-section').appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);

            window.location.reload();

        }).catch((err) => {
            console.log('An error occurred while deleting user!');
        });


    }

  return (
    <div>
      <NavBar />
      <div className="admin-panel">
        <div className="admin-panel-CRUD-section">
          <div className="create-user-section">
            <h2>Create User</h2>
            <input type="text" id="username" placeholder="Username" />
            <input type="text" id="first_name" placeholder="First Name" />
            <input type="text" id="last_name" placeholder="Last Name" />
            <input type="text" id="e-mail" placeholder="Email" />
            <input type="password" id="password" placeholder="Password" />
            <input type="text" id="position" placeholder="Position" />

            <div className="IsAdmin">
              <p style={{ marginRight: "1.5vw" }}>Admin </p>
              <input type="checkbox" id="new-isAdmin" />
            </div>

            <input type="date" id="birthday" />
            <button id="create-user-btn">Create User</button>
          </div>

          <div className="change-user-details-section">
            <h2>Change User Details</h2>
            <select id="change-user-dropdown">
                {allUsers.map((user) => (
                    <option value={user.id}>{user.username}</option>
                ))}
            </select>

            <input type="text" id="new-username" placeholder="New Username" />
            <input
              type="text"
              id="new-first-name"
              placeholder="New First Name"
            />
            <input type="text" id="new-last-name" placeholder="New Last Name" />
            <input type="text" id="new-email" placeholder="New Email" />
            <input
              type="password"
              id="new-password"
              placeholder="New Password"
            />
            <input type="text" id="new-position" placeholder="New Position" />

            <div className="IsAdmin">
              <p style={{ marginRight: "1.5vw" }}>Admin </p>
              <input type="checkbox" id="new-isAdmin" />
            </div>

            <input type="date" id="new-date_of_birth" />
            <button id="change-user-details-btn">Change User Details</button>
          </div>

          <div
            className="delete-user-create-group-section"
            style={{ display: "grid" }}
          >
            <div className="delete-user-section">
              <h2>Delete User</h2>
              <select id="delete-user-dropdown">
                {otherUsers.map((user) => (
                    <option value={user.id}>{user.username}</option>
                ))}
              </select>
              <button id="delete-user-btn" onClick={handleDelete}>Delete User</button>
              <button id="delete-user-confirm-btn" onClick= {handleConfirmDelete} style={{ display: "none" }}>
                Confirm Delete
              </button>
            </div>

            <div className="create-group-section">
              <h2>Create Group</h2>
              <input type="text" id="group-name" placeholder="Group Name" />
              <input
                type="text"
                id="group-description"
                placeholder="Group Description"
              />
              <button id="addPhoto">Add Photo</button>
              <input type="file" id="group-photo" style={{ display: "none" }} />
              <button id="create-group-btn">Create Group</button>
            </div>
          </div>

          <div className="delete-group-section">
            <h2>Delete Group</h2>
            <select id="delete-group-dropdown">
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
              <option value="group3">Group 3</option>
            </select>
            <button id="delete-group-btn">Delete Group</button>
            <button id="delete-group-confirm-btn" style={{ display: "none" }}>
              Confirm Delete
            </button>
          </div>

          <div className="add-remove-user-section">
            <h2>Add/Remove User from Group</h2>
            <select id="add-remove-user-dropdown">
              {allUsers.map((user) => (
                  <option value={user.id}>{user.username}</option>
              ))}
            </select>

            <select id="add-remove-group-dropdown">
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
              <option value="group3">Group 3</option>
            </select>

            <button id="add-user-btn">Add User</button>
            <button id="remove-user-btn">Remove User</button>
          </div>

          <div className="change-group-details-section">
            <h2>Change Group Details</h2>
            <select id="change-group-dropdown">
              <option value="group1">Group 1</option>
              <option value="group2">Group 2</option>
              <option value="group3">Group 3</option>
            </select>

            <input
              type="text"
              id="new-group-name"
              placeholder="New Group Name"
            />
            <input
              type="text"
              id="new-group-description"
              placeholder="New Group Description"
            />
            <button id="change-group-details-btn">Change Group Details</button>
          </div>
        </div>

        <div class="statistics-section">
          <h2>Statistics</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
