import React, { useState, useEffect, useRef } from "react";
import "../components-style/GroupChat.css";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import ToDoPopUp from "./ToDoPopUp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faTasks, faEdit, faPencilAlt, faImage, faPaperclip, faMicrophone } from "@fortawesome/free-solid-svg-icons";

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
  const fileInputRef = React.createRef();
  const [attachedFile, setAttachedFile] = useState(null);
  const imageInputRef = React.createRef();
  const [attachedImage, setAttachedImage] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    getGroupProfilePhoto();
    if (groupID) {
      socket.emit("join group chat", { roomId: groupID });
    }
    console.log(user);

    socket.on("chat group client", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("delete group message", (userID, timestamp, groupID) => {
      console.log("Delete sent from server", userID, timestamp, groupID);
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message.user_id === userID && message.timestamp === timestamp) {
            return {
              ...message,
              is_deleted: true,
              fileName: null,
              imageName: null,
              imageObject: message.imageObject ? null : message.imageObject,
            };
          }
          return message;
        });
      });
      console.log("Messages after delete:", messages);
    });

    socket.on("edit group message", (newContent, chatID, timestamp) => {
      console.log('Edit sent from server', newContent, chatID, timestamp);
    
      setMessages(prevMessages => {
        return prevMessages.map((message) => {
          if (message.timestamp === timestamp) {
            return {
              ...message,
              content: newContent,
              is_edited: true,
            };
          }
          return message;
        });
      });
      console.log('Messages after edit:', messages);
    });

    return () => {
      if (groupID) {
        socket.emit("leave group chat", { roomId: groupID });
      }
      socket.off("chat group client");
    };
  }, [groupID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    if (messageInput === "") {
      alert("Please enter a message");
      return;
    }

    const messageObj = {
      user_id: user_id,
      group_id: groupID,
      content: messageInput,
      timestamp: timestamp,
      fileName: attachedFile ? user_id + timestamp + attachedFile.name : null,
      imageName: attachedImage
        ? user_id + timestamp + attachedImage.name
        : null,
      imageObject: attachedImage,
    };

    const formData = new FormData();

    if (attachedFile) {
      formData.append("file", attachedFile);
      axios
        .post(
          "http://localhost:7979/photos/uploadMessageAttachment/" +
            messageObj.fileName,
          formData,
          {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          }
        )
        .then((res) => {
          console.log("File uploaded successfully:", res.data);
        })
        .catch((error) => {
          console.error("An error occurred while uploading the file:", error);
        });
    } else if (attachedImage) {
      formData.append("file", attachedImage);
      axios
        .post(
          "http://localhost:7979/photos/uploadMessageAttachment/" +
            messageObj.imageName,
          formData,
          {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          }
        )
        .then((res) => {
          console.log("Image uploaded successfully:", res.data);
        })
        .catch((error) => {
          console.error("An error occurred while uploading the image:", error);
        });
    }

    console.log("Message:", messageObj);

    socket.emit("chat group server", messageObj);
    setMessageInput("");
    setAttachedFile(null);
    setAttachedImage(null);
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

  const deleteMessage = (messageUserID, messageTimestamp, messageGroupID) => {
    axios
      .delete(`http://localhost:7979/groupMessages/deleteMsg/${messageUserID}/${messageTimestamp}/${messageGroupID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          socket.emit("delete group message", messageUserID, messageTimestamp, messageGroupID);
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

  const editMessage = (messageContent, messageChatID, messageTimestamp) => {
    console.log("Edit", messageContent, messageChatID, messageTimestamp);
    const editedMessage = messages.find( (message) => message.content === messageContent && message.chat_id === messageChatID && message.timestamp === messageTimestamp);
    const contentText = document.getElementById(`contentText-${messageTimestamp} - ${messageChatID}`);
    contentText.contentEditable = true;
    contentText.focus();

    contentText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        contentText.contentEditable = false;
        const newContent = contentText.innerText;
        console.log("New content:", newContent);

        axios
          .put(
            `http://localhost:7979/groupMessages/editMsg/${messageChatID}/${messageTimestamp}`,
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
              socket.emit("edit group message", newContent, messageChatID, messageTimestamp);
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
    return userProfiles[userID] ? userProfiles[userID] : placeholderAvatar;
  };

  const handleAttachedFile = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAttachedFile(file);
    console.log("FISIEEER :", file);
  };

  const handleAttachedFileImage = (e) => {
    e.preventDefault();
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleFileImageChange = (event) => {
    const file = event.target.files[0];
    if (file.type.split("/")[0] !== "image") {
      alert("Please select an image file");
      return;
    } else {
      setAttachedImage(file);
      console.log("FISIEEER :", file);
    }
  };

  const handleAttachmentClick = (userID, timestamp) => {
    return (event) => {
      const target = event.target;
      if (target.tagName === "P") {
        const fileName = target.innerText;
        const newFileName = userID + timestamp + fileName;

        console.log("New Filename:", newFileName);

        const fileURL = `http://localhost:7979/photos/getMessageAttachment/${newFileName}`;

        console.log("File URL:", fileURL);
        window.open(fileURL, "_blank");
      }
    };
  };

  const handlePhotoClick = (event) => {
    const target = event.target;
    const image = new Image();
    image.src = target.src;
    const w = window.open("");
    w.document.write(image.outerHTML);
  };

  const parseFileName = (fileName, userID, timestamp) => {
    const split = fileName.split(userID + timestamp);
    return split[1];
  };

  function arrayBufferToDataURL(arrayBuffer, mimeType) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = new Blob([uint8Array], { type: mimeType });
    const urlCreator = window.URL || window.webkitURL;
    console.log("URL:", urlCreator.createObjectURL(blob));
    return urlCreator.createObjectURL(blob);
  }

  const handleSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      alert("Speak now! :) Click on ok to view the message in the input field.");
    };

    recognition.start();

    recognition.onresult = (event) => {
      const message = event.results[0][0].transcript;
      console.log("Message:", message);
      setMessageInput(message);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          Loading group messages...
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
                    <div className="messageHeader">
                    <p>
                      <span id="usernameStyling">
                        {usernames[message.user_id]
                          ? message.user_id === 0
                            ? "DeletedUser"
                            : usernames[message.user_id].username
                          : ""}
                      </span>
                    </p>
                    <p id="messageTimestamp">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                    

                    <p id={`contentText-${message.timestamp} - ${message.group_id}`}>
                      {message.is_deleted
                        ? "Message has been deleted"
                        : message.content}
                      {message.is_edited && (
                        <span className="edited-indicator">
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </span>
                      )}
                    </p>
                   
                    <div
                      className="attachments"
                      onClick={handleAttachmentClick(
                        message.user_id,
                        message.timestamp
                      )}
                      style={{
                        margin: "5px 0",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {message.fileName && (
                        <p style={{ cursor: "pointer" }}>
                          {" "}
                          {parseFileName(
                            message.fileName,
                            message.user_id,
                            message.timestamp
                          )}{" "}
                        </p>
                      )}

                      {message.imageObject && (
                        <img
                          src={arrayBufferToDataURL(
                            message.imageObject,
                            message.imageObject.contentType
                          )}
                          alt="attachedImage"
                          style={{
                            width: "90%",
                            height: "90%",
                            maxWidth: "300px",
                            maxHeight: "300px",
                            borderRadius: "10px",
                           
                            cursor: "pointer",
                          }}
                          onClick={handlePhotoClick}
                        />
                      )}

                      {!message.imageObject && message.imageName && (
                        <img
                          src={`http://localhost:7979/photos/getMessageAttachment/${message.imageName}`}
                          alt="attachedImage"
                          style={{
                            width: "90%",
                            height: "90%",
                            maxWidth: "300px",
                            maxHeight: "300px",
                            borderRadius: "10px",
                            cursor: "pointer",
                          }}
                          onClick={handlePhotoClick}
                        />
                      )}
                    </div>
                  </div>

                  <div className="messageButtons">
                    {((message.user_id === userId && !message.is_deleted) ||
                      isCurrentUserAdmin) &&
                      !message.is_deleted && (
                        <button
                          className="deleteButton"
                          onClick={() => deleteMessage(message.user_id, message.timestamp, message.group_id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    {message.user_id === userId && !message.is_deleted && (
                      <button
                        className="editButton"
                        onClick={() => editMessage(message.content, message.group_id, message.timestamp)}
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
              <div ref={messagesEndRef} />
            </div>
            
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
                
              </div>
              {groupID && <button onClick={handleSendMessage}>Send</button>}
              <div
                className="attachButtons"
                style={{
                  display: "flex",
                  padding: "5px",
                  height: "5vh",
                }}
              >
                <button id="speechToText"
                  style={{
                    borderRadius: "50",
                    padding: "5px",
                    backgroundColor: "#b5e7a0",
                    marginLeft: "3px",
                    marginRight: "1vh",
                  }}
                  onClick={handleSpeechToText}
                >
                  <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: "2.2vh" }} />
                </button>
                <button
                  id="attachImage"
                  style={{
                    borderRadius: "50",
                    padding: "5px",
                    backgroundColor: "#dbcdf0",
                    marginLeft: "3px",
                    marginRight: "1vh",
                  }}
                  onClick={handleAttachedFileImage}
                >
                  <FontAwesomeIcon
                    icon={faImage}
                    style={{ fontSize: "2.2vh" }}
                  />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  id="imageInput"
                  style={{ display: "none" }}
                  onChange={handleFileImageChange}
                />

                <button
                  id="attachFile"
                  style={{
                    borderRadius: "50",
                    padding: "5px",
                    backgroundColor: "#f7d9c4",
                  }}
                  onClick={handleAttachedFile}
                >
                  <FontAwesomeIcon
                    icon={faPaperclip}
                    style={{ fontSize: "2.2vh" }}
                  />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  id="fileInput"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
              {(attachedFile || attachedImage) && (
                <div id="attachedFile">
                  {attachedFile && <p>Attached file: {attachedFile.name}</p>}
                  {attachedImage && (
                    <p>Attached image: {attachedImage.name}</p>
                  )}
                </div>
              )}

              <div className="variousPromptsText"></div>
            </div>
        </div>
      )}
    </div>
  );
}
export default GroupChat;
