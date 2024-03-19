import '../components-style/OtherProfile.css';
import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import axios from "axios";


function OtherProfile({ clickedUserID }) {

    return(
        <div className='otherProfile-container'>
            <NavBar />
            <div className='otherProfileBody'>
                <h1>Other Profile</h1>
            </div>
        </div>
    )

}

export default OtherProfile;