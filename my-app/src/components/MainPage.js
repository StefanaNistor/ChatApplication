import React, { useState } from "react";
import "../components-style/MainPage.css";
import NavBar from "./NavBar";
import ChatNavBar from "./ChatNavBar";
import GroupChat from "./GroupChat";
import PrivateChat from "./PrivateChat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
function MainPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handlePrivateChatRoomClick = (chatId) => {
    setSelectedChatId(chatId);
    setSelectedChatType("private");
  };

  const handleGroupChatRoomClick = (chatId) => {
    setSelectedChatId(chatId);
    setSelectedChatType("group");
  };

  return (
    <div className="main-container">
      <NavBar />
      <div className="ChatNavBar">
        <ChatNavBar
          onPrivateChatRoomClick={handlePrivateChatRoomClick}
          onGroupChatRoomClick={handleGroupChatRoomClick}
        />
      </div>
      <div className="Chat">
        {selectedChatId ? (
          <>
            {selectedChatType === "private" && (
              <PrivateChat chatID={selectedChatId} />
            )}
            {selectedChatType === "group" && (
              <GroupChat groupID={selectedChatId} />
            )}
          </>
        ) : (
          <div className="placeholder">
            <p>Click on a chat and let's be productive today! 🌞</p>
           
          </div>
        )}
      </div>
    </div>
  );

}

export default MainPage;
