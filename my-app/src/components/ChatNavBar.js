import React, { useState, useEffect } from "react";
import "../components-style/ChatNavBar.css";
import axios from "axios";

function ChatNavBar({ onPrivateChatRoomClick, onGroupChatRoomClick }) {
  const [activeButton, setActiveButton] = useState("privateChat");
  const [groupChats, setGroupChats] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [fullInfo, setFullInfo] = useState([]);
  const [groupChatsFetched, setGroupChatsFetched] = useState(false);
  const [privateChatsFetched, setPrivateChatsFetched] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userID = user.id;

  useEffect(() => {
    console.log("User ID:", userID);
  }, []);

  useEffect(() => {
    if (activeButton === "groupChat" && !groupChatsFetched) {
      fetchGroupChats();
      setGroupChatsFetched(true);
      setPrivateChatsFetched(false);
    }

    if (activeButton === "privateChat" && !privateChatsFetched) {
      fetchPrivateChats();
      setPrivateChatsFetched(true);
      setGroupChatsFetched(false);
    }
  }, [activeButton]);

  function getFullInfo(chats) {
    const fullInfoArray = [];
    chats.map((chat) => {
      const fullInfoObj = {
        id: chat.chat_id,
        username: "",
        user1_id: chat.user1_id,
        user2_id: chat.user2_id,
      };

      axios
        .get(`http://localhost:7979/users/username/${chat.user2_id}`, {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        })
        .then((res) => {
          fullInfoObj.username = res.data.username;
          fullInfoArray.push(fullInfoObj);
          setFullInfo([...fullInfoArray]); // Update fullInfo with new data
        })
        .catch((err) => {
          console.log("An error occurred while getting username!");
        });
    });
  }

  const fetchPrivateChats = () => {
    axios
      .get(`http://localhost:7979/privateChat/getByCurrentUser/${userID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setPrivateChats(res.data);
        getFullInfo(res.data); // Get full info for private chats
      })
      .catch((err) => {
        console.log("An error occurred while getting private chats!");
      });
  };

  const fetchGroupChats = () => {
    axios
      .get(`http://localhost:7979/groupChat/${userID}`, {
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setGroupChats(res.data);
      })
      .catch((err) => {
        console.log("An error occurred while getting group chats!");
      });
  };

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const handleChatRoomClick = (chatId) => {
    if (activeButton === "privateChat") {
      onPrivateChatRoomClick(chatId);
    } else if (activeButton === "groupChat") {
      onGroupChatRoomClick(chatId);
    }
  };

  const renderPrivateChats = () => {
    return fullInfo.map((privateChat) => (
      <div
        key={privateChat.id}
        className="privateChat" // Change class name to differentiate private chats
        onClick={() => handleChatRoomClick(privateChat.id)}
      >
        {privateChat.username}
      </div>
    ));
  };

  const renderGroupChats = () => {
    return groupChats.map((groupChat) => (
      <div
        key={groupChat.id}
        className="groupChat"
        onClick={() => handleChatRoomClick(groupChat.id)}
      >
        {groupChat.groupname}
      </div>
    ));
  };

  return (
    <div className="chatNavBar-container">
      <div className="chatNavBar">
        <div id="chatOptions">
          <button
            id="privateChat"
            className={activeButton === "privateChat" ? "active" : ""}
            onClick={() => handleButtonClick("privateChat")}
          >
            Private Chats
          </button>
          <div className="dropdownPrivate">
            {privateChatsFetched && (
              <div className="dropPrivateContent">{renderPrivateChats()}</div>
            )}
          </div>
          <button
            id="groupChat"
            className={activeButton === "groupChat" ? "active" : ""}
            onClick={() => handleButtonClick("groupChat")}
          >
            Group Chats
          </button>
          <div className="dropdownGroup">
            {groupChatsFetched && (
              <div className="dropGroupContent">{renderGroupChats()}</div>
            )}
          </div>
        </div>
        <input type="text" placeholder="Search..." id="searchBar" />
      </div>
    </div>
  );
}

export default ChatNavBar;
