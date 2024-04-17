import React, { useState, useEffect, useRef } from "react";
import "../components-style/PrivateChat.css";
import ToDoPopUp from "./ToDoPopUp";
import axios from "axios";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

function PrivateChat({ chatID }) {
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [otherUser, setOtherUser] = useState({});
  const [otherUserDetails, setOtherUserDetails] = useState({});
  const [isToDoPopupOpen, setIsToDoPopupOpen] = useState(false);
  const [toDoPopUpContent, setToDoPopUpContent] = useState("");
  const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/70");
  const socket = io("http://localhost:7979");
  const user = JSON.parse(localStorage.getItem("user"));
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const userId = user.id;

  useEffect(() => {
    if (chatID) {
      getMessages(chatID);
    }
    getOtherUser(chatID);
    //getUserProfilePhoto();
  }, [chatID]);

  function getMessages(chatID) {
    axios
      .get(`http://localhost:7979/privateMessages/getByChat/${chatID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log("Messages:", res.data);
        setMessages(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting messages:", err);
      });
  }

  useEffect(() => {
    fetchUsernames();
  }, [messages]);

  useEffect(() => {
    if (chatID) {
      socket.emit("join private chat", { roomId: chatID });
    }

    socket.on("chat private client", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (chatID) {
        socket.emit("leave chat", { roomId: chatID });
      }
      socket.off("chat private client");
    };
  }, [chatID]);


  async function getUserProfilePhoto(otherID) {
    if (typeof otherID !== "number") {
      console.error("Invalid otherUserID:", otherID);
      setPhotoURL("https://via.placeholder.com/70"); // Placeholder URL
      return;
    }

    const filename = otherID + "profilePic.jpg";
    try {
      const response = await axios.get(
        `http://localhost:7979/photos/getPhoto/${otherID}?filename=${filename}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          responseType: "blob",
        }
      );
      const url = URL.createObjectURL(response.data);
      setPhotoURL(url);
    } catch (error) {
      console.log("Error fetching user profile photo:", error);
      setPhotoURL("https://via.placeholder.com/70"); // Placeholder URL
    }
  }


  async function getOtherUserDetails(userId) {
    try {
      const response = await axios.get(
        `http://localhost:7979/userDetails/${userId}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );

      setOtherUserDetails(response.data[0]);
    } catch (error) {
      console.error("An error occurred while getting user details:", error);
    }
  }

  async function getOtherUser(chatID) {
    try {
      const response = await axios.get(
        `http://localhost:7979/privateChat/getByCurrentUser/${chatID}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );

      const chatArray = response.data;

      if (!chatArray || chatArray.length === 0) {
        console.log("No chats found for ID:", chatID);
        return;
      }

      const chat = chatArray.find((chat) => chat.chat_id === chatID);

      if (!chat) {
        console.log("Chat not found for ID:", chatID);
        return;
      }
      const currentUserID = JSON.parse(localStorage.getItem("user")).id;

      let otherUserId;

      if (chat.user1_id === currentUserID) {
        otherUserId = chat.user2_id;
      } else {
        otherUserId = chat.user1_id;
      }

      setOtherUser(otherUserId);
      getUserProfilePhoto(otherUserId);
      getOtherUserDetails(otherUserId);
    } catch (err) {
      console.log("An error occurred while getting other user:", err);
    }
  }

  async function getUserNameById(userID) {
    try {
      const response = await axios.get(
        `http://localhost:7979/users/username/${userID}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("An error occurred while getting user:", error);
      throw error;
    }
  }

  async function fetchUsernames() {
    const usernamesMap = {};
    for (const message of messages) {
      try {
        const username = await getUserNameById(message.user_id);
        usernamesMap[message.user_id] = username;
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    }
    setUsernames(usernamesMap);
  }

  const handleSendMessage = () => {
    const timestamp = new Date().toISOString();
    const user_id = JSON.parse(localStorage.getItem("user")).id;
    const messageInput = document.getElementById("messageInput").value;

    const messageObj = {
      user_id: user_id,
      chat_id: chatID,
      content: messageInput,
      timestamp: timestamp,
    };

    console.log("Message:", messageObj);

    socket.emit("chat private server", messageObj);
    setMessageInput("");
    //setMessages((prevMessages) => [...prevMessages, messageObj]);

    const message = document.getElementById("messageInput");
    message.value = "";
  };

  const deleteMessage = (messageID) => {
    axios
      .delete(
        `http://localhost:7979/privateMessages/deleteMsg/${messageID}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        console.log("Message deleted:", res.data);
        getMessages(chatID);

        const prompt = document.querySelector(".variousPromptsText");
        prompt.innerText = "Message deleted successfully!";
        setTimeout(() => {
          prompt.innerText = "";
        }, 3000);
      })
      .catch((err) => {
        console.log("An error occurred while deleting message:", err);
      });
  };

  const handleEditMessage = (messageID) => {
    console.log("Editing message:", messageID);
    editMessage(messageID);
  };

  const editMessage = (messageID) => {
    const editedMessage = messages.find((msg) => msg.id === messageID);
    const contentText = document.getElementById(`contentText-${messageID}`);
    contentText.contentEditable = true;
    contentText.focus();
  
    contentText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        contentText.contentEditable = false;
        const newContent = contentText.innerText;
        console.log("New content:", newContent);

        axios
          .put(
            `http://localhost:7979/privateMessages/edit/${messageID}`,
            {
              content: newContent,
            },
            {
              headers: {
                "x-access-token": localStorage.getItem("token"),
              },
            }
          )
          .then((res) => {
            console.log("Message updated:", res.data);
            const prompt = document.querySelector(".variousPromptsText");
            prompt.innerText = "Message updated successfully!";
            setTimeout(() => {
              prompt.innerText = "";
            }, 3000);
            getMessages(chatID);

          })
          .catch((err) => {
            console.log("An error occurred while updating message:", err);
          });
      }
    });
  };
  
