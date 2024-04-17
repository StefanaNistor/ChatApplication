import React, { useState, useEffect } from "react";
import "../components-style/GroupChat.css";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import ToDoPopUp from "./ToDoPopUp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

function GroupChat({ groupID }) {
  const [selectedGroupChat, setSelectedGroupChat] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [isToDoPopupOpen, setIsToDoPopupOpen] = useState(false);
  const [toDoPopUpContent, setToDoPopUpContent] = useState("");
  const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/70");
  const placeholderAvatar = "https://via.placeholder.com/30";
  const [userProfiles, setUserProfiles] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id;

  const isCurrentUserAdmin = user.isAdmin;
  const navigate = useNavigate();

  const socket = io("http://localhost:7979");

  useEffect(() => {
    getGroupProfilePhoto();
    if (groupID) {
      socket.emit("join group chat", { roomId: groupID });
    }
    console.log(user);

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

  const showMemberList = () => {
    setShowMembers(!showMembers);
  };

  const getMembers = () => {
    axios
      .get(`http://localhost:7979/groupChat/members/${groupID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setGroupMembers(res.data);
        getGroupPhotos(res.data);
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
    if (userID === 0) {
      return { username: "DeletedUser" };
    } else {
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
  }

  function promiseAll(groupMembers) {
    return Promise.all(
      groupMembers.map(async (member) => {
        try {
          const filename = member.id + "profilePic.jpg";
          const response = await axios.get(
            `http://localhost:7979/photos/getPhoto/${member.id}?filename=${filename}`,
            {
              headers: {
                "x-access-token": localStorage.getItem("token"),
              },
              responseType: "blob",
            }
          );
          const url = URL.createObjectURL(response.data);
          userProfiles[member.id] = url;
        } catch (error) {
          console.error("An error occurred while getting user photo:", error);
          userProfiles[member.id] = placeholderAvatar;
        }
      })
    );
  }

  async function getGroupPhotos(groupMembers) {
    const promises = await promiseAll(groupMembers);
    if (promises) {
      console.log("Aici ar trebui sa fie poze", userProfiles);
      setLoadingProfiles(false);
    }
  }

  useEffect(() => {
    if (groupID === "") {
      return;
    } else {
      getSelectedGroupChat(groupID);
      getMessages(groupID);
      getMembers();
      console.log("Members", groupMembers);
      console.log("GRP PHOYO", photoURL);
    }
  }, [groupID]);

  useEffect(() => {
    fetchUsernames();
  }, [messages]);

  function getGroupProfilePhoto() {
    const filename = groupID + "groupPic.jpg";
    axios
      .get(
        `http://localhost:7979/photos/getPhoto/${groupID}?filename=${filename}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        setPhotoURL(url);
      })
      .catch((err) => {
        console.log("Group has no photo!");
        setPhotoURL("https://via.placeholder.com/70");
      });
  }

  const deleteMessage = (messageID) => {
    axios
      .delete(`http://localhost:7979/groupMessages/deleteMsg/${messageID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const prompt = document.querySelector(".variousPromptsText");
          prompt.innerText = "Message deleted successfully!";
          setTimeout(() => {
            prompt.innerText = "";
          }, 3000);

          getMessages(groupID);
        } else {
          console.log("An error occurred while deleting the message!");
        }
      })
      .catch((err) => {
        console.log("An error occurred while deleting the message!");
      });
  };

  const toggleToDoPopup = () => {
    setIsToDoPopupOpen(!isToDoPopupOpen);
  };

  const sendToToDo = (messageContent) => {
    setToDoPopUpContent(messageContent);
    toggleToDoPopup();
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
            `http://localhost:7979/groupMessages/editMsg/${messageID}`,
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
            if (res.status === 200) {
              const prompt = document.querySelector(".variousPromptsText");
              prompt.innerText = "Message edited successfully!";
              setTimeout(() => {
                prompt.innerText = "";
              }, 3000);
              getMessages(groupID);
            } else {
              console.log("An error occurred while editing the message!");
            }
          })
          .catch((err) => {
            console.log("An error occurred while editing the message!");
          });
      }
    });
  };

  const getUserProfilePhotoById = (userID) => {
    // console.log("Profileuri", userProfiles);
    // console.log("Linkul cel bun", userProfiles[userID]);
    return userProfiles[userID] ? userProfiles[userID] : placeholderAvatar;
  };

  return (
    <div>
      {loadingProfiles ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
            fontSize: "20px",
          }}
        >
          Loading user profiles...
        </div>
      ) : (
        <div className="groupChat-container">
          {isToDoPopupOpen && (
            <ToDoPopUp
              toDoListContent={toDoPopUpContent}
              userID={userId}
              onClose={toggleToDoPopup}
            />
          )}
          <div className="groupChatHeader">
            <div className="rightHeader">
              <div className="privateTitleRight">
                <h1 id="groupTitle">{selectedGroupChat.groupname}</h1>
                <div className="userDetails" id="groupDescription">
                  {selectedGroupChat.description}
                </div>
              </div>
              <div>
                <button onClick={showMemberList}>Show Group Members</button>
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
                <div
                  key={index}
                  className={`message ${
                    message.user_id == userId ? "myMessage" : ""
                  }`}
                >
                  <img
                    src={getUserProfilePhotoById(message.user_id)}
                    alt="ProfilePic"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      padding: "2vh",
                    }}
                  />
                  <div
                    className={`messageContent ${
                      message.user_id === userId ? "myMessageContent" : ""
                    }`}
                  >
                    <p>
                      <span id="usernameStyling">
                        {usernames[message.user_id]
                          ? message.user_id === 0
                            ? "DeletedUser"
                            : usernames[message.user_id].username
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
                    {((message.user_id === userId && !message.is_deleted) ||
                      isCurrentUserAdmin) &&
                      !message.is_deleted && (
                        <button
                          className="deleteButton"
                          onClick={() => deleteMessage(message._id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    {message.user_id === userId && !message.is_deleted && (
                      <button
                        className="editButton"
                        onClick={() => editMessage(message._id)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                    {message.user_id !== userId && !message.is_deleted && (
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
                <div
                  className="attachButtons"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px",
                    height: "5vh",
                  }}
                >
                  <button
                    id="attachImage"
                    style={{
                      borderRadius: "50",
                      padding: "5px",
                      backgroundColor: "#dbcdf0",
                      marginLeft: "3px",
                      marginRight: "1vh",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faImage}
                      style={{ fontSize: "2.2vh" }}
                    />
                  </button>
                  <button
                    id="attachFile"
                    style={{
                      borderRadius: "50",
                      padding: "5px",
                      backgroundColor: "#f7d9c4",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPaperclip}
                      style={{ fontSize: "2.2vh" }}
                    />
                  </button>
                </div>

                <div className="variousPromptsText"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default GroupChat;
