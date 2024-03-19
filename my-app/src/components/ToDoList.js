import React, { useEffect } from "react";
import NavBar from "./NavBar";
import "../components-style/ToDoList.css";
import axios from "axios";
import { useState } from "react";

function ToDoList() {
  const [toDoListItems, setToDoListItems] = useState([]);
  const [flags, setFlags] = useState([]);
  const [updatedToDoId, setUpdatedToDoId] = useState(-1);
  const user = JSON.parse(localStorage.getItem("user"));
  const [areAddingToDo, setAreAddingToDo] = useState(false);  

  useEffect(() => {
    getToDoListItems();
    getFlags();
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
    const user = JSON.parse(localStorage.getItem("user"));
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
    const flagElement = document.querySelector("#add-to-do-form select");

    const title = titleElement.value !== null ? titleElement.value : "";
    const content = contentElement.value !== null ? contentElement.value : "";
    const flagID = flagElement.value !== null ? flagElement.value : "";

    return { title, content, flagID };
  }

  const handleAddNewToDo = (e) => {
    e.preventDefault();
    const { title, content, flagID } = getToDoDataInputs();
    const userID = user.id;

    axios
      .post(
        "http://localhost:7979/toDoList/addToDo",
        {
          title: title,
          content: content,
          flag_id: flagID,
          user_id: userID,
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

  function getToDoFromUI(toDoId) {
    let todoItem = toDoListItems.find((item) => item.id === toDoId);
    return {
      title: todoItem.title,
      content: todoItem.content,
      flagID: todoItem.flagID,
    };
  }

  function updateButtons(isEditing) {
    const editBtn = document.getElementById("editBtn");
    const delBtn = document.getElementById("delBtn");
    const updateBtn = document.getElementById("updateBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    if (isEditing) {
      editBtn.style.display = "none";
      delBtn.style.display = "none";
      updateBtn.style.display = "block";
      cancelBtn.style.display = "block";
    } else {
      editBtn.style.display = "block";
      delBtn.style.display = "block";
      updateBtn.style.display = "none";
      cancelBtn.style.display = "none";
    }
  }

  function updateToDo() {
    const toDoId = updatedToDoId;
    const { title, content, flagID } = getToDoDataInputs();
    const userID = user.id;
    axios
      .put(
        "http://localhost:7979/toDoList/updateToDo",
        {
          title: title,
          content: content,
          flag_id: flagID,
          user_id: userID,
          id: toDoId,
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

        const form = document.getElementById("add-to-do-form");
        form.reset();

        updateButtons(false);
      })
      .catch((err) => {
        console.log("ERROR UPDATE TODO FRONTEND!");
      });
  }

  const handleToDoEdit = (toDoId) => {
    setUpdatedToDoId(toDoId);
    updateButtons(true);
    const { title, content, flagID } = getToDoFromUI(toDoId);
    document.getElementById("todoTitleInput").value = title;
    document.getElementById("todoContentInput").value = content;
    document.querySelector("#add-to-do-form select").value = flagID;


  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    const form = document.getElementById("add-to-do-form");
    form.reset();
    updateButtons(false);
    setAreAddingToDo(false);
    const addBtn = document.getElementById("addBtn");
    addBtn.style.display = "block";
  };

  const setFormVisibility = () => {
     setAreAddingToDo(true);
     const addBtn = document.getElementById("addBtn");
     addBtn.style.display = "none";
  };

  return (
    <div>
      <NavBar />
      <div
        className="main-todo-container"
        style={{ overflowY: "scroll", height: "100vh" }}
      >
        <h2>Add to your to do list!</h2>
          <button onClick={setFormVisibility} id="addBtn">
              Add a new to-do!
          </button>
          <div className="add-to-do-container">
          
          { areAddingToDo && (<form id="add-to-do-form" className ='active'>
            <div className="add-form-content">
            <input type="text" placeholder="Title" id="todoTitleInput" />
            <textarea placeholder="Content" id="todoContentInput" rows="4"></textarea>
            <select>
              {flags.map((flag, index) => (
                <option key={index} value={flag.id}>
                  {flag.name}
                </option>
              ))}
            </select>
            <div className="add-to-do-buttons">
            <button onClick={handleCancelEdit} id="cancelAddBtn"> Cancel </button>
          <button onClick={handleAddNewToDo} id="saveToDo" > Save To Do </button>
          </div>
          </div>
          </form>)}
        </div>

        <div id="to-do-list-container" >
          <div className="to-do-list">
           
            {toDoListItems.map((item, index) => (
              <div key={index} className="to-do-item" id={item.id}>
                <div className="to-do-item-content"> 
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <div className="flag-container">
                  Flag: {flags[item.flagID - 1]?.name}
                </div>
                <div className="to-do-buttons">
                  <button id = 'editBtn' onClick={() => handleToDoEdit(item.id) }>Edit</button>
                  <button id='delBtn'onClick={() => handleToDoDelete(item.id)}>Delete</button>
                  <button
              onClick={updateToDo}
              id="updateBtn"
              style={{ display: "none" }}
            >
              Update
            </button>
            <button
              onClick={handleCancelEdit}
              id="cancelBtn"
              style={{ display: "none" }}
            >
              Cancel
            </button>
                </div>
              </div>
            </div> ))}

          </div>
        
        </div>

      
      </div>
    </div>
  );
}

export default ToDoList;
