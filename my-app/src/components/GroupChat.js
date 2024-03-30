import React, { useState, useEffect } from "react";
import "../components-style/GroupChat.css";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import OtherProfile from "./OtherProfile";

function GroupChat({ groupID }) {
  const [selectedGroupChat, setSelectedGroupChat] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/70");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id;

  const navigate = useNavigate();

  const socket = io("http://localhost:7979");

  useEffect(() => {
    getGroupProfilePhoto();
    if (groupID) {
      socket.emit("join group chat", { roomId: groupID });
    }

    socket.on("chat group client", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (groupID) {
        socket.emit("leave group chat", { roomId: groupID });
      }
      socket.off("chat group client");
    };
  }, [groupID]);

  const getMembers = () => {
    setShowMembers(!showMembers);
    axios
      .get(`http://localhost:7979/groupChat/members/${groupID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setGroupMembers(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting group members!");
      });
  };

  function getSelectedGroupChat(groupID) {
    axios
      .get(`http://localhost:7979/groupChat/getGroup/${groupID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSelectedGroupChat(res.data);
        } else {
          console.log(
            "An error occurred while getting group chat:",
            res.data.message
          );
        }
      })
      .catch((err) => {
        console.log("An error occurred while getting group chats:", err);
      });
  }

  function getMessages(groupID) {
    axios
      .get(`http://localhost:7979/groupMessages/getByGroup/${groupID}`, {
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

  const handleSendMessage = () => {
    const timestamp = new Date().toISOString();
    const user_id = JSON.parse(localStorage.getItem("user")).id;

    const messageObj = {
      user_id: user_id,
      group_id: groupID,
      content: messageInput,
      timestamp: timestamp,
    };

    console.log("Message:", messageObj);

    socket.emit("chat group server", messageObj);
    setMessageInput("");
  };

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

  useEffect(() => {
    if (groupID === "") {
      return;
    } else {
      getSelectedGroupChat(groupID);
      getMessages(groupID);
    }
  }, [groupID]);

  useEffect(() => {
    fetchUsernames();
  }, [messages]);

  function getGroupProfilePhoto(){
    const filename = groupID + 'groupPic.jpg';
    axios.get(`http://localhost:7979/photos/getPhoto/${groupID}?filename=${filename}`, {
      headers: {
        "x-access-token": localStorage.getItem('token'),
      },
      responseType: 'blob' 
    }).then((res) => {
      const url = URL.createObjectURL(res.data);
      setPhotoURL(url);
    }).catch((err)=>{
      console.log("Group has no photo!");
      setPhotoURL("https://via.placeholder.com/70");
    })
  }

  return (
    <div className="groupChat-container">
      <div className="groupChatHeader">
        <div className="rightHeader">
          <div className="privateTitleRight">
            <h1 id="groupTitle">{selectedGroupChat.groupname}</h1>
            <div className="userDetails" id="groupDescription">
              {selectedGroupChat.description}
            </div>
          </div>
          <div>
            <button onClick={getMembers}>Show Group Members</button>
            {showMembers && (
              <div className="showMembersOverlay">
                <ul>
                  {groupMembers.map((member, index) => (
                    <li
                      key={index}
                      onClick={
                        member.id === userId
                          ? null
                          : () => navigate(`/otherProfile/${member.id}`)
                      }
                    >
                      {member.id === userId ? "You" : member.username}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
      <div className="groupChatBody">
        <div className="chatMessages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <p>
                {usernames[message.user_id]
                  ? message.user_id === 0
                    ? "DeletedUser"
                    : usernames[message.user_id].username + ": "
                  : ""}
              </p>
              <p>{message.content}</p>
              <p>{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
        <div className="chatFooter">
          <div className="messageInput">
            {groupID && (
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message here..."
              />
            )}
            {groupID && <button onClick={handleSendMessage}>Send</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
