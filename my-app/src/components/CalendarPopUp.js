import React from "react";
import { useState, useEffect } from "react";
import '../components-style/ToDoPopUp.css';
import axios from "axios";


function CalendarPopUp({ toDoListInfo, onClose }) {
   
    const setItemsInPoPuP = async () => {
        const content = document.querySelector('#inputPopContent');
        content.value = toDoListInfo.content;

        const title = document.querySelector('#inputPopTitle');
        title.value = toDoListInfo.title;

        const flag = document.querySelector('#inputPopFlag');
        try {
            const flagName = await getFlagNameById(toDoListInfo.flagID);
            flag.value = flagName;
          } catch (error) {
            console.log("eroare front", error);
          }
    }

    useEffect(() => {
        setItemsInPoPuP();
      }, []);


      async function getFlagNameById(flagID) {
        try {
          const response = await axios.get(`http://localhost:7979/flags/getFlagById/${flagID}`, {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          });
      
          console.log("FLAG NAME:", response.data[0].name);
          return response.data[0].name;
        } catch (error) {
          console.log("ERROR FRONTEND FLAG NAME", error);
          return null;
        }
      }
   

  

  return (
    <div style={{ marginTop: "11vh" }}>
        <div className="overlay"></div>
      <div className="toDoContainer">
        <div className="toDoHeader">
        <h1> To-Do Item Details:</h1>
        </div>
      <div className="toDoMainContent">
        <div classname="toDoTitle">
          <h2>Title</h2>
          <div className= 'inputTitle'><input type="text" placeholder="Title" id='inputPopTitle'/></div>
          
        </div>

        <div className="toDoContent">
          <h2>Content</h2>
          <div className= 'inputContent'> <input type="text" placeholder="Content" id="inputPopContent" /> </div>
        </div>

        </div>
        <div className="toDoFlag">
          <h2>Flag</h2>
          <div className="inputFlag">
          <input type="text" placeholder="Flag" id="inputPopFlag" />

          </div>
        </div>
        <div className="toDoButtons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      </div>



  );
}

export default CalendarPopUp;
