import axios from "axios";
import React from "react";

const apiBaseUrl = "http://localhost:3000/api";

const ChatCreator = ({ token, onChatCreated, onSelectChat }) => {
  const createChat = async () => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/chat/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newChatSessionId = response.data.chatSessionId;
      console.log("newChatId", newChatSessionId);
      onChatCreated(newChatSessionId); // Вызываем callback после создания чата
      onSelectChat(newChatSessionId); // Автоматически переключаемся на новый чат
    } catch (error) {
      console.error("Ошибка при создании чата:", error);
    }
  };

  return <button onClick={createChat}>Создать новый чат</button>;
};

export default ChatCreator;
