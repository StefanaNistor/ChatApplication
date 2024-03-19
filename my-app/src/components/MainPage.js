import React, { useState } from "react";
import "../components-style/MainPage.css";
import NavBar from "./NavBar";
import ChatNavBar from "./ChatNavBar";
import GroupChat from "./GroupChat";
import PrivateChat from "./PrivateChat";

function MainPage() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState(null);

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
        {selectedChatType === "private" && selectedChatId && (
          <PrivateChat chatID={selectedChatId} />
        )}
        {selectedChatType === "group" && selectedChatId && (
          <GroupChat groupID={selectedChatId} />
        )}
      </div>
    </div>
  );
}

export default MainPage;
