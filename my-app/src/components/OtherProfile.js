import '../components-style/Profile.css';
import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import axios from "axios";
import { useParams } from "react-router-dom";

function OtherProfile() {

    const { otherUserID } = useParams();
    const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/300");

    const [userAbout, setUserAbout] = useState({});
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        getUserDetails(otherUserID);
        getUserEmail(otherUserID);
    }, [userAbout]);

    useEffect(() => {
        getUserProfilePhoto();
    }, [])

    function getUserDetails(userId){
        axios.get(`http://localhost:7979/userDetails/${userId}`,{
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {
            const about = res.data[0];
            console.log(about);
            setUserAbout(about);
            
        }).catch((err) => {
            console.log('An error occurred  while getting user details!');
        })

      }

      function getUserEmail(userId){
        axios.get(`http://localhost:7979/users/${userId}`,{
            headers: {
                "x-access-token": localStorage.getItem('token'),
            },
        }).then((res) => {
            const email = res.data.email;
            setUserEmail(email);
           
        }).catch((err) => {
            console.log('An error occurred  while getting user email!');
        })
      }


      function getUserProfilePhoto(){
        const user = JSON.parse(localStorage.getItem('user'));
        const filename = otherUserID + 'profilePic.jpg';
        axios.get(`http://localhost:7979/photos/getPhoto/${otherUserID}?filename=${filename}`, {
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

    return(
        <div>
            <NavBar />
            <div className='main-user-container'>
                <div className='profile-container'>
                    <div className='profile-picture'>
                    <div className='pic'>
                        <img src={photoURL} alt="profile-pic"  style={{ width: "300px", height: "300px", borderRadius: "50%", margin: 'auto'}}/>
                        
                    </div>
                    </div>

                    <div className='profile-abour'>
                    <div className='profile-about-header'>
                  <h1>{userAbout.firstname}'s Information</h1>
                  </div>

                  <div className='profile-about-details'>
                        <div className='profile-about-details-container'>
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
                      <p>Phone:</p> <div id="phone_value" >{userAbout.phone}</div>
                    </div>
                    <div id='hobby'>
                      <p>Hobby: </p> <div id="hobby_value" >{userAbout.hobby}</div>
                    </div>
                    <div id='about'>
                      <p style={{marginRight:'3vw'}}>About:</p>  <div id="about_value" >{userAbout.about}</div>
                    </div>
                        </div>
                    </div>

                    </div>

                   
                </div>
            </div>
        </div>
    )

}

export default OtherProfile;