import React, { useEffect, useRef } from "react";
import NavBar from './NavBar';
import axios from 'axios';
import { useState } from 'react';
import '../components-style/Profile.css';


function Profile() {
  const[userAbout, setUserAbout] = useState({});
  const [userID, setUserID] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user.id;
  const userEmail = user.email;
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [photoURL, setPhotoURL] =  useState("https://via.placeholder.com/300");
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserID(userId);
    getUserDetails(userId);

  }, [userAbout]);

  useEffect(()=>{
    getUserProfilePhoto();
  }, [])
  
  

  function getUserDetails(userId){
    axios.get(`http://localhost:7979/userDetails/${userId}`,{
        headers: {
            "x-access-token": localStorage.getItem('token'),
        },
    }).then((res) => {
        const about = res.data[0];
        setUserAbout(about);
        
    }).catch((err) => {
        console.log('An error occurred  while getting user details!');
    })

  }

  function makeEditable(isEditing){
    if(isEditing){
      const phone = document.getElementById('phone_value');
      phone.contentEditable = true;
      const hobby = document.getElementById('hobby_value');
      hobby.contentEditable = true;
      const about = document.getElementById('about_value');
      about.contentEditable = true;
      setIsEditable(true);
    }else{
      const phone = document.getElementById('phone_value');
      phone.contentEditable = false;
      const hobby = document.getElementById('hobby_value');
      hobby.contentEditable = false;
      const about = document.getElementById('about_value');
      about.contentEditable = false;
      setIsEditable(false);
    }

  }

  function switchButtons(isEditing) {
    console.log('Switching buttons...');
    if (isEditing) {
      const editBtn = document.getElementById('editBtn');
      editBtn.style.display = 'none';
      const saveBtn = document.getElementById('saveBtn');
      saveBtn.style.display = 'block';
    } else {
      const editBtn = document.getElementById('editBtn');
      editBtn.style.display = 'block';
      const saveBtn = document.getElementById('saveBtn');
      saveBtn.style.display = 'none';
    }
  }

  function editAbout(){
    switchButtons(true);
    makeEditable(true);

  }

  const handleEditing = (e) => {
    e.preventDefault();
    editAbout();
    console.log('Editing...')
  }

  function getAboutText(){
    const firstname = document.getElementById('firstname_value').innerText;
    const lastname = document.getElementById('lastname_value').innerText;
    const date_of_birth = document.getElementById('date_of_birth_value').innerText;
    const phone = document.getElementById('phone_value').innerText;
    const hobby = document.getElementById('hobby_value').innerText;
    const about = document.getElementById('about_value').innerText;
    const email = document.getElementById('email_value').innerText;

    const newUserAbout ={
      firstname: firstname,
      lastname: lastname,
      date_of_birth: date_of_birth,
      phone: phone,
      hobby: hobby,
      about: about,
      email: email
    };

    return newUserAbout;
  }

  function saveNewAbout(userID, newUserAbout){
    // phone
    axios.put(`http://localhost:7979/userDetails/updatePhone`,{
      phone: newUserAbout.phone,
      userID: userID
    },{
        headers: {
            "x-access-token": localStorage.getItem('token'),
        },
    }).then((res) => {
        console.log('Phone updated successfully');
    }).catch((err) => {
        console.log('An error occurred while updating phone!');
    })

    // hobby
    axios.put(`http://localhost:7979/userDetails/updateHobby`,{
      hobby: newUserAbout.hobby,
      userID: userID
    },{
        headers: {
            "x-access-token": localStorage.getItem('token'),
        },
    }).then((res) => {
        console.log('Hobby updated successfully');
    }).catch((err) => {
        console.log('An error occurred while updating hobby!');
    })

    // about
    axios.put(`http://localhost:7979/userDetails/updateAbout`,{
      about: newUserAbout.about,
      userID: userID
    },{
        headers: {
            "x-access-token": localStorage.getItem('token'),
        },
    }).then((res) => {
        console.log('About updated successfully');
    }).catch((err) => {
        console.log('An error occurred while updating about!');
    })
  }

  const handleSave = (e) => {
    e.preventDefault();
    makeEditable(false);
    switchButtons(false);
    const newUserAbout = getAboutText();
    console.log('New user about:', newUserAbout);
    setUserAbout(newUserAbout);
    saveNewAbout(userID, newUserAbout);
    getUserDetails(userID);
  }


  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  
    const user = JSON.parse(localStorage.getItem('user'));
    const userID = user.id;
  
    const formData = new FormData();
    formData.append('file', event.target.files[0]);
  
    axios.post(`http://localhost:7979/photos/uploadPhoto/${userID}`, formData, {
      headers: {
        "x-access-token": localStorage.getItem('token'),
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => {
      console.log('Photo uploaded successfully');
      setPhotoURL(res.data.fileUrl); // Update the photo URL after successful upload
    }).catch((err) => {
      console.log('An error occurred while uploading photo!');
    })
  };


  function getUserProfilePhoto(){
    const user = JSON.parse(localStorage.getItem('user'));
    const userID = user.id;
    const filename = userID + 'profilePic.jpg';
    axios.get(`http://localhost:7979/photos/getPhoto/${userID}?filename=${filename}`, {
      headers: {
        "x-access-token": localStorage.getItem('token'),
      },
      responseType: 'blob' 
    }).then((res) => {
      const url = URL.createObjectURL(res.data);
      setPhotoURL(url);
    
    }).catch((err)=>{
      console.log(err);
    }) 
  }

   const handleUpdatePhoto = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
        <NavBar />
        <div className='main-user-container'>
       (
             <div className='profile-container'>
             <div className='profile-picture'>
             <div className='pic'>
               {selectedFile ? (
                 <img
                   src={URL.createObjectURL(selectedFile)}
                   alt="Selected File"
                   style={{ width: "300px", height: "300px", borderRadius: "50%", margin: 'auto'}}
                 />
               ) : (
                 <img
                   src= {photoURL}
                   alt="Placeholder"
                   style={{ width: "300px", height: "300px", borderRadius: "50%", margin: 'auto'}}
                 />
               )}
             </div>
             <input type='file' ref={fileInputRef} id='fileForProfile' onChange={handleFileChange} style = {{display :'none'}}/>
             <button id='uploadBtn' onClick={handleUpdatePhoto}>Upload photo</button>
               </div>
                 <div className='profile-about'>
                   <div className='profile-about-header'>
                   <h1>Personal Information</h1>
                   </div>
                   
                    <div className='profile-about-details'>
                     <div className='profile-about-details-container'>
                      <div id='position-profile'>
                        <p>Position:</p> <div id="position_value">{userAbout.position}</div>
                      </div>
                     <div id='firstname'>
                     <p>First Name:</p> <div id="firstname_value">{userAbout.firstname}</div>
                     </div>
                     <div id='lastname'>
                       <p>Last Name:</p> <div id="lastname_value">{userAbout.lastname}</div>
                     </div>
                     <div id='email_profile'>
                       <p>E-mail:</p> <div id="email_value">{userEmail}</div>
                     </div>
                     <div id='date_of_birth'>
                       <p>Birthday: </p> <div id="date_of_birth_value">{userAbout.date_of_birth}</div>
                     </div>
                     <div id='phone'>
                       <p>Phone:</p> <div id="phone_value" className={isEditable ? "editable" : ""}>{userAbout.phone}</div>
                     </div>
                     <div id='hobby'>
                       <p>Hobby: </p> <div id="hobby_value" className={isEditable ? "editable" : ""}>{userAbout.hobby}</div>
                     </div>
                     <div id='about'>
                       <p style={{marginRight:'3vw'}}>About:</p>  <div id="about_value" className={isEditable ? "editable" : ""}>{userAbout.about}</div>
                     </div>
                     
                 <button id='editBtn' onClick={handleEditing}>Edit</button>
                 <button id='saveBtn' onClick={handleSave} style={{display:'none'}}> Save </button>
                 </div>
                 </div>
             </div>
         </div>
       )
        </div>
    </div>
  );
  
}

export default Profile;