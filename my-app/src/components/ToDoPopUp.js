import React from "react";
import { useState, useEffect } from "react";
import '../components-style/ToDoPopUp.css';
import axios from "axios";


function ToDoPopUp({ toDoListContent, userID, onClose }) {
    const [flags, setFlags] = useState([]);

    const setItemsInPoPuP = () => {
        const content = document.querySelector('#inputPopContent');
        content.value = toDoListContent;

    }

    const getInputs = () => {
        const titleElement = document.querySelector('#inputPopTitle');
        const contentElement = document.querySelector('#inputPopContent');
        const endDateElement = document.querySelector('#inputPopDate');
        const flagElement = document.querySelector('#inputPopFlag');

        const title = titleElement.value ? titleElement.value : null;
        const content = contentElement.value ? contentElement.value : null;
        const flag = flagElement.value ? flagElement.value : null;
        const endDate = endDateElement.value ? endDateElement.value : null;

        return {title, content, endDate, flag};
    }

    const handleSave = () => {
      const { title, content, endDate, flag } = getInputs();
      const startDate = new Date();
  
      if (!title || !content || !endDate) {
          alert("Title, content, and end date are required!");
          return;
      }
  
      if (new Date() > new Date(endDate)) {
          alert("End date must be in the future!");
          return;
      }

  
      axios.post(
          "http://localhost:7979/toDoList/addToDo",
          {
              title: title,
              content: content,
              flag_id: flag,
              user_id: userID,
              start_date: startDate,
              end_date: endDate,
          },
          {
              headers: {
                  'x-access-token': localStorage.getItem('token')
              }
          }
      ).then((res) => {
          console.log(res.data);
          onClose();
      }).catch((err) => {
          console.log('ERROR ADDING TODO ITEM');
      });
  };
  


    useEffect(() => {
        getFlags();
        setItemsInPoPuP();
      }, []);

    const getFlags = () => {
        axios
          .get("http://localhost:7979/flags/allFlags", {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            setFlags(res.data);
            console.log(res.data);
          })
          .catch((err) => {
            console.log("ERROR FLAGS FRONTEND!");
          });
      };

  

  return (
    <div style={{ marginTop: "11vh" }}>
        <div className="overlay"></div>
      <div className="toDoContainer">
        <div className="toDoHeader">
        <h1> Create a new to-do item</h1>
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
        <div className="toDoEndDate">
          <h2>End Date</h2>
          <div className="inputDate">  <input type="date" id="inputPopDate" /> </div>
         
        </div>
        <div className="toDoFlag">
          <h2>Flag</h2>
          <div className="inputFlag">
          <select id="inputPopFlag">
                      {flags.map((flag, index) => (
                        <option key={index} value={flag.id}>
                          {flag.name}
                        </option>
                      ))}
                    </select>
          </div>
        </div>
        <div className="toDoButtons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      </div>

    </div>

  );
}

export default ToDoPopUp;
