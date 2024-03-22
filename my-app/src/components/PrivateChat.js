import React, { useState, useEffect } from "react";
import "../components-style/PrivateChat.css";
import axios from "axios";
import io from "socket.io-client";

function PrivateChat({ chatID }) {
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [otherUser, setOtherUser] = useState({});

  useEffect(() => {
    if (chatID) {
      getMessages(chatID);
    }
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

  const socket = io("http://localhost:7979");

  function getOtherUser(chatID) {
    let chat = {};
    axios
      .get(`http://localhost:7979/privateChat/getByCurrentUser/${chatID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        console.log("Other user:", res.data);
        chat = res.data;
      })
      .catch((err) => {
        console.log("An error occurred while getting other user:", err);
      });

    if (chat.user1_id === JSON.parse(localStorage.getItem("user")).id) {
      setOtherUser(chat.user2_id);
    } else {
      setOtherUser(chat.user1_id);
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

  return (
    <div className="private-container">
      <div className="privateChatHeader">
      </div>

      <div className="privateChatBody">
        <div className="chatMessages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <p>
                {usernames[message.user_id]
                  ? usernames[message.user_id].username + ": "
                  : ""}
              </p>
              <p>{message.content}</p>
              <p>{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="chatFooter">
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
        <div className="attachButtons"></div>
      </div>
    </div>
  );
}

export default PrivateChat;
