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
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

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
  const userId = user.id;
  const isCurrentUserAdmin = user.isAdmin;
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [loadingImages, setLoadingImages] = useState(true);
  const [imageAttachments, setImageAttachments] = useState({});

  useEffect(() => {
    if (chatID) {
      getMessages(chatID);
      setLoadingImages(true);
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
        getImageAttachments(res.data);
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
      console.log("Message received:", message);
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

  function arrayBufferToDataURL(arrayBuffer, mimeType) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = new Blob([uint8Array], { type: mimeType });
    const urlCreator = window.URL || window.webkitURL;
    console.log("URL:", urlCreator.createObjectURL(blob));
    return urlCreator.createObjectURL(blob);
  }

  const handleSendMessage = () => {
    const timestamp = new Date().toISOString();
    const user_id = JSON.parse(localStorage.getItem("user")).id;
    const messageInput = document.getElementById("messageInput").value;

    if (!messageInput) {
      alert("Please type a message");
      return;
    }

    const messageObj = {
      user_id: user_id,
      chat_id: chatID,
      content: messageInput,
      timestamp: timestamp,

      fileName: attachedFile ? user_id + timestamp + attachedFile.name : null,
      imageName: attachedImage
        ? user_id + timestamp + attachedImage.name
        : null,
      imageObject: attachedImage,
    };

    console.log("Message:", messageObj);
    console.log("Message image", messageObj.imageObject);

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

    socket.emit("chat private server", messageObj);
    setMessageInput("");
    //setMessages((prevMessages) => [...prevMessages, messageObj]);

    const message = document.getElementById("messageInput");
    message.value = "";
    setAttachedFile(null);
    setAttachedImage(null);
  };

  const deleteMessage = (messageID) => {
    axios
      .delete(`http://localhost:7979/privateMessages/deleteMsg/${messageID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
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
  };

  const handleAttachedFile = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAttachedFile(file);
    console.log("FISIEEER :", file);
  };

  const handleAttachmentClick = (userID, timestamp) => {
    return (event) => {
      const target = event.target;
      if (target.tagName === "P") {
        const fileName = target.innerText;
        const newFileName = userID + timestamp + fileName;

        console.log("New Filename:", newFileName); // Check newFileName value

        const fileURL = `http://localhost:7979/photos/getMessageAttachment/${newFileName}`;

        console.log("File URL:", fileURL); // Check fileURL value

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

  async function promiseAll(messages) {
    const promises = messages.map(async (message) => {
      if (message.imageName && !message.is_deleted) {
        const response = await axios.get(
          `http://localhost:7979/photos/getMessageAttachment/${message.imageName}`,
          {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
            responseType: "blob",
          }
        );
        const url = URL.createObjectURL(response.data);
        imageAttachments[message._id] = url;
      }
    });
    return Promise.all(promises);
  }

  async function getImageAttachments(messages) {
    const promise = await promiseAll(messages);
    if (promise) {
      setLoadingImages(false);
    }
  }

  const parseFileName = (fileName, userID, timestamp) => {
    //  userid + timestamp of the message + filename

    // console.log('FILENAME:', fileName);
    // console.log('USERID:', userID);
    // console.log('TIMESTAMP:', timestamp);
    const split = fileName.split(userID + timestamp);
    return split[1];
  };

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
      const speechToText = event.results[0][0].transcript;
      const messageInput = document.getElementById("messageInput");
      messageInput.value = speechToText;
    };
  };

  return (
    <>
      {loadingImages ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
            fontSize: "20px",
          }}
        >
          Loading private messages...
        </div>
      ) : (
        <div className="private-container">
          {isToDoPopupOpen && (
            <ToDoPopUp
              toDoListContent={toDoPopUpContent}
              userID={userId}
              onClose={toggleToDoPopup}
            />
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
                            width: "100px",
                            height: "100px",
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
                          src={
                            imageAttachments[message._id]
                              ? imageAttachments[message._id]
                              : "https://via.placeholder.com/70"
                          }
                          alt="attachedImage"
                          style={{
                            width: "100px",
                            height: "100px",
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
            <div
              className="attachButtons"
              style={{
                display: "flex",
                justifyContent: "space-between",
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
                <FontAwesomeIcon icon={faImage} style={{ fontSize: "2.2vh" }} />
              </button>
              <input
                type="file"
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
                <p>
                  Attachement:{" "}
                  {attachedFile ? attachedFile.name : attachedImage.name}
                </p>
              </div>
            )}
          </div>
          <div className="variousPromptsText"></div>
        </div>
      )}
    </>
  );
}

export default PrivateChat;