const toggleToDoPopup = () => {
  setIsToDoPopupOpen(!isToDoPopupOpen);
  
};

const sendToToDo = (messageContent) => {
  setToDoPopUpContent(messageContent);
  toggleToDoPopup();
}

const handleAttachedFile = (e) => {
  e.preventDefault();
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
}


const handleFileChange = (event) => {
  const file = event.target.files[0];
  setAttachedFile(file);
  console.log('FISIEEER :', file);
  //AICI TO DO
}

  return (
    <div className="private-container">
      {isToDoPopupOpen && (
       <ToDoPopUp toDoListContent={toDoPopUpContent} userID={userId} onClose={toggleToDoPopup} />
      )}
      <div className="privateChatHeader">
        <div className="privateTitle">
          <div className="privateTitleRight">
            <h1>
              {otherUserDetails && otherUserDetails.firstname}{" "}
              {otherUserDetails && otherUserDetails.lastname}
            </h1>
            <div className="userDetails">
              {otherUserDetails && otherUserDetails.about}
            </div>
          </div>
        </div>
        <img
          src={photoURL}
          alt="groupPicture"
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            padding: "2vh",
          }}
        />
      </div>

      <div className="privateChatBody">
        <div className="chatMessages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.user_id === userId ? "myMessage" : ""
              }`}
            >
              <div className="messageContent">
                <p>
                  <span id="usernameStyling">
                  {usernames[message.user_id]
                    ? usernames[message.user_id].username + ": "
                    : ""}
                    </span>
                </p>
                <p id={`contentText-${message._id}`}>
                  {message.is_deleted
                    ? "Message has been deleted"
                    : message.content}
                  {message.is_edited && (
                    <span className="edited-indicator">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </span>
                  )}
                </p>
                <p>{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>

              <div className="messageButtons">
                {message.user_id === userId && (message.is_deleted==false) && (
                  <div className="messageButtons">
                    <button
                      className="deleteButton"
                      onClick={() => deleteMessage(message._id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    <button className="editButton" onClick={() => handleEditMessage(message._id)}>
                    <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                )}
                {message.user_id !== userId && (message.is_deleted==false) && (
                  <button
                    className="sendToToDoButton"
                    onClick={() => sendToToDo(message.content)}
                  >
                    <FontAwesomeIcon icon={faTasks} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chatFooterPrivate">
        <div className="messageInput">
          {chatID && (
            <input
              type="text"
              id="messageInput"
              placeholder="Type your message here..."
            />
          )}
          {chatID && <button onClick={handleSendMessage}>Send</button>}
        </div>
        <div className="attachButtons"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '5px',
          height: '5vh',
        }}>

        <button id='attachImage'
        style={{
          borderRadius: '50',
          padding: '5px',
          backgroundColor: '#dbcdf0',
          marginLeft: '3px',
          marginRight:'1vh'
        }}
        onClick={handleAttachedFile}
        ><FontAwesomeIcon icon={faImage} style={{ fontSize:'2.2vh'}} /></button>
        <input type='file' ref = {fileInputRef} id='fileInput' style={{display:'none'}} onChange={handleFileChange}/>

        <button id='attachFile'
        style={{
          borderRadius: '50',
          padding: '5px',
          backgroundColor: '#f7d9c4'
        }}
        onClick={handleAttachedFile}
        ><FontAwesomeIcon icon={faPaperclip} style={{ fontSize:'2.2vh'}} /></button>
        
      </div>
      </div>
      <div className="variousPromptsText"></div>
    </div>
  );
}

export default PrivateChat;
