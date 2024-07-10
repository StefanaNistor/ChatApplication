import React, { useState, useEffect, useRef } from "react";
import "../components-style/PrivateChat.css";
import ToDoPopUp from "./ToDoPopUp";
import axios from "axios";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTrashAlt, faTasks, faEdit, faPencilAlt, faPaperclip, faMicrophone } from "@fortawesome/free-solid-svg-icons";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatID) {
      getMessages(chatID);
      setLoadingImages(true);
    }
    getOtherUser(chatID);
  }, [chatID]);

  useEffect(() => {
    if (chatID) {
      socket.emit("leave chat", { roomId: chatID });
      socket.emit("join private chat", { roomId: chatID });
      console.log(`Joined room: ${chatID}`);

      socket.on("chat private client", (message) => {
        console.log("Message received:", message);

        if (chatID === message.chat_id) {
          setMessages((prevMessages) => {
            const messageExists = prevMessages.some(
              (msg) =>
                msg.timestamp === message.timestamp &&
                msg.user_id === message.user_id &&
                msg.chat_id === message.chat_id &&
                msg.content === message.content
            );

            if (messageExists) {
              return prevMessages;
            }

            const newMessages = [...prevMessages, message];
            console.log("Updated messages:", newMessages);
            return newMessages;
          });
        }

        if (message.user_id !== userId && message.chat_id === chatID) {
          console.log("Aici ajunge?");
          socket.emit(
            "mark message as seen",
            userId,
            message.timestamp,
            message.chat_id
          );
        }
      });

      socket.on("message seen", (userID, timestamp, chatid) => {
        console.log("Message seen:", userID, timestamp, chatid);
        console.log("ChatID:", chatID);
        console.log("Chat ID from server:", chatid);
        if (chatid === chatID) {
          setMessages((prevMessages) => {
            return prevMessages.map((message) => {
              if (
                message.user_id === userID &&
                message.timestamp === timestamp &&
                message.chat_id === chatID
              ) {
                return {
                  ...message,
                  is_seen: true,
                };
              }
              return message;
            });
          });
        }
      });

      socket.on(
        "delete private message",
        (messageUserID, messageTimestamp, messageChatID) => {
          setMessages((prevMessages) => {
            return prevMessages.map((message) => {
              if (
                message.user_id === messageUserID &&
                message.timestamp === messageTimestamp &&
                message.chat_id === messageChatID
              ) {
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
        }
      );

      socket.on("edit private message", (newContent, chatID, timestamp) => {
        setMessages((prevMessages) => {
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
      });

      return () => {
        console.log(`Left room: ${chatID}`);
        socket.emit("leave chat", { roomId: chatID });
        socket.off("chat private client");
        socket.off("message seen");
        socket.off("delete private message");
        socket.off("edit private message");
      };
    }
  }, [chatID]);

  useEffect(() => {
    if (messages.length > 0) {
      const unseenMessages = messages.filter(
        (msg) => !msg.is_seen && msg.user_id !== userId
      );
      if (unseenMessages.length > 0) {
        unseenMessages.forEach((message) => {
          socket.emit(
            "mark message as seen",
            message.user_id,
            message.timestamp,
            message.chat_id
          );
        });
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  function markMessagesAsSeen(chatID, otherID) {
    axios
      .put(
        `http://localhost:7979/privateMessages/markAsSeenByChatandUser/${chatID}/${otherID}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        console.log("Messages marked as seen:", res.data);
      })
      .catch((err) => {
        console.log("An error occurred while marking messages as seen:", err);
      });
  }

  useEffect(() => {
    fetchUsernames();
  }, [messages]);

  async function getUserProfilePhoto(otherID) {
    if (typeof otherID !== "number") {
      console.error("Invalid otherUserID:", otherID);
      setPhotoURL("https://via.placeholder.com/70");
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
      setPhotoURL("https://via.placeholder.com/70");
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

      markMessagesAsSeen(chatID, otherUserId);

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
      imageName: attachedImage ? user_id + timestamp + attachedImage.name : null,
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
    setMessages((prevMessages) => {
      const messageExists = prevMessages.some(
        (msg) =>
          msg.timestamp === messageObj.timestamp &&
          msg.user_id === messageObj.user_id &&
          msg.chat_id === messageObj.chat_id &&
          msg.content === messageObj.content
      );

      if (messageExists) {
        return prevMessages;
      }

      const newMessages = [...prevMessages, messageObj];
      console.log("Updated messages for sender:", newMessages);
      return newMessages;
    });

    setAttachedFile(null);
    setAttachedImage(null);
  };

  const deleteMessage = (messageUserID, messageTimestamp, messageChatID) => {
    axios
      .delete(
        `http://localhost:7979/privateMessages/deleteMsg/${messageUserID}/${messageTimestamp}/${messageChatID}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        console.log("Message deleted:", res.data);
        getMessages(chatID);
        socket.emit(
          "delete private message",
          messageUserID,
          messageTimestamp,
          messageChatID
        );

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

  const editMessage = (messageContent, messageChatID, messageTimestamp) => {
    const editedMessage = messages.find(
      (message) =>
        message.content === messageContent &&
        message.chat_id === messageChatID &&
        message.timestamp === messageTimestamp
    );
    const contentText = document.getElementById(
      `contentText-${messageTimestamp} - ${messageChatID}`
    );
    contentText.contentEditable = true;
    contentText.focus();

    contentText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        contentText.contentEditable = false;
        const newContent = contentText.innerText;
        console.log("New content:", newContent);

        const chatID = editedMessage.chat_id;
        const timestamp = editedMessage.timestamp;
        axios
          .put(
            `http://localhost:7979/privateMessages/edit/${chatID}/${timestamp}`,
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
            socket.emit("edit private message", newContent, chatID, timestamp);
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
      alert(
        "Speak now! :) Click on ok to view the message in the input field."
      );
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
                  className={`message ${message.user_id === userId ? "myMessage" : ""}`}
                >
                  <div className="messageContent">
                    <div className="messageHeader">
                      <span id="usernameStyling">
                        {usernames[message.user_id]
                          ? usernames[message.user_id].username + ": "
                          : ""}
                      </span>
                      <p id="messageTimestamp">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <p>
                      {message.is_seen ? (
                        <span style={{ color: "green" }}>Seen</span>
                      ) : (
                        <span style={{ color: "red" }}>Delivered</span>
                      )}
                    </p>
                    <p id={`contentText-${message.timestamp} - ${message.chat_id}`}>
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
                    >
                      {message.fileName && (
                        <p style={{ cursor: "pointer", fontWeight: "bold" }
                        }>
                          {parseFileName(
                            message.fileName,
                            message.user_id,
                            message.timestamp
                          )}
                        </p>
                      )}
                      {message.imageObject instanceof ArrayBuffer ? (
                        <img
                          src={arrayBufferToDataURL(
                            message.imageObject,
                            message.imageObject.contentType
                          )}
                          alt=""
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
                      ) : message.imageObject instanceof File ? (
                        <img
                          src={URL.createObjectURL(message.imageObject)}
                          alt=""
                          style={{
                            width: "90%",
                            height: "90%",
                            maxWidth: "300px",
                            maxHeight: "300px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={handlePhotoClick}
                        />
                      ) : null}

                      {!message.imageObject && message.imageName && (
                        <img
                          src={
                            imageAttachments[message._id]
                              ? imageAttachments[message._id]
                              : "https://via.placeholder.com/70"
                          }
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
                          onClick={() =>
                            deleteMessage(
                              message.user_id,
                              message.timestamp,
                              message.chat_id
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    {message.user_id === userId && !message.is_deleted && (
                      <button
                        className="editButton"
                        onClick={() =>
                          editMessage(
                            message.content,
                            message.chat_id,
                            message.timestamp
                          )
                        }
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

          <div className="chatFooterPrivate">
            <div className="messageInput">
              {chatID && (
                <input
                  type="text"
                  id="messageInput"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message here..."
                />
              )}
              {chatID && <button onClick={handleSendMessage}>Send</button>}
            </div>
            <div className="attachButtons">
              <button
                id="speechToText"
                onClick={handleSpeechToText}
              >
                <FontAwesomeIcon
                  icon={faMicrophone}
                  style={{ fontSize: "2.2vh" }}
                />
              </button>
              <button
                id="attachImage"
                onClick={handleAttachedFileImage}
              >
                <FontAwesomeIcon icon={faImage} style={{ fontSize: "2.2vh" }} />
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
                  Attachment:{" "}
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
