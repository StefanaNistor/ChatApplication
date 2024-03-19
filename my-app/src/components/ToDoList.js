import React, { useEffect } from "react";
import NavBar from "./NavBar";
import "../components-style/ToDoList.css";
import axios from "axios";
import { useState } from "react";

function ToDoList() {
  const [toDoListItems, setToDoListItems] = useState([]);
  const [flags, setFlags] = useState([]);
  const [updatedToDo, setUpdatedToDo] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [areAddingToDo, setAreAddingToDo] = useState(false);
  const [username, setUsername] = useState(user.username);

  useEffect(() => {
    getToDoListItems();
    getFlags();
    setUsername(user.username);
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
      })
      .catch((err) => {
        console.log("ERROR FLAGS FRONTEND!");
      });
  };

  const getToDoListItems = () => {
    const userID = user.id;
    axios
      .get(`http://localhost:7979/toDoList/${userID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        const items = res.data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          flagID: item.flag_id,
          start_date: item.start_date,
          end_date: item.end_date,
        }));
        setToDoListItems(items);
      })
      .catch((err) => {
        console.log("ERROR TODO FRONTEND!");
      });
  };


  function getToDoDataInputs() {

    const titleElement = document.getElementById("todoTitleInput");
    const contentElement = document.getElementById("todoContentInput");
    const flagElement = document.getElementById("todoFlagInput");
    const endDateElement = document.getElementById("todoEndDateInput");

    const title = titleElement.value ? titleElement.value : null;
    const content = contentElement.value ? contentElement.value : null;
    const flagID = flagElement.value ? flagElement.value : null;
    const endDate = endDateElement.value ? endDateElement.value : null;

    return { title, content, flagID, endDate };
  }

  const handleAddNewToDo = (e) => {
    e.preventDefault();
    const { title, content, flagID, endDate } = getToDoDataInputs();
    const userID = user.id;

    const stardDate = new Date();
    axios
      .post(
        "http://localhost:7979/toDoList/addToDo",
        {
          title: title,
          content: content,
          flag_id: flagID,
          user_id: userID,
          start_date: stardDate,
          end_date: endDate,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        console.log("To Do added successfully!");
        getToDoListItems();
      })
      .catch((err) => {
        console.log("ERROR ADD TODO FRONTEND!");
      });

      const addBtn = document.getElementById("addBtn");
      addBtn.style.display = "block";
      setAreAddingToDo(false);
  };

  const handleToDoEdit = (toDoId) => {
    const todoItem = toDoListItems.find((item) => item.id === toDoId);
    setUpdatedToDo({
      id: toDoId,
      title: todoItem.title,
      content: todoItem.content,
      flagID: todoItem.flagID,
      start_date: todoItem.start_date,
      end_date: todoItem.end_date,
    });
  };

  const handleCancelEdit = () => {
    setUpdatedToDo(null);
  };

  const handleCancelAdd = (e) => {
    e.preventDefault();
       const form = document.getElementById("add-to-do-form");
       form.reset();
   setAreAddingToDo(false);
       const addBtn = document.getElementById("addBtn");
       addBtn.style.display = "block";
   };

  const handleSaveToDo = () => {
    const { id, title, content, flagID, start_date, end_date } = updatedToDo;
    const userID = user.id;
    axios
      .put(
        "http://localhost:7979/toDoList/updateToDo",
        {
          id,
          title,
          content,
          flag_id: flagID,
          user_id: userID,
          start_date,
          end_date,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        console.log("To Do updated successfully!");
        getToDoListItems();
        setUpdatedToDo(null);
      })
      .catch((err) => {
        console.log("ERROR UPDATE TODO FRONTEND!");
      });
  };

  const setFormVisibility = () => {
    setAreAddingToDo(true);
  };

  const handleToDoDelete = (toDoId) => {
    console.log("To Do ID:", toDoId);
    axios
      .delete(`http://localhost:7979/toDoList/deleteToDo/${toDoId}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log("To Do deleted successfully!");
        getToDoListItems();
      })
      .catch((err) => {
        console.log("ERROR DELETE TODO FRONTEND!");
      });
  };

  return (
    <div>
      <NavBar />
      <div className="main-container-todo-calendar" style= {{display: 'grid', gridTemplateColumns:'2.1fr 2fr', background:'#EEEEEE'}}>
      <div className="main-todo-container"
        style={{ overflowY: "scroll", height: "100vh" }}
      >
        <h2>Add to your to do list!</h2>
        <button onClick={setFormVisibility} id="addBtn">
          Add a new to-do!
        </button>
        <div className="add-to-do-container">
          {areAddingToDo && (
            <form id="add-to-do-form" className="active">
             <div className="add-form-content">
            <input type="text" placeholder="Title" id="todoTitleInput" />
            <textarea placeholder="Content" id="todoContentInput" rows="4"></textarea>
            <input type="text" placeholder="End Date" id="todoEndDateInput" />
            <select id="todoFlagInput">
              {flags.map((flag, index) => (
                <option key={index} value={flag.id}>
                  {flag.name}
                </option>
              ))}
            </select>
            <div className="add-to-do-buttons">
            <button onClick={handleCancelAdd} id="cancelAddBtn"> Cancel </button>
          <button onClick={handleAddNewToDo} id="saveToDo" > Save To Do </button>
          </div>
          </div>

            </form>
          )}
        </div>

        <div id="to-do-list-container">
          <div className="to-do-list">
            {toDoListItems.map((item, index) => (
              <div key={index} className="to-do-item" id={item.id}>
                {updatedToDo && updatedToDo.id === item.id ? (
                  <div className="to-do-item-content">
                    <input
                      type="text"
                      value={updatedToDo.title}
                      onChange={(e) =>
                        setUpdatedToDo({
                          ...updatedToDo,
                          title: e.target.value,
                        })
                      }
                    />
                    <textarea
                      value={updatedToDo.content}
                      onChange={(e) =>
                        setUpdatedToDo({
                          ...updatedToDo,
                          content: e.target.value,
                        })
                      }
                      rows="4"
                    ></textarea>
                    <select
                      value={updatedToDo.flagID}
                      onChange={(e) =>
                        setUpdatedToDo({
                          ...updatedToDo,
                          flagID: e.target.value,
                        })
                      }
                    >
                      {flags.map((flag, index) => (
                        <option key={index} value={flag.id}>
                          {flag.name}
                        </option>
                      ))}
                    </select>
                    <div className="to-do-buttons">
                      <button onClick={handleSaveToDo}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="to-do-item-content">
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                    <div className="to-do-item-dates">
                      <p>Start date: {item.start_date.slice(0, -14)}</p>
                      <p>End date: {item.end_date.slice(0, -14)}</p>
                    </div>
                    <div className="flag-container">
                      Flag: {flags[item.flagID - 1]?.name}
                    </div>
                    <div className="to-do-buttons">
                      <button onClick={() => handleToDoEdit(item.id)}>
                        Edit
                      </button>
                      <button onClick={() => handleToDoDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="calendar-container" style= {{ display: 'flex', justifyContent: 'center'}}>
      <div className="calendar-Header" style={{display: 'flex',flexDirection: 'row', marginTop: '10vh', color:'#422020'}}> <h2>{username} </h2> <h2>'s Personal Calendar</h2></div>
      
      </div>

    </div>

    </div>
  );
}

export default ToDoList;

