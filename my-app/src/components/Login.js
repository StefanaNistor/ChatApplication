import React, { useEffect } from 'react';
import '../components-style/Login.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [shouldRedirect, setShouldRedirect] = useState(false);
    
    const navigate = useNavigate();

    const handleOnClick = (e) => {
            e.preventDefault();
            const form = document.getElementById('loginForm');
            const username = form.username.value;
            const password = form.password.value;
            const email = form.email.value;
            axios.post('http://localhost:7979/users/login', { username, password, email })
            .then((res) => {
                console.log('Login successful!');
                setShouldRedirect(true);
                const token = res.data.token;
                localStorage.setItem('token',token);
                const user = res.data.userData;
                // console.log('User:', JSON.stringify(user));
                localStorage.setItem('user', JSON.stringify(user));
                // console.log('Token:', JSON.stringify(token));
            }
            )
            .catch((err) => {
                console.log('An error occurred!');   
                alert('Invalid user and email, please try again! :)');
            });      
        }

    if (shouldRedirect) {
        navigate('/main');
    }



    useEffect(() => {
       
    }, []);

  return (
    <div>
        <div className= 'container'>
        <div className='photo-container'>
        <img src='../loginPicture.jpg' id='loginPic' alt='LoginPhoto'/>
        </div>
        <div className='login-container'>
        <br/>
        <h1>MyApp Name</h1>
        <form id ='loginForm'> 
        <h1>Login</h1>
            <label>
            <FontAwesomeIcon icon={faUser} style={{ padding: '10px', color:'#9B4444'}} />
            <input type="text" name="username" id='user' placeholder='Enter your username...' />
            </label>
            <br />
            <label>
            <FontAwesomeIcon icon={faLock} style={{ padding: '10px', color:'#9B4444' }} />
            <input type="password" name="password" id='pas' placeholder='Enter your password...' />
            </label>
            <br />
            <label>
            <FontAwesomeIcon icon={faEnvelope} style={{ padding: '10px', color:'#9B4444' }} />
            <input type="email" name="email" id='email'placeholder='Enter your email...' />
            </label>
            <button type="submit" onClick={handleOnClick} id='loginBtn'>Login</button>
        </form> 
        </div>
        </div>
    </div>
  );
}

export default Login;