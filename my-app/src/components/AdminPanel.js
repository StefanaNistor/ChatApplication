import { React, useState, useEffect, useRef } from "react";
import axios from "axios";
import "../components-style/AdminPanel.css";
import NavBar from "./NavBar";

function AdminPanel() {
    const [allUsers, setAllUsers] = useState([]);
    const [otherUsers, setOtherUsers] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileNew, setSelectedFileNew] = useState(null);
    const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/50");
    const [photoURLNew, setPhotoURLNew] = useState("https://via.placeholder.com/50");
    const [groupMembers, setGroupMembers] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);


    //-------------------------CHECKBOX FOR CREATE  -------------------------
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
      setIsChecked(!isChecked); 
      console.log('CHECKBOX STATE', isChecked)
    };

    //-------------------------CHECKBOX FOR upadate  -------------------------

    const [isCheckedUpdate, setIsCheckedUpdate] = useState(false);

    const handleCheckboxChangeUpdate = () => {
      setIsCheckedUpdate(!isCheckedUpdate);
      console.log('CHECKBOX STATE UPDATE', isCheckedUpdate)
    };

    useEffect(() => {
        getAllButCurrentUser();
        getAllUsers();
        getAllGroups();
      
    }, []);

    async function getAllButCurrentUser() {
        const userID = JSON.parse(localStorage.getItem('user')).id;
        try {
            const response = await axios.get(`http://localhost:7979/users/allUsers/${userID}`, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            //console.log(response.data);
            setOtherUsers(response.data);
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
            setAllUsers(response.data);
        } catch (error) {
            console.error('An error occurred while getting users!', error);
        }
    }

    async function getAllGroups(){
        try {
            const response = await axios.get("http://localhost:7979/groupChat/", {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            //console.log(response.data);
            setAllGroups(response.data);
           
        } catch (error) {
            console.error('An error occurred while getting groups!', error);
        }
    }

    async function getGroupMembers(groupID) {
        try {
            const response = await axios.get(`http://localhost:7979/groupChat/members/${groupID}`, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            });
            console.log('MEMBEEEERS', response.data)
            setGroupMembers(response.data || []); 
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function handleGroupChange(event) {
        const groupID = event.target.value;
        setSelectedGroup(groupID);
        getGroupMembers(groupID);
    }


    // --------------------------------------- create user ---------------------------------------

    const handleCreateUser = () => {

      if (document.getElementById("username").value === "" || document.getElementById("password").value === "" || document.getElementById("e-mail").value === "") {
          alert("Please fill in all fields!");
          return;
      }

      const newUser = {
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
          email: document.getElementById("e-mail").value,
          isAdmin: isChecked
      };
  
      const userDetail = {
          userID: null,
          firstname: document.getElementById("first_name").value,
          lastname: document.getElementById("last_name").value,
          date_of_birth: document.getElementById("birthday").value,
          position: document.getElementById("position").value
      };
  
      const token = localStorage.getItem('token');
      const headers = { "x-access-token": token };
  
      axios.post('http://localhost:7979/users/create', newUser, { headers })
          .then(res => {
              const newUserId = res.data.id;
              userDetail.userID = newUserId;
  
              return axios.post('http://localhost:7979/userDetails/create', userDetail, { headers });
          })
          .then(res => {
              console.log('User details created:', res.data);
              const message = document.createElement('p');
              message.textContent = 'User has been created!';
              document.querySelector('.create-user-section').appendChild(message);
              setTimeout(() => {
                  message.remove();
              }, 3000);
              window.location.reload();
          })
          .catch(err => {
              console.error('Error creating user:', err);
          });
  };

  // --------------------------------------- change user details ---------------------------------------

  function displayMessage(elementId, message) {
    const parent = document.getElementById(elementId);
    if (!parent) {
        return;
    }
    parent.style.display = 'block';
    const msgElement = document.createElement('p');
    msgElement.textContent = message;
    parent.appendChild(msgElement);
    setTimeout(() => {
        msgElement.remove();
        parent.style.display = 'none';
    }, 3000);
}

const handleChangeUserDetails = () => {
  const editedUserID = document.getElementById("change-user-dropdown").value;
  const newUsername = document.getElementById("new-username").value;
  const newFirstName = document.getElementById("new-first-name").value;
  const newLastName = document.getElementById("new-last-name").value;
  const newEmail = document.getElementById("new-email").value;
  const newPassword = document.getElementById("new-password").value;
  const newPosition = document.getElementById("new-position").value;
  const newBirthday = document.getElementById("new-birthday").value;

  if (newUsername) {
      axios.put(`http://localhost:7979/users/updateUsername/${editedUserID}`, { username: newUsername }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Username updated:', res.data);
          displayMessage('new-username-message', 'Username updated');
      }).catch((err) => {
          console.log('Error updating username:', err);
      });
  }

  if (newFirstName) {
      axios.put(`http://localhost:7979/userDetails/updateFirstname/${editedUserID}`, { firstname: newFirstName }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('First Name updated:', res.data);
          displayMessage('new-first-name-message', 'First Name updated');
      }).catch((err) => {
          console.log('Error updating first name:', err);
      });
  }

  if (newLastName) {
      axios.put(`http://localhost:7979/userDetails/updateLastname/${editedUserID}`, { lastname: newLastName }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Last Name updated:', res.data);
          displayMessage('new-last-name-message', 'Last Name updated');
      }).catch((err) => {
          console.log('Error updating last name:', err);
      });
  }

  if (newEmail) {
      axios.put(`http://localhost:7979/users/updateEmail/${editedUserID}`, { email: newEmail }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Email updated:', res.data);
          displayMessage('new-email-message', 'Email updated');
      }).catch((err) => {
          console.log('Error updating email:', err);
      });
  }

  if (newPassword) {
      axios.put(`http://localhost:7979/users/updatePassword/${editedUserID}`, { password: newPassword }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Password updated:', res.data);
          displayMessage('new-password-message', 'Password updated');
      }).catch((err) => {
          console.log('Error updating password:', err);
      });
  }

  if (newPosition) {
      axios.put(`http://localhost:7979/userDetails/updatePosition/${editedUserID}`, { position: newPosition }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Position updated:', res.data);
          displayMessage('new-position-message', 'Position updated');
      }).catch((err) => {
          console.log('Error updating position:', err);
      });
  }


  if(isCheckedUpdate){
      axios.put(`http://localhost:7979/users/updateIsAdmin/${editedUserID}`, { isAdmin: isCheckedUpdate }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('IsAdmin updated:', res.data);
          displayMessage('new-isAdmin-message', 'IsAdmin updated');
      }).catch((err) => {
          console.log('Error updating isAdmin:', err);
      });
  }

  if (newBirthday) {
      axios.put(`http://localhost:7979/userDetails/updateDateOfBirth/${editedUserID}`, { dateOfBirth: newBirthday }, {
          headers: {
              "x-access-token": localStorage.getItem('token'),
          },
      }).then((res) => {
          console.log('Date of Birth updated:', res.data);
          displayMessage('new-birthday-message', 'Date of Birth updated');
      }).catch((err) => {
          console.log('Error updating date of birth:', err);
      });
  }

  window.location.reload();
};

    // --------------------------------------- delete user ---------------------------------------

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
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while deleting user!';
            document.querySelector('.delete-user-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });


    }
    // ------------------------------------------create group--------------------------------------------------

    const handleCreateGroup = () => {
        const newGroup = {
            name: document.getElementById("group-name").value,
            description: document.getElementById("group-description").value,
        };
    
        axios.post('http://localhost:7979/groupChat/createGroup', newGroup, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {

            if (selectedFile) {
                handleFileUpload(res.data.id);
            } else {
                const message = document.createElement('p');
                message.textContent = 'Group has been created!';
                document.querySelector('.create-group-section').appendChild(message);
                setTimeout(() => {
                    message.remove();
                }, 3000);
                window.location.reload();
            }
        }).catch((err) => {
            console.error('An error occurred while creating group:', err);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while creating group!';
            document.querySelector('.create-group-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });
    };
    

    // ------------------------------------------delete group--------------------------------------------------

    const handleDeleteClick = () => {
        document.getElementById("delete-group-confirm-btn").style.display = "block";
    }

    const handleDeleteGroup = () => {
        const deletedGroupId = document.getElementById("delete-group-dropdown").value;
        axios.delete(`http://localhost:7979/groupChat/deleteGroup/${deletedGroupId}`, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {
            // console.log('Group deleted:', res.data);
            const message = document.createElement('p');
            message.textContent = 'Group has been deleted!';
            document.querySelector('.delete-group-section').appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);

            const confirmBtn = document.getElementById("delete-group-confirm-btn");
            confirmBtn.style.display = "none";
            window.location.reload();

        }).catch((err) => {
            console.log('An error occurred while deleting group!');
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while deleting group!';
            document.querySelector('.delete-group-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });


    }

    // ------------------------------------------add and remove user from group--------------------------------------------------

    const handleAddUserGroup = () => {
        const userID = document.getElementById("add-user-dropdown").value;
        const groupID = document.getElementById("add-group-dropdown").value;

        axios.post(`http://localhost:7979/groupChat/addMember`, { groupID, userID }, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {
            //console.log('User added to group:', res.data);
            const message = document.createElement('p');
            message.textContent = 'User has been added to group!';
            document.querySelector('.add-remove-user-section').appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);

            window.location.reload();

        }).catch((err) => {
            console.log('An error occurred while adding user to group!');
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while adding user to group!';
            document.querySelector('.add-remove-user-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });
    }

    const handleRemoveUserGroup = () => {
        const userID = document.getElementById("remove-user-dropdown").value;
        const groupID = document.getElementById("remove-group-dropdown").value;

        axios.delete(`http://localhost:7979/groupChat/removeMember`, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
            data: {
                groupID: groupID,
                userID: userID
            }
        }).then((res) => {
           
            const message = document.createElement('p');
            message.textContent = 'User has been removed from group!';
            document.querySelector('.add-remove-user-section').appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);


            window.location.reload();

        }).catch((err) => {
            console.log('An error occurred while removing user from group!');
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while removing user from group!';
            document.querySelector('.add-remove-user-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });
    }

    // ------------------------------------------change group details--------------------------------------------------
  
    const handleChangeGroupDetails = () => {
        const editedGroupID = document.getElementById("change-group-dropdown").value;
        const newGroupName = document.getElementById("new-group-name").value;
        const newGroupDescription = document.getElementById("new-group-description").value;
        
        if(newGroupName){
            axios.put(`http://localhost:7979/groupChat/updateGroup/${editedGroupID}`, { name: newGroupName }, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            }).then((res) => {
                console.log('Group name updated:', res.data);
            }).catch((err) => {
                console.log('Error updating group name:', err);
            });
        }

        if(newGroupDescription){
            axios.put(`http://localhost:7979/groupChat/updateGroup/${editedGroupID}`, { description: newGroupDescription }, {
                headers: {
                    "x-access-token": localStorage.getItem('token'),
                },
            }).then((res) => {
                console.log('Group description updated:', res.data);
            }).catch((err) => {
                console.log('Error updating group description:', err);
            });
        }

        if (selectedFileNew) {
            handleFileUploadNew(editedGroupID);
        } else {
            const message = document.createElement('p');
            message.textContent = 'Group details have been updated!';
            document.querySelector('.change-group-details-section').appendChild(message);
            setTimeout(() => {
                message.remove();
                window.location.reload();
            }, 3000);
        }
    }
    
    // ------------------------------------------add photo--------------------------------------------------

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = (groupID) => {
        const formData = new FormData();
        formData.append('file', selectedFile);
    
        axios.post(`http://localhost:7979/photos/uploadGroupPhoto/${groupID}`, formData, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
                'Content-Type': 'multipart/form-data',
            },
        }).then((res) => {
            setPhotoURL(res.data.fileUrl);
            const message = document.createElement('p');
            message.textContent = 'Group created and photo uploaded successfully!';
            document.querySelector('.create-group-section').appendChild(message);
            setTimeout(() => {
                message.remove();
                window.location.reload();
            }, 3000);
        }).catch((err) => {
            console.error('An error occurred while uploading photo:', err);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while uploading photo!';
            document.querySelector('.create-group-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });
    };

    const handleUpdatePhoto = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // ------------------------------------------edit photo--------------------------------------------------

    const handleFileChangeNew = (e) => {
        setSelectedFileNew(e.target.files[0]);
    };

    const handleFileUploadNew = (groupID) => {
        const formData = new FormData();
        formData.append('file', selectedFileNew);

        axios.post(`http://localhost:7979/photos/uploadGroupPhoto/${groupID}`, formData, {
            headers: {
                "x-access-token": localStorage.getItem('token'),
                'Content-Type': 'multipart/form-data',
            },
        }).then((res) => {
            setPhotoURLNew(res.data.fileUrl);
            const message = document.createElement('p');
            message.textContent = 'Group details have been updated!';
            document.querySelector('.change-group-details-section').appendChild(message);
            setTimeout(() => {
                message.remove();
                window.location.reload();
            }, 3000);
        }).catch((err) => {
            console.error('An error occurred while uploading photo:', err);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'An error occurred while uploading photo!';
            document.querySelector('.change-group-details-section').appendChild(errorMessage);
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        });
    };

    const handleUpdatePhotoNew = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
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
              <input type="checkbox"  checked={isChecked} onChange={handleCheckboxChange} id="isAdmin" />
            </div>

            <label htmlFor="birthday">Birthday:</label>
            <input type="date" id="birthday" />
            <button id="create-user-btn" onClick={handleCreateUser}>Create User</button>
          </div>

          <div className="change-user-details-section">
    <h2>Change User Details</h2>
    <select id="change-user-dropdown">
        {allUsers.map((user) => (
            <option value={user.id}>{user.username}</option>
        ))}
    </select>

    <input type="text" id="new-username" placeholder="New Username" />
    <p id="new-username-message"style={{display:'none'}}></p> 

    <input type="text" id="new-first-name" placeholder="New First Name" />
    <p id="new-first-name-message"style={{display:'none'}}></p> 

    <input type="text" id="new-last-name" placeholder="New Last Name" />
    <p id="new-last-name-message" style={{display:'none'}}></p> 

    <input type="text" id="new-email" placeholder="New Email" />
    <p id="new-email-message" style={{display:'none'}}></p> 

    <input type="password" id="new-password" placeholder="New Password" />
    <p id="new-password-message" style={{display:'none'}}></p>

    <input type="text" id="new-position" placeholder="New Position" />
    <p id="new-position-message" style={{display:'none'}}></p> 

    <div className="IsAdmin">
        <p style={{ marginRight: "1.5vw" }}>Admin </p>
        <input type="checkbox" checked={isCheckedUpdate} onChange={handleCheckboxChangeUpdate} id="new-isAdmin" />
        <p id="new-isAdmin-message"  style={{display:'none'}}></p>
    </div>

    <label htmlFor="new-birthday">Birthday:</label>
    <input type="date" id="new-birthday" />
    <p id="new-birthday-message"></p> 

    <button id="change-user-details-btn" onClick={handleChangeUserDetails}>Change User Details</button>
</div>

          <div className="delete-user-create-group-section"
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
              <button id="addPhoto" onClick={handleUpdatePhoto}>Add Photo</button>
              <input type="file"  ref={fileInputRef} id="group-photo"  onChange= {handleFileChange} style={{ display: "none" }} />
              <div className='pic'>
              {selectedFile ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected File"
                  style={{ maxWidth: "50px", maxHeight: "50px" }}
                />
              ) : (
                <img
                  src= {photoURL}
                  alt="Placeholder"
                  style={{ width: "50px", height: "50px", borderRadius: "50%", margin: 'auto'}}
                />
              )}
            </div>
              <button id="create-group-btn" onClick= {handleCreateGroup}>Create Group</button>
            </div>

          </div>

          <div className="delete-group-section">
            <h2>Delete Group</h2>
            <select id="delete-group-dropdown">
                {allGroups.map((group) => (
                    <option value={group.id}>{group.groupname}</option>
                ))}
            </select>
            <button id="delete-group-btn" onClick={handleDeleteClick}>Delete Group</button>
            <button id="delete-group-confirm-btn" style={{ display: "none" }} onClick={handleDeleteGroup}> 
              Confirm Delete
            </button>
          </div>

          <div className="add-remove-user-section">
          <h2>Add User to Group</h2>

            <select id="add-group-dropdown">
            {allGroups.map((group) => (
                    <option value={group.id}>{group.groupname}</option>
                ))}
            </select>
            <div className= "user-in-group">
            <select id="add-user-dropdown">
              {allUsers.map((user) => (
                  <option value={user.id}>{user.username}</option>
              ))}
            </select>
            </div>

            <button id="add-user-group-btn" onClick={handleAddUserGroup}>Add User to Group</button>
        
            <h2>Remove User from Group</h2>
            <select id="remove-group-dropdown" onChange={handleGroupChange}>
                <option value="">Select a Group</option>
                {allGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.groupname}</option>
                ))}
            </select>
            {selectedGroup && (
                <div className="user-in-group">
                    <select id="remove-user-dropdown">
                        <option value="">Select a User</option>
                        {groupMembers.map((user) => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                    </select>
                </div>
            )}

           
            <button id="remove-user-group-btn" onClick={handleRemoveUserGroup}>Remove User from Group</button>
        </div>

          <div className="change-group-details-section">
            <h2>Change Group Details</h2>
            <select id="change-group-dropdown">
                {allGroups.map((group) => (
                    <option value={group.id}>{group.groupname}</option>
                ))}
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
            <button id="change-group-photo" onClick={handleUpdatePhotoNew}> Change Group Photo </button>
            <input type="file" id="group-photo" ref={fileInputRef} style={{ display: "none" }} onChange= {handleFileChangeNew} />
            {selectedFileNew ? (
                <img
                  src={URL.createObjectURL(selectedFileNew)}
                  alt="Selected File"
                  style={{ maxWidth: "50px", maxHeight: "50px" }}
                />
              ) : (
                <img
                  src= {photoURLNew}
                  alt="Placeholder"
                  style={{ width: "50px", height: "50px", borderRadius: "50%", margin: 'auto'}}
                />
              )}
            <button id="change-group-details-btn" onClick={handleChangeGroupDetails}>Change Group Details</button>
          </div>
        </div>

        <div className="statistics-section">
          <h2>Statistics</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
